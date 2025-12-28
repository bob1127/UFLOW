"use client";

import { useSearchParams } from "next/navigation";

export default function ThankYouClient() {
  const sp = useSearchParams();
  const orderId = sp.get("orderId");

  return (
    <div className="min-h-screen flex items-center justify-center p-10">
      <div className="max-w-lg w-full bg-white border rounded-xl p-6">
        <h1 className="text-xl font-semibold">付款完成 ✅</h1>
        <p className="mt-3 text-gray-600">
          {orderId ? (
            <>
              您的訂單編號：<b>#{orderId}</b>
            </>
          ) : (
            "正在取得訂單資訊…"
          )}
        </p>
      </div>
    </div>
  );
}
