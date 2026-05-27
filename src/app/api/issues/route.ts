import { NextResponse } from "next/server";
import { categoryList, db } from "@/lib/store";

export async function GET() {
  const visible = db.issues.filter((issue) => issue.status !== "HIDDEN");
  return NextResponse.json({ issues: visible.slice(0, 9) });
}

export async function POST(req: Request) {
  const adminEmail = req.headers.get("x-admin-email");
  const admin = db.users.find((u) => u.email === adminEmail && u.role === "ADMIN");

  if (!admin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, imageUrl, tags, category, relatedIssueIds } = body ?? {};

  if (!title || !description || !imageUrl || !Array.isArray(tags) || !category) {
    return NextResponse.json({ error: "이슈 생성 필수값이 누락되었습니다." }, { status: 400 });
  }

  if (!categoryList.includes(category)) {
    return NextResponse.json({ error: "유효하지 않은 분야입니다." }, { status: 400 });
  }

  const issue = {
    id: db.makeId("issue"),
    title,
    description,
    imageUrl,
    tags,
    category,
    relatedIssueIds: Array.isArray(relatedIssueIds) ? relatedIssueIds : [],
    status: "OPEN" as const,
    createdBy: admin.id,
    createdAt: new Date().toISOString(),
  };

  db.issues.unshift(issue);

  return NextResponse.json({ message: "이슈 생성 완료", issue }, { status: 201 });
}
