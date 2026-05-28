import { IssueStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = req.headers.get("x-admin-email");
  const admin = adminEmail
    ? await prisma.user.findFirst({ where: { email: adminEmail, role: "ADMIN" } })
    : null;

  if (!admin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const body = await req.json();
  const { status } = body ?? {};

  if (!status || !["OPEN", "ARCHIVED", "HIDDEN"].includes(status)) {
    return NextResponse.json({ error: "유효하지 않은 상태값입니다." }, { status: 400 });
  }

  const { id } = await params;
  const issue = await prisma.issue.update({
    where: { id },
    data: { status: status as IssueStatus },
  });

  return NextResponse.json({ message: "상태 변경 완료", issue });
}
