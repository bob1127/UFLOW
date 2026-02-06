"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react"; // 假設你有裝 lucide-react，沒有的話可拿掉

// 1. 內容元件：負責讀取網址參數
function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white border border-gray-100 shadow-xl rounded-2xl p-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">付款完成</h1>
        <p className="text-gray-500 mb-8">感謝您的購買，您的訂單已成功建立</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">訂單編號</p>
          <p className="text-xl font-black text-gray-900">
            {orderId ? `#${orderId}` : "載入中..."}
          </p>
        </div>

        <a
          href="/"
          className="block w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition active:scale-95"
        >
          返回首頁
        </a>
      </div>
    </div>
  );
}

// 2. 主頁面：加上 Suspense (這是 Next.js 規範，為了避免 useSearchParams 報錯)
export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          載入中...
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
