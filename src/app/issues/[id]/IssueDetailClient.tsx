"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/store";

export default function IssueDetailClient({ id }: { id: string }) {
  const issue = db.issues.find((it) => it.id === id && it.status !== "HIDDEN");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [tick, setTick] = useState(0);

  const opinions = useMemo(() => {
    return db.opinions
      .filter((op) => op.issueId === id)
      .sort((a, b) => b.votes.up - b.votes.down - (a.votes.up - a.votes.down));
  }, [id, tick]);

  if (!issue) {
    return <main className="mx-auto max-w-4xl p-6">이슈를 찾을 수 없습니다.</main>;
  }

  const related = issue.relatedIssueIds
    .map((relatedId) => db.issues.find((it) => it.id === relatedId))
    .filter((it) => Boolean(it));

  const submitOpinion = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch(`/api/issues/${issue.id}/opinions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, title, body }),
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error ?? "등록 실패");
      return;
    }

    setMessage("의견이 등록되었습니다.");
    setTitle("");
    setBody("");
    setTick((n) => n + 1);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link className="text-sm text-cyan-700" href="/">← 메인으로</Link>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{issue.title}</h1>
      <p className="mt-3 text-slate-700">{issue.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm text-cyan-800">{issue.category}</span>
        {issue.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">#{tag}</span>
        ))}
      </div>
      {related.length > 0 && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">관련 이슈</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((it) => (
              <Link key={it!.id} href={`/issues/${it!.id}`} className="rounded-full bg-white px-3 py-1 text-sm text-slate-700">
                {it!.title}
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="mt-8 rounded-xl border border-slate-200 p-4">
        <h2 className="text-lg font-semibold">의견 작성</h2>
        <form onSubmit={submitOpinion} className="mt-3 space-y-3">
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="가입 이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="본문" value={body} onChange={(e) => setBody(e.target.value)} />
          <button disabled={issue.status !== "OPEN"} className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-400">의견 등록</button>
          {message && <p className="text-sm text-cyan-700">{message}</p>}
        </form>
      </section>
      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">의견 목록</h2>
        {opinions.length === 0 ? <p className="text-sm text-slate-500">아직 등록된 의견이 없습니다.</p> : null}
        {opinions.map((op) => {
          const author = db.users.find((u) => u.id === op.authorId);
          const quoted = op.quoteOpinionId ? db.opinions.find((o) => o.id === op.quoteOpinionId) : null;
          return (
            <article key={op.id} className="rounded-xl border border-slate-200 p-4">
              {quoted ? <div className="mb-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2 text-sm text-slate-600">인용: {quoted.title}</div> : null}
              <h3 className="font-semibold text-slate-900">{op.title}</h3>
              <p className="mt-1 text-slate-700">{op.body}</p>
              <p className="mt-3 text-xs text-slate-500">{author?.name} ({author?.email})</p>
              <div className="mt-3 flex gap-2">
                <button className="rounded-md border border-slate-300 px-2 py-1 text-sm" onClick={() => { op.votes.up += 1; setTick((n) => n + 1); }}>공감 +1 ({op.votes.up})</button>
                <button className="rounded-md border border-slate-300 px-2 py-1 text-sm" onClick={() => { op.votes.down += 1; setTick((n) => n + 1); }}>반론 -1 ({op.votes.down})</button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
