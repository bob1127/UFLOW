// app/thank-you/thank-you-client.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ThankYouClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const orderId = sp.get("orderId");

  const [status, setStatus] = useState("loading"); // loading | ok | missing

  useEffect(() => {
    if (!orderId) {
      setStatus("missing");
      return;
    }
    setStatus("ok");

    // ✅ 可選：付款成功後清購物車
    try {
      sessionStorage.removeItem("cart_items");
      sessionStorage.removeItem("cart_coupon");
    } catch {}
  }, [orderId]);

  if (status === "loading") return null;

  if (status === "missing") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full bg-white border rounded-2xl p-6">
          <h1 className="text-lg font-black">找不到訂單資訊</h1>
          <p className="text-sm text-gray-500 mt-2">
            缺少 orderId，請從訂單頁或信件連結進入。
          </p>
          <button
            className="mt-5 w-full py-3 rounded-xl bg-black text-white font-black"
            onClick={() => router.push("/")}
          >
            回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white border rounded-2xl p-6">
        <h1 className="text-xl font-black">付款成功 ✅</h1>
        <p className="text-sm text-gray-600 mt-2">
          感謝你的購買！我們已收到付款並開始處理訂單。
        </p>

        <div className="mt-4 p-4 rounded-xl bg-gray-50 border">
          <div className="text-xs text-gray-500">訂單編號</div>
          <div className="text-lg font-black">{orderId}</div>
        </div>

        <div className="mt-5 grid gap-3">
          <button
            className="w-full py-3 rounded-xl bg-black text-white font-black"
            onClick={() => router.push("/")}
          >
            繼續購物
          </button>
          <button
            className="w-full py-3 rounded-xl border font-black"
            onClick={() => router.push("/cart")}
          >
            回購物車
          </button>
        </div>
      </div>
    </div>
  );
}
