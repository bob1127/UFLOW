// src/app/register/page.tsx
"use client";

import { useEffect, useState } from "react";
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

// ✅ 存推薦碼到 cookie，讓 OAuth 跳轉也不會丟
function setRefCookie(ref: string) {
  if (typeof window === "undefined") return;
  const v = (ref || "").trim();
  if (!v) return;

  const isHttps = window.location.protocol === "https:";
  // 30 天，SameSite=Lax 可在 OAuth 來回時保留
  // https 正式站建議加 Secure
  document.cookie = `uf_ref=${encodeURIComponent(v)}; Path=/; Max-Age=${
    60 * 60 * 24 * 30
  }; SameSite=Lax${isHttps ? "; Secure" : ""}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";

  // ✅ 讀推薦碼
  const ref = search.get("ref") || "";

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);

  const [registered, setRegistered] = useState(false);

  // ✅ 一進頁面就把 ref 存起來（避免點 Google 後 ref 消失）
  useEffect(() => {
    if (ref) setRefCookie(ref);
  }, [ref]);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || googleLoading || fbLoading) return;
    setError("");
    setLoading(true);

    try {
      // ✅ 確保帳密註冊時也把 ref 寫入 cookie（後端可用 cookie / body 都行）
      if (ref) setRefCookie(ref);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, ref }), // ✅ 帶 ref
      });

      const data = await res.json();
      if (res.ok) {
        setRegistered(true);
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
      // ✅ 按下 Google 前再寫一次 cookie，確保不會被丟
      if (ref) setRefCookie(ref);

      // ✅ 把 ref 一起放進 callbackUrl（非必要，但 debug 很方便）
      const cb = getCallbackUrl(next);
      const cbUrl = new URL(cb);
      if (ref) cbUrl.searchParams.set("ref", ref);

      await signIn("google", {
        callbackUrl: cbUrl.toString(),
      });
    } finally {
      setTimeout(() => setGoogleLoading(false), 1200);
    }
  }

  async function handleFacebook() {
    if (loading || googleLoading || fbLoading) return;
    setError("");
    setFbLoading(true);

    try {
      if (ref) setRefCookie(ref);

      const cb = getCallbackUrl(next);
      const cbUrl = new URL(cb);
      if (ref) cbUrl.searchParams.set("ref", ref);

      await signIn("facebook", {
        callbackUrl: cbUrl.toString(),
      });
    } finally {
      setTimeout(() => setFbLoading(false), 1200);
    }
  }

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center space-y-6">
          <h2 className="text-2xl font-semibold text-emerald-700">
            🎉 註冊成功！
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            我們已寄出一封
            <span className="font-semibold"> 信箱驗證信 </span>
            到：
            <br />
            <span className="font-medium">{email}</span>
            <br />
            請到信箱收信並點擊驗證連結，完成驗證後即可使用帳號密碼登入。
          </p>

          <button
            onClick={() =>
              router.push(`/login?next=${encodeURIComponent(next)}`)
            }
            className="w-full bg-slate-800 text-white p-2 rounded-md hover:bg-slate-700 transition"
          >
            前往登入
          </button>

          <p className="text-xs text-slate-500">
            沒收到信件？請稍待 1–2 分鐘，或檢查垃圾信件匣。
          </p>
        </div>
      </div>
    );
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
