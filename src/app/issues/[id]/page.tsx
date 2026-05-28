import { notFound } from "next/navigation";
import IssueDetailClient from "./IssueDetailClient";
import { categoryLabelMap } from "@/lib/category";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const issue = await prisma.issue.findUnique({ where: { id } });
  if (!issue || issue.status === "HIDDEN") {
    notFound();
  }

  const related = issue.relatedIssueIds.length
    ? await prisma.issue.findMany({
        where: { id: { in: issue.relatedIssueIds }, status: { not: "HIDDEN" } },
        select: { id: true, title: true },
      })
    : [];

  return (
    <IssueDetailClient
      issue={{
        id: issue.id,
        title: issue.title,
        description: issue.description,
        categoryLabel: categoryLabelMap[issue.category],
        imageUrl: issue.imageUrl,
        tags: issue.tags,
        status: issue.status,
      }}
      related={related}
    />
  );
}
