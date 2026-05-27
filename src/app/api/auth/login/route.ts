import { NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body ?? {};

  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return NextResponse.json({ error: "이메일 또는 비밀번호를 확인해 주세요." }, { status: 401 });
  }

  return NextResponse.json({
    message: "로그인 성공",
    token: `demo-${user.id}`,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
