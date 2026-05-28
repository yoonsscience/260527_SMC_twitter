"use client";

import Link from "next/link";
import SafeImage from "@/components/SafeImage";
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
  imageUrl: string;
  category: string;
  tags: string[];
  status: "OPEN" | "ARCHIVED" | "HIDDEN";
};

type CurationItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  issueIds: string[];
  isActive: boolean;
};

const categoryOptions = ["기초과학", "기후", "생명보건의료", "기술", "사회및사건사고", "기타"] as const;

export default function AdminPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [curations, setCurations] = useState<CurationItem[]>([]);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [category, setCategory] = useState<(typeof categoryOptions)[number]>("기초과학");

  const [curationTitle, setCurationTitle] = useState("");
  const [curationDescription, setCurationDescription] = useState("");
  const [curationImageUrl, setCurationImageUrl] = useState("");
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);

  const [editingIssue, setEditingIssue] = useState<IssueItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editTagsInput, setEditTagsInput] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("smc_user");
    if (!raw) return;
    try {
      setUser(JSON.parse(raw) as SessionUser);
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
    if (!res.ok) return setMessage(data.error ?? "이슈 목록 조회 실패");
    setIssues(data.issues ?? []);
  };

  const loadCurations = async (email: string) => {
    const res = await fetch("/api/admin/curations", {
      headers: { "x-admin-email": email },
      cache: "no-store",
    });

    const data = await res.json();
    if (res.ok) setCurations(data.curations ?? []);
  };

  useEffect(() => {
    if (isAdmin && user?.email) {
      void loadIssues(user.email);
      void loadCurations(user.email);
    }
  }, [isAdmin, user?.email]);

  const tags = useMemo(() => tagsInput.split(",").map((t) => t.trim()).filter(Boolean), [tagsInput]);

  const createIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!user?.email) return setMessage("관리자 로그인이 필요합니다.");

    const res = await fetch("/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-email": user.email },
      body: JSON.stringify({ title, description, imageUrl, tags, category, relatedIssueIds: [] }),
    });

    const data = await res.json();
    if (!res.ok) return setMessage(data.error ?? "이슈 생성 실패");

    setMessage("이슈가 생성되었습니다.");
    setTitle("");
    setDescription("");
    setImageUrl("");
    setTagsInput("");
    await loadIssues(user.email);
  };

  const createCuration = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!user?.email) return;

    const res = await fetch("/api/admin/curations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-email": user.email },
      body: JSON.stringify({ title: curationTitle, description: curationDescription, imageUrl: curationImageUrl, issueIds: selectedIssueIds }),
    });

    const data = await res.json();
    if (!res.ok) return setMessage(data.error ?? "큐레이션 생성 실패");

    setMessage("메인 큐레이션이 생성되었습니다.");
    setCurationTitle("");
    setCurationDescription("");
    setCurationImageUrl("");
    setSelectedIssueIds([]);
    await loadCurations(user.email);
  };

  const updateStatus = async (id: string, status: IssueItem["status"]) => {
    if (!user?.email) return;

    const res = await fetch(`/api/admin/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-email": user.email },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok) return setMessage(data.error ?? "상태 변경 실패");

    setMessage("이슈 상태를 변경했습니다.");
    await loadIssues(user.email);
  };

  const openEditModal = (issue: IssueItem) => {
    setEditingIssue(issue);
    setEditTitle(issue.title);
    setEditDescription(issue.description);
    setEditImageUrl(issue.imageUrl);
    setEditTagsInput(issue.tags.join(", "));
  };

  const saveIssueEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !editingIssue) return;

    const editTags = editTagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const res = await fetch(`/api/admin/issues/${editingIssue.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-email": user.email },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        imageUrl: editImageUrl,
        tags: editTags,
      }),
    });

    const data = await res.json();
    if (!res.ok) return setMessage(data.error ?? "이슈 수정 실패");

    setMessage("이슈를 수정했습니다.");
    setEditingIssue(null);
    await loadIssues(user.email);
  };

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold">관리자 페이지</h1>
        <p className="mt-2 text-slate-600">로그인 후 접근할 수 있습니다.</p>
        <Link href="/login" className="pressable mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white">로그인하러 가기</Link>
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
        <Link href="/" className="pressable rounded-lg border border-slate-300 px-3 py-2 text-sm">메인으로</Link>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">새 이슈 만들기</h2>
        <form onSubmit={createIssue} className="mt-4 grid gap-3">
          <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="이슈 제목" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="min-h-24 rounded-lg border border-slate-300 px-3 py-2" placeholder="이슈 설명" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="대표 이미지 URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          {imageUrl ? <SafeImage src={imageUrl} alt="preview" className="h-32 w-full rounded-lg object-cover" /> : null}
          <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="태그 (쉼표 구분) 예: 기후,AI,정책" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          <select className="rounded-lg border border-slate-300 px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value as (typeof categoryOptions)[number])}>
            {categoryOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <button className="pressable w-fit rounded-lg bg-slate-900 px-4 py-2 text-white" type="submit">이슈 생성</button>
        </form>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">메인 이슈 큐레이션</h2>
        <form onSubmit={createCuration} className="mt-4 grid gap-3">
          <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="큐레이션 제목 (예: 기후변화 특집)" value={curationTitle} onChange={(e) => setCurationTitle(e.target.value)} />
          <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2" placeholder="큐레이션 해설" value={curationDescription} onChange={(e) => setCurationDescription(e.target.value)} />
          <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="큐레이션 이미지 URL" value={curationImageUrl} onChange={(e) => setCurationImageUrl(e.target.value)} />
          {curationImageUrl ? <SafeImage src={curationImageUrl} alt="curation preview" className="h-32 w-full rounded-lg object-cover" /> : null}
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="mb-2 text-sm font-medium">포함할 이슈 선택</p>
            <div className="max-h-40 space-y-1 overflow-auto text-sm">
              {issues.map((issue) => (
                <label key={issue.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIssueIds.includes(issue.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIssueIds((prev) => [...prev, issue.id]);
                      else setSelectedIssueIds((prev) => prev.filter((id) => id !== issue.id));
                    }}
                  />
                  <span>{issue.title}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="pressable w-fit rounded-lg bg-cyan-700 px-4 py-2 text-white" type="submit">큐레이션 생성</button>
        </form>

        {curations.length > 0 ? <p className="mt-3 text-xs text-slate-500">현재 활성 큐레이션: {curations.find((c) => c.isActive)?.title ?? "없음"}</p> : null}
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
                  <button className="pressable rounded-md border border-slate-300 px-2 py-1" onClick={() => openEditModal(issue)}>수정</button>
                  <button className="pressable rounded-md border border-slate-300 px-2 py-1" onClick={() => updateStatus(issue.id, "OPEN")}>재개</button>
                  <button className="pressable rounded-md border border-slate-300 px-2 py-1" onClick={() => updateStatus(issue.id, "ARCHIVED")}>아카이브</button>
                  <button className="pressable rounded-md border border-slate-300 px-2 py-1" onClick={() => updateStatus(issue.id, "HIDDEN")}>가리기</button>
                </div>
              </div>
            </article>
          ))}
          {issues.length === 0 ? <p className="text-sm text-slate-500">생성된 이슈가 없습니다.</p> : null}
        </div>
      </section>

      {editingIssue ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">이슈 수정</h3>
              <button className="pressable text-sm text-slate-500" onClick={() => setEditingIssue(null)}>닫기</button>
            </div>
            <form onSubmit={saveIssueEdit} className="grid gap-3">
              <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="이슈 제목" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              <textarea className="min-h-24 rounded-lg border border-slate-300 px-3 py-2" placeholder="이슈 설명" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="대표 이미지 URL" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} />
              {editImageUrl ? <SafeImage src={editImageUrl} alt="edit preview" className="h-32 w-full rounded-lg object-cover" /> : null}
              <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="태그 (쉼표 구분)" value={editTagsInput} onChange={(e) => setEditTagsInput(e.target.value)} />
              <button className="pressable w-fit rounded-lg bg-slate-900 px-4 py-2 text-white" type="submit">수정 저장</button>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
