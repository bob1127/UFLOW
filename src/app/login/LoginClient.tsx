// src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

/** 避免 Next 產生靜態化：使用動態頁面 */
export const dynamic = "force-dynamic";

function getCallbackUrl(nextPath: string) {
  const path = nextPath || "/account";
  if (typeof window === "undefined") return path;
  return /^https?:\/\//i.test(path)
    ? path
    : `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  // 各種 Loading 狀態
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const [lineLoading, setLineLoading] = useState(false);

  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";

  // 檢查是否已登入
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

  // 一般帳密登入
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || googleLoading || fbLoading || lineLoading) return;
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

  // Google 登入
  async function handleGoogle() {
    if (loading || googleLoading || fbLoading || lineLoading) return;
    setError("");
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: getCallbackUrl(next) });
    } finally {
      setTimeout(() => setGoogleLoading(false), 1200);
    }
  }

  // Facebook 登入
  async function handleFacebook() {
    if (loading || googleLoading || fbLoading || lineLoading) return;
    setError("");
    setFbLoading(true);
    try {
      await signIn("facebook", { callbackUrl: getCallbackUrl(next) });
    } finally {
      setTimeout(() => setFbLoading(false), 1200);
    }
  }

  // LINE 登入 (手動 OAuth)
  function handleLineLogin() {
    if (loading || googleLoading || fbLoading || lineLoading) return;
    setLineLoading(true);
    setError("");

    try {
      const clientId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
      if (!clientId) {
        setError("系統設定錯誤：缺少 LINE Channel ID");
        setLineLoading(false);
        return;
      }

      // 自動判斷目前網域，組合成 Callback URL
      const redirectUri = window.location.origin + "/api/auth/line/callback";
      const state = "random_state_string"; // 建議隨機生成，這裡簡化
      const scope = "profile openid email";

      const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&state=${state}&scope=${scope}`;

      window.location.href = lineAuthUrl;
    } catch (e) {
      console.error(e);
      setLineLoading(false);
    }
  }

  const isAnyLoading = loading || googleLoading || fbLoading || lineLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 shadow-md w-full max-w-md space-y-6">
        <h2 className="text-2xl font-semibold text-center text-slate-800">會員登入</h2>

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

        {/* 社交登入 Icon 區塊 (圓形並排) */}
        <div className="flex justify-center gap-6">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={isAnyLoading}
            className={`w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-sm transition-all duration-200 ${
              isAnyLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="使用 Google 登入"
          >
            {googleLoading ? (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
            ) : (
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
          </button>

          {/* Facebook Button */}
          <button
            type="button"
            onClick={handleFacebook}
            disabled={isAnyLoading}
            className={`w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-sm transition-all duration-200 ${
              isAnyLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="使用 Facebook 登入"
          >
            {fbLoading ? (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></span>
            ) : (
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
          </button>

          {/* LINE Button */}
          <button
            type="button"
            onClick={handleLineLogin}
            disabled={isAnyLoading}
            className={`w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-sm transition-all duration-200 ${
              isAnyLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="使用 LINE 登入"
          >
            {lineLoading ? (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></span>
            ) : (
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.48 2 2 5.5 2 9.812C2 12.587 3.96 15.038 6.945 16.512C6.675 17.525 6.135 19.338 6.09 19.563C6.09 19.563 6.045 19.837 6.18 20.025C6.315 20.212 6.63 20.175 6.63 20.175C9.63 18.788 11.295 16.538 11.295 16.538C11.535 16.563 11.76 16.587 12 16.587C17.52 16.587 22 13.087 22 8.775C22 4.462 17.52 2 12 2Z"
                  fill="#06C755"
                />
                <path
                  d="M10.155 7.025H7.43c-.158 0-.285.127-.285.285v4.54c0 .158.127.285.285.285h2.725c.158 0 .285-.127.285-.285v-.748c0-.157-.127-.285-.285-.285H8.398v-.96h1.758c.158 0 .285-.128.285-.285v-.748c0-.158-.127-.285-.285-.285H8.398v-.96h1.758c.158 0 .285-.128.285-.285v-.75c0-.157-.127-.284-.285-.284ZM12.016 7.025h-.97c-.157 0-.284.127-.284.285v4.54c0 .158.127.285.284.285h.97c.158 0 .285-.127.285-.285v-4.54c0-.158-.127-.285-.285-.285ZM16.635 7.025h-.984c-.114 0-.214.066-.26.163l-1.63 3.39V7.31c0-.158-.127-.285-.285-.285h-.968c-.158 0-.285.127-.285.285v4.54c0 .158.127.285.285.285h.984c.114 0 .213-.066.26-.164l1.63-3.388v3.268c0 .158.127.285.284.285h.97c.157 0 .284-.127.284-.285v-4.54c-.002-.158-.13-.285-.287-.285ZM19.206 7.025h-2.725c-.158 0-.285.127-.285.285v4.54c0 .158.127.285.285.285h2.725c.158 0 .285-.127.285-.285v-.748c0-.157-.127-.285-.285-.285h-1.757v-.96h1.757c.158 0 .285-.128.285-.285v-.748c0-.158-.127-.285-.285-.285h-1.757v-.96h1.757c.158 0 .285-.128.285-.285v-.75c0-.157-.127-.284-.285-.284Z"
                  fill="white"
                />
              </svg>
            )}
          </button>
        </div>

        {/* 分隔線 */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">或使用信箱登入</span>
          </div>
        </div>

        {/* 帳密表單 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="帳號或信箱"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
              autoComplete="username"
              disabled={isAnyLoading}
              required
            />
            <input
              type="password"
              placeholder="密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
              autoComplete="current-password"
              disabled={isAnyLoading}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isAnyLoading}
            className={`w-full p-3 rounded-lg text-white font-medium transition duration-200 ${
              isAnyLoading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-700 hover:shadow-md"
            }`}
          >
            {loading ? "登入中…" : "登入"}
          </button>
        </form>

        {/* 底部連結 */}
        <div className="space-y-2 text-center text-sm text-slate-500">
          <p>
            <button
              type="button"
              onClick={() =>
                router.push(`/forgot-password?next=${encodeURIComponent(next)}`)
              }
              className="text-slate-700 hover:underline"
            >
              忘記密碼？
            </button>
          </p>

          <p>
            還沒有帳號？{" "}
            <a
              href={`/register?next=${encodeURIComponent(next)}`}
              className="text-slate-700 hover:underline font-medium"
            >
              立即註冊
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}