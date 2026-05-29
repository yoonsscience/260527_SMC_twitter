import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, affiliation: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  const opinions = await prisma.opinion.findMany({
    where: { authorId: id },
    select: {
      issue: { select: { id: true, title: true } },
      reactions: { select: { reactionType: true } },
    },
  });

  const issueMap = new Map<string, { id: string; title: string }>();
  let totalUpvotes = 0;

  for (const op of opinions) {
    issueMap.set(op.issue.id, op.issue);
    totalUpvotes += op.reactions.filter((r) => r.reactionType === "UP").length;
  }

  return NextResponse.json({
    user,
    totalUpvotes,
    participatedIssues: Array.from(issueMap.values()),
  });
}
