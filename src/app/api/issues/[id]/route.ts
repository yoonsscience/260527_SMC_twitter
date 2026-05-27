import { NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issue = db.issues.find((it) => it.id === id && it.status !== "HIDDEN");
  if (!issue) return NextResponse.json({ error: "이슈를 찾을 수 없습니다." }, { status: 404 });

  const relatedIssues = issue.relatedIssueIds
    .map((relatedId) => db.issues.find((it) => it.id === relatedId))
    .filter((it) => Boolean(it));

  return NextResponse.json({ issue, relatedIssues });
}
