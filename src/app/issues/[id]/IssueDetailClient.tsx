"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type RelatedIssue = { id: string; title: string };

type IssueView = {
  id: string;
  title: string;
  description: string;
  categoryLabel: string;
  tags: string[];
  status: "OPEN" | "ARCHIVED" | "HIDDEN";
};

type OpinionView = {
  id: string;
  title: string;
  body: string;
  quoteOpinionId?: string | null;
  votes: { up: number; down: number };
  author: { name: string; email: string };
  createdAt?: string;
};

type SessionUser = {
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export default function IssueDetailClient({
  issue,
  related,
}: {
  issue: IssueView;
  related: RelatedIssue[];
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [opinions, setOpinions] = useState<OpinionView[]>([]);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quoteTarget, setQuoteTarget] = useState<OpinionView | null>(null);

  const loadOpinions = async () => {
    const res = await fetch(`/api/issues/${issue.id}/opinions`, { cache: "no-store" });
    const data = await res.json();
    setOpinions(data.opinions ?? []);
  };

  useEffect(() => {
    const raw = localStorage.getItem("smc_user");
    if (raw) {
      try {
        setSessionUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem("smc_user");
      }
    }
    void loadOpinions();
  }, []);

  const opinionsById = useMemo(() => {
    return Object.fromEntries(opinions.map((op) => [op.id, op]));
  }, [opinions]);

  const childrenMap = useMemo(() => {
    const map: Record<string, OpinionView[]> = {};
    for (const op of opinions) {
      if (!op.quoteOpinionId) continue;
      if (!map[op.quoteOpinionId]) map[op.quoteOpinionId] = [];
      map[op.quoteOpinionId].push(op);
    }
    return map;
  }, [opinions]);

  const topLevel = useMemo(() => {
    return opinions.filter((op) => !op.quoteOpinionId);
  }, [opinions]);

  const sorted = (list: OpinionView[]) =>
    [...list].sort((a, b) => (b.votes.up - b.votes.down) - (a.votes.up - a.votes.down));

  const submitOpinion = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!sessionUser?.email) {
      setMessage("로그인 후 의견을 작성해 주세요.");
      return;
    }

    const res = await fetch(`/api/issues/${issue.id}/opinions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: sessionUser.email,
        title,
        body,
        quoteOpinionId: quoteTarget?.id,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error ?? "등록 실패");
      return;
    }

    setMessage("");
    setTitle("");
    setBody("");
    setQuoteTarget(null);
    setIsModalOpen(false);
    await loadOpinions();
  };

  const react = async (opinionId: string, reactionType: "UP" | "DOWN") => {
    if (!sessionUser?.email) {
      setMessage("로그인 후 반응을 남길 수 있습니다.");
      return;
    }

    const res = await fetch(`/api/opinions/${opinionId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: sessionUser.email, reactionType }),
    });

    if (res.ok) {
      await loadOpinions();
    }
  };

  const renderOpinion = (op: OpinionView, depth = 0) => {
    const quoted = op.quoteOpinionId ? opinionsById[op.quoteOpinionId] : null;
    const children = sorted(childrenMap[op.id] ?? []);

    return (
      <article key={op.id} className="rounded-xl border border-slate-200 bg-white p-4" style={{ marginLeft: `${depth * 20}px` }}>
        {quoted ? (
          <div className="mb-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2 text-sm text-slate-600">
            인용: <span className="font-medium">{quoted.title}</span>
          </div>
        ) : null}

        <h3 className="font-semibold text-slate-900">{op.title}</h3>
        <p className="mt-1 whitespace-pre-wrap text-slate-700">{op.body}</p>
        <p className="mt-3 text-xs text-slate-500">{op.author?.name} ({op.author?.email})</p>

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button className="rounded-md border border-slate-300 px-2 py-1" onClick={() => react(op.id, "UP")}>공감 +1 ({op.votes.up})</button>
          <button className="rounded-md border border-slate-300 px-2 py-1" onClick={() => react(op.id, "DOWN")}>반론 -1 ({op.votes.down})</button>
          <button
            className="rounded-md border border-cyan-300 px-2 py-1 text-cyan-700"
            onClick={() => {
              setQuoteTarget(op);
              setIsModalOpen(true);
            }}
          >
            인용 답글
          </button>
        </div>

        {children.length > 0 ? (
          <div className="mt-3 space-y-3 border-l border-slate-200 pl-3">
            {children.map((child) => renderOpinion(child, depth + 1))}
          </div>
        ) : null}
      </article>
    );
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link className="text-sm text-cyan-700" href="/">← 메인으로</Link>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{issue.title}</h1>
      <p className="mt-3 text-slate-700">{issue.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm text-cyan-800">{issue.categoryLabel}</span>
        {issue.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">#{tag}</span>
        ))}
      </div>

      {related.length > 0 && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">관련 이슈</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((it) => (
              <Link key={it.id} href={`/issues/${it.id}`} className="rounded-full bg-white px-3 py-1 text-sm text-slate-700">
                {it.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">의견 스레드</h2>
          <button
            disabled={!sessionUser || issue.status !== "OPEN"}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            onClick={() => {
              setQuoteTarget(null);
              setIsModalOpen(true);
            }}
          >
            의견 내기
          </button>
        </div>

        {message ? <p className="mb-3 text-sm text-cyan-700">{message}</p> : null}
        {topLevel.length === 0 ? <p className="text-sm text-slate-500">아직 등록된 의견이 없습니다.</p> : null}
        <div className="space-y-3">{sorted(topLevel).map((op) => renderOpinion(op))}</div>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">의견 작성</h3>
              <button className="text-sm text-slate-500" onClick={() => setIsModalOpen(false)}>닫기</button>
            </div>

            {quoteTarget ? (
              <div className="mb-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2 text-sm text-slate-600">
                인용 대상: <span className="font-medium">{quoteTarget.title}</span>
              </div>
            ) : null}

            <form onSubmit={submitOpinion} className="space-y-3">
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="본문"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <button className="rounded-lg bg-slate-900 px-4 py-2 text-white" type="submit">등록</button>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
