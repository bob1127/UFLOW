// app/thank-you/page.jsx
import React, { Suspense } from "react";
import ThankYouClient from "./thank-you-client";

export const dynamic = "force-dynamic"; // 避免被靜態預渲染卡住（保險）
export const revalidate = 0;

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-gray-400 font-black tracking-widest">UFLOW</div>
        </div>
      }
    >
      <ThankYouClient />
    </Suspense>
  );
}
