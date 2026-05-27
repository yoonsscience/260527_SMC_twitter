import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const opinions = await prisma.opinion.findMany({
    where: { issueId: id },
    include: {
      author: { select: { name: true, email: true } },
      reactions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const sorted = opinions
    .map((op) => {
      const up = op.reactions.filter((r) => r.reactionType === "UP").length;
      const down = op.reactions.filter((r) => r.reactionType === "DOWN").length;
      return { ...op, votes: { up, down } };
    })
    .sort((a, b) => b.votes.up - b.votes.down - (a.votes.up - a.votes.down));

  return NextResponse.json({ opinions: sorted });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issue = await prisma.issue.findUnique({ where: { id } });

  if (!issue) {
    return NextResponse.json({ error: "이슈를 찾을 수 없습니다." }, { status: 404 });
  }

  if (issue.status !== "OPEN") {
    return NextResponse.json({ error: "종료 또는 비공개 이슈에는 의견을 작성할 수 없습니다." }, { status: 400 });
  }

  const body = await req.json();
  const { email, title, body: content, quoteOpinionId } = body ?? {};

  const author = await prisma.user.findUnique({ where: { email } });
  if (!author) {
    return NextResponse.json({ error: "가입자만 의견을 작성할 수 있습니다." }, { status: 403 });
  }

  if (!title || !content) {
    return NextResponse.json({ error: "제목과 본문은 필수입니다." }, { status: 400 });
  }

  const opinion = await prisma.opinion.create({
    data: {
      issueId: id,
      authorId: author.id,
      title,
      body: content,
      quoteOpinionId,
    },
  });

  return NextResponse.json({ message: "의견 등록 완료", opinion }, { status: 201 });
}
