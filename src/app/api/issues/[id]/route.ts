import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const issue = await prisma.issue.findFirst({
    where: { id, status: { not: "HIDDEN" } },
  });

  if (!issue) {
    return NextResponse.json({ error: "이슈를 찾을 수 없습니다." }, { status: 404 });
  }

  const relatedIssues = issue.relatedIssueIds.length
    ? await prisma.issue.findMany({ where: { id: { in: issue.relatedIssueIds } } })
    : [];

  return NextResponse.json({ issue, relatedIssues });
}
