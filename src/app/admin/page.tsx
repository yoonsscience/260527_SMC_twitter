"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SessionUser = {
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

type IssueItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: "OPEN" | "ARCHIVED" | "HIDDEN";
};

const categoryOptions = ["기초과학", "기후", "생명보건의료", "기술", "사회및사건사고", "기타"] as const;

export default function AdminPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [category, setCategory] = useState<(typeof categoryOptions)[number]>("기초과학");

  useEffect(() => {
    const raw = localStorage.getItem("smc_user");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as SessionUser;
      setUser(parsed);
    } catch {
      localStorage.removeItem("smc_user");
    }
  }, []);

  const isAdmin = user?.role === "ADMIN";

  const loadIssues = async (email: string) => {
    const res = await fetch("/api/admin/issues", {
      headers: { "x-admin-email": email },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "이슈 목록 조회 실패");
      return;
    }

    setIssues(data.issues ?? []);
  };

  useEffect(() => {
    if (isAdmin && user?.email) {
      void loadIssues(user.email);
    }
  }, [isAdmin, user?.email]);

  const tags = useMemo(
    () => tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
    [tagsInput],
  );

  const createIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!user?.email) {
      setMessage("관리자 로그인이 필요합니다.");
      return;
    }

    const res = await fetch("/api/issues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-email": user.email,
      },
      body: JSON.stringify({
        title,
        description,
        imageUrl,
        tags,
        category,
        relatedIssueIds: [],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "이슈 생성 실패");
      return;
    }

    setMessage("이슈가 생성되었습니다.");
    setTitle("");
    setDescription("");
    setImageUrl("");
    setTagsInput("");
    await loadIssues(user.email);
  };

  const updateStatus = async (id: string, status: IssueItem["status"]) => {
    if (!user?.email) return;

    const res = await fetch(`/api/admin/issues/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-email": user.email,
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "상태 변경 실패");
      return;
    }

    setMessage("이슈 상태를 변경했습니다.");
    await loadIssues(user.email);
  };

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold">관리자 페이지</h1>
        <p className="mt-2 text-slate-600">로그인 후 접근할 수 있습니다.</p>
        <Link href="/login" className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white">로그인하러 가기</Link>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold">관리자 페이지</h1>
        <p className="mt-2 text-red-600">관리자 계정만 접근할 수 있습니다.</p>
        <p className="mt-1 text-sm text-slate-600">현재 로그인: {user.email}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
          <p className="text-sm text-slate-600">{user.name} ({user.email})</p>
        </div>
        <Link href="/" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">메인으로</Link>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">새 이슈 만들기</h2>
        <form onSubmit={createIssue} className="mt-4 grid gap-3">
          <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="이슈 제목" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="min-h-24 rounded-lg border border-slate-300 px-3 py-2" placeholder="이슈 설명" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="대표 이미지 URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="태그 (쉼표 구분) 예: 기후,AI,정책" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          <select className="rounded-lg border border-slate-300 px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value as (typeof categoryOptions)[number])}>
            {categoryOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <button className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-white" type="submit">이슈 생성</button>
        </form>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">이슈 관리</h2>
        {message ? <p className="mt-2 text-sm text-cyan-700">{message}</p> : null}

        <div className="mt-4 space-y-3">
          {issues.map((issue) => (
            <article key={issue.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{issue.title}</h3>
                  <p className="text-xs text-slate-500">상태: {issue.status}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <button className="rounded-md border border-slate-300 px-2 py-1" onClick={() => updateStatus(issue.id, "OPEN")}>재개</button>
                  <button className="rounded-md border border-slate-300 px-2 py-1" onClick={() => updateStatus(issue.id, "ARCHIVED")}>아카이브</button>
                  <button className="rounded-md border border-slate-300 px-2 py-1" onClick={() => updateStatus(issue.id, "HIDDEN")}>가리기</button>
                </div>
              </div>
            </article>
          ))}
          {issues.length === 0 ? <p className="text-sm text-slate-500">생성된 이슈가 없습니다.</p> : null}
        </div>
      </section>
    </main>
  );
}
