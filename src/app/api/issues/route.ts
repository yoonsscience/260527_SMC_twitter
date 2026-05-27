import { Category } from "@prisma/client";
import { NextResponse } from "next/server";
import { categoryMap } from "@/lib/category";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const issues = await prisma.issue.findMany({
    where: { status: { not: "HIDDEN" } },
    orderBy: { createdAt: "desc" },
    take: 9,
  });
  return NextResponse.json({ issues });
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
  const { title, description, imageUrl, tags, category, relatedIssueIds } = body ?? {};

  if (!title || !description || !imageUrl || !Array.isArray(tags) || !category) {
    return NextResponse.json({ error: "이슈 생성 필수값이 누락되었습니다." }, { status: 400 });
  }

  const mappedCategory = categoryMap[category as keyof typeof categoryMap] as Category | undefined;
  if (!mappedCategory) {
    return NextResponse.json({ error: "유효하지 않은 분야입니다." }, { status: 400 });
  }

  const issue = await prisma.issue.create({
    data: {
      title,
      description,
      imageUrl,
      tags,
      category: mappedCategory,
      relatedIssueIds: Array.isArray(relatedIssueIds) ? relatedIssueIds : [],
      createdBy: admin.id,
    },
  });

  return NextResponse.json({ message: "이슈 생성 완료", issue }, { status: 201 });
}
