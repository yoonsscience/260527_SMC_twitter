import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, affiliation, email, password } = body ?? {};

  if (!name || !affiliation || !email || !password) {
    return NextResponse.json({ error: "필수 항목을 입력해 주세요." }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { name, affiliation, email, password },
  });

  return NextResponse.json({
    message: "가입 완료",
    user: { id: user.id, name: user.name, affiliation: user.affiliation, email: user.email, role: user.role },
  });
}
