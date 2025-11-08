"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function getCallbackUrl(nextPath: string) {
  const path = nextPath || "/account";
  if (typeof window === "undefined") return path;
  return /^https?:\/\//i.test(path)
    ? path
    : `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function LoginClient() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const r = await fetch("/api/account/profile", {
          cache: "no-store",
          credentials: "include",
        });
        const js = await r.json();
        if (!abort && js?.loggedIn) router.replace(next);
      } catch {}
    })();
    return () => {
      abort = true;
    };
  }, [router, next]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || googleLoading) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccess("已登入，正在前往…");
        setTimeout(() => router.replace(next), 500);
      } else {
        setError(data?.message || "登入失敗，請確認帳密是否正確。");
      }
    } catch {
      setError("登入過程發生錯誤，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (loading || googleLoading) return;
    setError("");
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: getCallbackUrl(next) });
    } finally {
      setTimeout(() => setGoogleLoading(false), 2000);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-semibold text-center">會員登入</h2>

        {error && (
          <p className="text-rose-600 text-sm text-center bg-rose-50 border border-rose-200 rounded-md py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-emerald-700 text-sm text-center bg-emerald-50 border border-emerald-200 rounded-md py-2">
            {success}
          </p>
        )}

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className={`w-full rounded-md border px-4 py-2 text-slate-800 bg-white hover:bg-slate-50 transition ${
            googleLoading || loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {googleLoading ? "Google 連線中…" : "使用 Google 快速登入"}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">或</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="text"
            placeholder="帳號或信箱"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300"
            autoComplete="username"
            disabled={loading || googleLoading}
            required
          />
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300"
            autoComplete="current-password"
            disabled={loading || googleLoading}
            required
          />
          <button
            type="submit"
            disabled={loading || googleLoading}
            className={`w-full p-2 rounded-md text-white transition ${
              loading || googleLoading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            {loading ? "登入中…" : "登入"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          還沒有帳號？{" "}
          <a
            href={`/register?next=${encodeURIComponent(next)}`}
            className="text-slate-700 underline"
          >
            立即註冊
          </a>
        </p>
      </div>
    </div>
  );
}
