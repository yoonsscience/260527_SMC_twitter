import { NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = db.opinions
    .filter((op) => op.issueId === id)
    .sort((a, b) => b.votes.up - b.votes.down - (a.votes.up - a.votes.down));

  const enriched = list.map((op) => {
    const author = db.users.find((u) => u.id === op.authorId);
    return { ...op, author: author ? { name: author.name, email: author.email } : null };
  });

  return NextResponse.json({ opinions: enriched });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issue = db.issues.find((it) => it.id === id);
  if (!issue) return NextResponse.json({ error: "이슈를 찾을 수 없습니다." }, { status: 404 });
  if (issue.status !== "OPEN") {
    return NextResponse.json({ error: "종료 또는 비공개 이슈에는 의견을 작성할 수 없습니다." }, { status: 400 });
  }

  const body = await req.json();
  const { email, title, body: content, quoteOpinionId } = body ?? {};

  const author = db.users.find((u) => u.email === email);
  if (!author) {
    return NextResponse.json({ error: "가입자만 의견을 작성할 수 있습니다." }, { status: 403 });
  }

  if (!title || !content) {
    return NextResponse.json({ error: "제목과 본문은 필수입니다." }, { status: 400 });
  }

  const opinion = {
    id: db.makeId("op"),
    issueId: id,
    title,
    body: content,
    authorId: author.id,
    quoteOpinionId,
    votes: { up: 0, down: 0 },
    createdAt: new Date().toISOString(),
  };

  db.opinions.push(opinion);

  return NextResponse.json({ message: "의견 등록 완료", opinion }, { status: 201 });
}
