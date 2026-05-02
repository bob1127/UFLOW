"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export const dynamic = "force-dynamic";

function getCallbackUrl(nextPath: string) {
  const path = nextPath || "/account";
  if (typeof window === "undefined") return path;
  return /^https?:\/\//i.test(path)
    ? path
    : `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
}

// ==========================================
// 🎨 輪播視覺設計元件 (與註冊頁共用風格)
// ==========================================
const SlideOneVisual = () => (
  <div className="relative w-full max-w-sm aspect-[4/3] bg-white/10 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-sm p-5 flex flex-col gap-4">
    <div className="flex justify-between items-center">
      <div className="h-4 w-24 bg-white/30 rounded"></div>
      <div className="h-4 w-12 bg-white/30 rounded"></div>
    </div>
    <div className="h-24 w-full bg-gradient-to-r from-blue-400/20 to-white/10 rounded-lg relative overflow-hidden flex items-end p-2 gap-2">
      {[40, 70, 45, 90, 65, 100].map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
          className="flex-1 bg-white/40 rounded-t-sm"
        />
      ))}
    </div>
    <div className="flex gap-2">
      <div className="h-10 flex-1 bg-white/20 rounded-lg"></div>
      <div className="h-10 flex-1 bg-white/20 rounded-lg"></div>
    </div>
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
      className="absolute -right-8 top-1/2 bg-white text-gray-800 p-3 rounded-xl shadow-lg flex items-center gap-3"
    >
      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
        ✓
      </div>
      <div>
        <div className="text-[10px] text-gray-500 font-medium">
          你的健康指數
        </div>
        <div className="font-bold text-sm">+999</div>
      </div>
    </motion.div>
  </div>
);

const SlideTwoVisual = () => (
  <div className="relative w-full max-w-sm aspect-[4/3] bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-sm p-6 flex flex-col items-center justify-center gap-6">
    <motion.div
      animate={{ y: [-5, 5, -5], rotateX: [0, 5, -5, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      className="w-4/5 h-28 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-xl shadow-[0_0_30px_rgba(250,204,21,0.4)] p-4 flex flex-col justify-between border border-yellow-200"
    >
      <div className="flex justify-between items-center">
        <div className="text-yellow-900 font-black tracking-widest text-xs opacity-70">
          UFLOW VIP
        </div>
        <div className="w-6 h-4 bg-yellow-100/50 rounded-sm"></div>
      </div>
      <div className="text-yellow-900 font-bold text-xl tracking-widest">
        GOLD MEMBER
      </div>
    </motion.div>
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs font-medium text-white/80">
        <span>Current Points</span>
        <span>1,500 / 2,000</span>
      </div>
      <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "75%" }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="bg-yellow-400 h-full rounded-full"
        />
      </div>
    </div>
    <motion.div
      initial={{ x: -20, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.7, type: "spring" }}
      className="absolute -left-6 bottom-6 bg-white text-gray-800 p-3 rounded-xl shadow-lg flex items-center gap-3 z-10"
    >
      <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-lg"></div>
      <div>
        <div className="text-[10px] text-gray-500 font-medium">
          加入會員，成為夥伴
        </div>
        <div className="font-bold text-sm">+UFLOW</div>
      </div>
    </motion.div>
  </div>
);

const SlideThreeVisual = () => (
  <div className="relative w-full max-w-sm aspect-[4/3] bg-white/10 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-sm p-6 flex flex-col items-center justify-center gap-8">
    <div className="relative flex items-center justify-center w-full">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-16 h-16 bg-white/20 rounded-full border-2 border-white/50 flex items-center justify-center z-10 backdrop-blur-md"
      >
        <span className="text-2xl">🔗</span>
      </motion.div>
      <motion.div
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: -40, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.48 2 2 5.5 2 9.812C2 12.587 3.96 15.038 6.945 16.512C6.675 17.525 6.135 19.338 6.09 19.563C6.09 19.563 6.045 19.837 6.18 20.025C6.315 20.212 6.63 20.175 6.63 20.175C9.63 18.788 11.295 16.538 11.295 16.538C11.535 16.563 11.76 16.587 12 16.587C17.52 16.587 22 13.087 22 8.775C22 4.462 17.52 2 12 2Z"
            fill="#06C755"
          />
        </svg>
      </motion.div>
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 40, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
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
      </motion.div>
    </div>
    <div className="h-3 w-32 bg-white/20 rounded-full"></div>
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, type: "spring" }}
      className="absolute -right-4 bottom-8 bg-white text-gray-800 p-3 rounded-xl shadow-lg flex items-center gap-3"
    >
      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
        ⚡
      </div>
      <div>
        <div className="text-[10px] text-gray-500 font-medium">Quick Sync</div>
        <div className="font-bold text-sm">Connected</div>
      </div>
    </motion.div>
  </div>
);

const CAROUSEL_SLIDES = [
  {
    title: "Speady, Easy and Fast",
    desc: "UFLOW 幫助您輕鬆管理健康與生活，快速完成結帳與會員專屬體驗。立即加入享受全方位服務。",
    Visual: SlideOneVisual,
  },
  {
    title: "專屬會員回饋與優惠",
    desc: "加入 UFLOW 家族，享有最新健康資訊、專屬購物優惠與不定期的驚喜回饋。",
    Visual: SlideTwoVisual,
  },
  {
    title: "多平台無縫登入",
    desc: "支援 LINE、Google、Facebook 快速登入，一鍵啟動您的健康旅程，安全又便利。",
    Visual: SlideThreeVisual,
  },
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const [lineLoading, setLineLoading] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);

  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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
        setSuccess("登入成功，正在為您跳轉...");
        setTimeout(() => router.replace(next), 500);
      } else {
        setError(data?.message || "登入失敗，請確認帳號與密碼。");
      }
    } catch {
      setError("登入過程發生錯誤，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

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
      const redirectUri = window.location.origin + "/api/auth/line/callback";
      const state = "random_state_string";
      const scope = "profile openid email";
      window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&state=${state}&scope=${scope}`;
    } catch (e) {
      console.error(e);
      setLineLoading(false);
    }
  }

  const isAnyLoading = loading || googleLoading || fbLoading || lineLoading;

  return (
    <div className="min-h-screen flex bg-white">
      {/* 左側：輪播圖區塊 */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 text-white relative flex-col justify-between overflow-hidden">
        <div className="absolute top-10 right-10 grid grid-cols-3 gap-2 opacity-20">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-1 h-3 bg-white rounded-full"></div>
          ))}
        </div>
        <div className="absolute bottom-10 left-10 grid grid-cols-3 gap-2 opacity-20">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
          ))}
        </div>

        <div className="p-10 z-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-600 rounded-tl-full rounded-br-full"></div>
          </div>
          <span className="text-2xl font-bold tracking-wider">UFLOW</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-12 z-10 w-full">
          <div className="w-full max-w-sm relative h-[400px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full flex flex-col items-center absolute"
              >
                <div className="mb-12 w-full flex justify-center">
                  {(() => {
                    const CurrentVisual = CAROUSEL_SLIDES[currentSlide].Visual;
                    return <CurrentVisual />;
                  })()}
                </div>
                <div className="text-center max-w-md h-32">
                  <h2 className="text-3xl font-bold mb-4">
                    {CAROUSEL_SLIDES[currentSlide].title}
                  </h2>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    {CAROUSEL_SLIDES[currentSlide].desc}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex gap-2 mt-8 z-20">
            {CAROUSEL_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? "w-6 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 右側：表單區塊 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">登入您的帳號</h2>
            <p className="text-gray-500 text-sm">歡迎回來，繼續您的健康旅程</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm text-center">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={isAnyLoading}
              className="flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span className="text-sm font-medium text-gray-700">
                Google 登入
              </span>
            </button>
            <button
              type="button"
              onClick={handleLineLogin}
              disabled={isAnyLoading}
              className="flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
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
              <span className="text-sm font-medium text-gray-700">
                LINE 登入
              </span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400">
                或使用信箱登入
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="帳號或信箱"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                disabled={isAnyLoading}
                required
              />
              <div>
                <input
                  type="password"
                  placeholder="密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  disabled={isAnyLoading}
                  required
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/forgot-password?next=${encodeURIComponent(next)}`,
                      )
                    }
                    className="text-xs text-blue-600 font-medium hover:underline"
                  >
                    忘記密碼？
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAnyLoading}
              className={`w-full py-3 rounded-lg text-white text-sm font-semibold transition-all shadow-sm ${
                isAnyLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
              }`}
            >
              {loading ? "處理中..." : "登入 Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 pt-2">
            還沒有帳號？{" "}
            <a
              href={`/register?next=${encodeURIComponent(next)}`}
              className="text-blue-600 font-semibold hover:underline"
            >
              立即註冊 Sign Up
            </a>
          </p>

          <div className="absolute bottom-8 left-0 right-0 flex justify-between px-8 sm:px-12 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600 transition">
              Privacy Policy
            </a>
            <span>Copyright 2026 UFLOW</span>
          </div>
        </div>
      </div>
    </div>
  );
}
