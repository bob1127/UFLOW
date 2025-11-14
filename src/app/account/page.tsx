// app/account/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/profile", {
        cache: "no-store",
        credentials: "include", // 一定帶 cookies
      });
      const data = await res.json();
      if (data?.loggedIn) {
        setLoggedIn(true);
        setCustomer(data.customer || {});
      } else {
        setLoggedIn(false);
        setCustomer(null);
      }
    } catch (e: any) {
      setError("讀取會員資料失敗，請稍後再試。");
      setLoggedIn(false);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ====== UI ======
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-slate-500">載入中…</div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">尚未登入</h1>
          <p className="mt-2 text-sm text-slate-600">
            請先登入以檢視會員資料。
          </p>
          <button
            onClick={() =>
              router.push(`/login?next=${encodeURIComponent("/account")}`)
            }
            className="mt-4 w-full rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
          >
            前往登入
          </button>
          {error && (
            <p className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md p-2">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  const displayName =
    (customer?.first_name || "") +
      (customer?.last_name ? ` ${customer?.last_name}` : "") ||
    customer?.username ||
    (customer?.email ? customer.email.split("@")[0] : "會員");

  return (
    <div className="min-h-[60vh] py-10 px-4 ">
      <div className="mx-auto w-full max-w-2xl rounded-xl mt-[100px] border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">我的帳戶</h1>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.replace("/login?next=/account");
            }}
            className="rounded-md border px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50"
          >
            登出
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 text-sm text-slate-500">姓名</div>
            <div className="col-span-2">{displayName}</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 text-sm text-slate-500">電子信箱</div>
            <div className="col-span-2">{customer?.email || "-"}</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 text-sm text-slate-500">使用者名稱</div>
            <div className="col-span-2">{customer?.username || "-"}</div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          {/* <h2 className="text-lg font-medium">安全性</h2>
          <p className="mt-2 text-sm text-slate-500">
            之後可在此提供修改「信箱」與「密碼」表單，呼叫
            <code className="mx-1 rounded bg-slate-100 px-1 py-0.5">
              /api/account/update
            </code>
            完成更新。
          </p> */}
          <div className="mt-4">
            <button
              onClick={loadProfile}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              重新整理資料
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
