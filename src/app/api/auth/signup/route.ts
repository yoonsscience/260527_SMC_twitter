import { NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, affiliation, email, password } = body ?? {};

  if (!name || !affiliation || !email || !password) {
    return NextResponse.json({ error: "필수 항목을 입력해 주세요." }, { status: 400 });
  }

  const exists = db.users.find((u) => u.email === email);
  if (exists) {
    return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
  }

  const user = {
    id: db.makeId("u"),
    name,
    affiliation,
    email,
    password,
    role: "USER" as const,
  };

  db.users.push(user);

  return NextResponse.json({
    message: "가입 완료",
    user: { id: user.id, name: user.name, affiliation: user.affiliation, email: user.email, role: user.role },
  });
}
