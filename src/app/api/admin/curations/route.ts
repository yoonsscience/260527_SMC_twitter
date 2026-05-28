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

  const curations = await prisma.curation.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({ curations });
}

export async function POST(req: Request) {
  const adminEmail = req.headers.get("x-admin-email");
  const admin = adminEmail
    ? await prisma.user.findFirst({ where: { email: adminEmail, role: "ADMIN" } })
    : null;

  if (!admin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, imageUrl, issueIds } = body ?? {};

  if (!title || !description || !imageUrl || !Array.isArray(issueIds) || issueIds.length === 0) {
    return NextResponse.json({ error: "큐레이션 필수값이 누락되었습니다." }, { status: 400 });
  }

  await prisma.curation.updateMany({ where: { isActive: true }, data: { isActive: false } });

  const curation = await prisma.curation.create({
    data: {
      title,
      description,
      imageUrl,
      issueIds,
      isActive: true,
      createdBy: admin.id,
    },
  });

  return NextResponse.json({ message: "큐레이션 생성 완료", curation }, { status: 201 });
}
