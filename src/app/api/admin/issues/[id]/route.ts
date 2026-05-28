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
  const { status, title, description, imageUrl, tags } = body ?? {};

  const data: {
    status?: IssueStatus;
    title?: string;
    description?: string;
    imageUrl?: string;
    tags?: string[];
  } = {};

  if (status !== undefined) {
    if (!["OPEN", "ARCHIVED", "HIDDEN"].includes(status)) {
      return NextResponse.json({ error: "유효하지 않은 상태값입니다." }, { status: 400 });
    }
    data.status = status as IssueStatus;
  }

  if (title !== undefined) {
    if (!String(title).trim()) {
      return NextResponse.json({ error: "제목은 비워둘 수 없습니다." }, { status: 400 });
    }
    data.title = String(title).trim();
  }

  if (description !== undefined) {
    if (!String(description).trim()) {
      return NextResponse.json({ error: "설명은 비워둘 수 없습니다." }, { status: 400 });
    }
    data.description = String(description).trim();
  }

  if (imageUrl !== undefined) {
    if (!String(imageUrl).trim()) {
      return NextResponse.json({ error: "이미지 URL은 비워둘 수 없습니다." }, { status: 400 });
    }
    data.imageUrl = String(imageUrl).trim();
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: "태그 형식이 올바르지 않습니다." }, { status: 400 });
    }
    data.tags = tags.map((t) => String(t).trim()).filter(Boolean);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "수정할 항목이 없습니다." }, { status: 400 });
  }

  const { id } = await params;
  const issue = await prisma.issue.update({
    where: { id },
    data,
  });

  return NextResponse.json({ message: "이슈 수정 완료", issue });
}
