import Link from "next/link";
import { db } from "@/lib/store";

export default function Home() {
  const recentIssues = db.issues.filter((issue) => issue.status !== "HIDDEN").slice(0, 9);

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
        <div className="flex gap-2 text-sm">
          <Link className="rounded-lg bg-slate-900 px-3 py-2 text-white" href="/login">로그인</Link>
          <Link className="rounded-lg border border-slate-300 px-3 py-2" href="/signup">회원가입</Link>
        </div>
      </header>

      <section className="mb-8 rounded-2xl bg-gradient-to-r from-cyan-700 to-sky-500 p-6 text-white">
        <p className="text-xs uppercase tracking-widest text-cyan-100">메인 이슈 큐레이션</p>
        <h2 className="mt-2 text-2xl font-bold">기후변화 특집</h2>
        <p className="mt-2 max-w-3xl text-cyan-50">
          2026년 봄 북반구 이상고온과 폭우가 동시에 관측되며, 도시 적응과 에너지 전환의 속도 논쟁이 다시 커지고 있습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {recentIssues.slice(0, 3).map((issue) => (
            <Link key={issue.id} href={`/issues/${issue.id}`} className="rounded-full bg-white/20 px-3 py-1 hover:bg-white/30">
              {issue.title}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">최근 이슈</h3>
          <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">전체보기</button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentIssues.map((issue) => (
            <Link key={issue.id} href={`/issues/${issue.id}`} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs text-cyan-700">{issue.category}</p>
              <h4 className="mt-1 text-lg font-semibold text-slate-900">{issue.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{issue.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {issue.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">#{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
