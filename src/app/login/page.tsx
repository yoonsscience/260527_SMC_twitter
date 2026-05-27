"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "로그인 실패");
      return;
    }

    setMessage(`로그인 성공: ${data.user.name} (${data.user.role})`);
    localStorage.setItem("smc_user", JSON.stringify(data.user));
    localStorage.setItem("smc_token", data.token);
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">로그인</h1>
      <p className="mt-1 text-sm text-slate-600">SMC twitter 계정으로 로그인하세요.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white" type="submit">
          로그인
        </button>
        {message ? <p className="text-sm text-cyan-700">{message}</p> : null}
      </form>

      <p className="mt-4 text-sm text-slate-600">
        아직 계정이 없나요? <Link href="/signup" className="text-cyan-700">회원가입</Link>
      </p>
    </main>
  );
}
