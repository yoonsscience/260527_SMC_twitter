import IssueDetailClient from "./IssueDetailClient";

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IssueDetailClient id={id} />;
}
