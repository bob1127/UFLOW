// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export const dynamic = "force-dynamic";

function getCallbackUrl(nextPath: string) {
  const path = nextPath || "/account";
  if (typeof window === "undefined") return path;
  return /^https?:\/\//i.test(path)
    ? path
    : `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || googleLoading || fbLoading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/login?next=${encodeURIComponent(next)}`);
      } else {
        setError(data?.message || "註冊失敗");
      }
    } catch {
      setError("註冊過程發生錯誤，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (loading || googleLoading || fbLoading) return;
    setError("");
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: getCallbackUrl(next) });
    } finally {
      setTimeout(() => setGoogleLoading(false), 1200);
    }
  }

  async function handleFacebook() {
    if (loading || googleLoading || fbLoading) return;
    setError("");
    setFbLoading(true);
    try {
      await signIn("facebook", { callbackUrl: getCallbackUrl(next) });
    } finally {
      setTimeout(() => setFbLoading(false), 1200);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-semibold text-center">會員註冊</h2>

        {error && (
          <p className="text-rose-600 text-sm text-center bg-rose-50 border border-rose-200 rounded-md py-2">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading || fbLoading}
            className={`w-full rounded-md border px-4 py-2 text-slate-800 bg-white hover:bg-slate-50 transition ${
              googleLoading || loading || fbLoading
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
          >
            {googleLoading ? "Google 連線中…" : "使用 Google 一鍵註冊 / 登入"}
          </button>

          <button
            type="button"
            onClick={handleFacebook}
            disabled={fbLoading || loading || googleLoading}
            className={`w-full rounded-md border px-4 py-2 text-slate-800 bg-white hover:bg-slate-50 transition ${
              fbLoading || loading || googleLoading
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
          >
            {fbLoading ? "Facebook 連線中…" : "使用 Facebook 一鍵註冊 / 登入"}
          </button>
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">或</span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <input
            type="text"
            placeholder="使用者名稱"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-2 rounded-md"
            disabled={loading || googleLoading || fbLoading}
            required
          />
          <input
            type="email"
            placeholder="電子信箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded-md"
            disabled={loading || googleLoading || fbLoading}
            required
          />
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded-md"
            disabled={loading || googleLoading || fbLoading}
            required
          />
          <button
            type="submit"
            disabled={loading || googleLoading || fbLoading}
            className={`w-full bg-slate-800 text-white p-2 rounded-md hover:bg-slate-700 transition ${
              loading || googleLoading || fbLoading
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
          >
            {loading ? "註冊中…" : "註冊"}
          </button>
        </form>

        <p className="text-center text-sm">
          已有帳號？{" "}
          <a
            href={`/login?next=${encodeURIComponent(next)}`}
            className="text-blue-600 underline"
          >
            前往登入
          </a>
        </p>
      </div>
    </div>
  );
}
