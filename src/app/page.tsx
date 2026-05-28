import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import AuthButtons from "@/components/AuthButtons";
import { categoryLabelMap } from "@/lib/category";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const truncateText = (text: string, max = 90) =>
  text.length > max ? `${text.slice(0, max)}...` : text;

export default async function Home() {
  const recentIssues = await prisma.issue.findMany({
    where: { status: { not: "HIDDEN" } },
    orderBy: { createdAt: "desc" },
    take: 9,
  });

  const featuredCuration = await prisma.curation.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const curatedIssues = featuredCuration
    ? await prisma.issue.findMany({ where: { id: { in: featuredCuration.issueIds }, status: { not: "HIDDEN" } } })
    : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-2xl">🐦</div>
          <div>
            <p className="text-sm text-cyan-700">Science Media Center</p>
            <h1 className="text-2xl font-bold text-slate-900">SMC twitter</h1>
          </div>
        </div>
        <AuthButtons />
      </header>

      <section className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-700 to-sky-500 text-white">
        {featuredCuration ? (
          <div className="grid gap-0 md:grid-cols-2">
            <SafeImage src={featuredCuration.imageUrl} alt={featuredCuration.title} className="h-56 w-full object-cover md:h-full" />
            <div className="p-6">
              <p className="text-xs uppercase tracking-widest text-cyan-100">메인 이슈 큐레이션</p>
              <h2 className="mt-2 text-2xl font-bold">{featuredCuration.title}</h2>
              <p className="mt-2 max-w-3xl text-cyan-50">{featuredCuration.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {curatedIssues.map((issue) => (
                  <Link key={issue.id} href={`/issues/${issue.id}`} className="pressable rounded-full bg-white/20 px-3 py-1 hover:bg-white/30">
                    {issue.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <p className="text-xs uppercase tracking-widest text-cyan-100">메인 이슈 큐레이션</p>
            <h2 className="mt-2 text-2xl font-bold">기후변화 특집</h2>
            <p className="mt-2 max-w-3xl text-cyan-50">관리자에서 큐레이션을 생성하면 이 영역에 표시됩니다.</p>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">최근 이슈</h3>
          <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">전체보기</button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentIssues.map((issue) => (
            <Link key={issue.id} href={`/issues/${issue.id}`} className="pressable group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <SafeImage src={issue.imageUrl} alt={issue.title} className="h-36 w-full object-cover" />
              <div className="p-4">
                <p className="text-xs text-cyan-700">{categoryLabelMap[issue.category]}</p>
                <h4 className="mt-1 text-lg font-semibold text-slate-900">{issue.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{truncateText(issue.description)}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {issue.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">#{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
