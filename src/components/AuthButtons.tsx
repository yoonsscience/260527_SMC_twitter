"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionUser = {
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export default function AuthButtons() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("smc_user");
    if (!raw) return;

    try {
      setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem("smc_user");
    }
  }, []);

  if (!user) {
    return (
      <div className="flex gap-2 text-sm">
        <Link className="rounded-lg bg-slate-900 px-3 py-2 text-white" href="/login">로그인</Link>
        <Link className="rounded-lg border border-slate-300 px-3 py-2" href="/signup">회원가입</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {user.role === "ADMIN" ? <Link href="/admin" className="rounded-lg border border-cyan-300 px-3 py-2 text-cyan-700">관리자</Link> : null}
      <span className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">{user.name}</span>
      <button
        className="rounded-lg border border-slate-300 px-3 py-2"
        onClick={() => {
          localStorage.removeItem("smc_user");
          localStorage.removeItem("smc_token");
          setUser(null);
        }}
      >
        로그아웃
      </button>
    </div>
  );
}
