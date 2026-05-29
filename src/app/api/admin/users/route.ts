import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const adminEmail = req.headers.get("x-admin-email");
  const admin = adminEmail
    ? await prisma.user.findFirst({ where: { email: adminEmail, role: "ADMIN" } })
    : null;

  if (!admin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      affiliation: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}
