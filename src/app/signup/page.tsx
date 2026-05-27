"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, affiliation, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "가입 실패");
      return;
    }

    setMessage("가입 완료! 로그인 페이지로 이동합니다.");
    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 700);
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">회원가입</h1>
      <p className="mt-1 text-sm text-slate-600">이름, 소속, 이메일, 비밀번호로 간단 가입</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="소속" value={affiliation} onChange={(e) => setAffiliation(e.target.value)} />
        <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white" type="submit">가입하기</button>
        {message ? <p className="text-sm text-cyan-700">{message}</p> : null}
      </form>

      <p className="mt-4 text-sm text-slate-600">
        이미 계정이 있나요? <Link href="/login" className="text-cyan-700">로그인</Link>
      </p>
    </main>
  );
}
