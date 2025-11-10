// app/thank-you/page.jsx
"use client";

import React, { useEffect, useState } from "react";

const currency = (n) =>
  `NT$${(Math.round(n * 100) / 100).toLocaleString("zh-TW")}`;

export default function ThankYouPage() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("last_order");
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
  }, []);

  if (!order) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-2xl font-bold">感謝您的訂購！</h1>
        <p className="text-gray-600">
          找不到訂單資料，但您可以回到首頁或查看帳號訂單。
        </p>
        <a href="/" className="px-4 py-2 rounded bg-black text-white">
          回首頁
        </a>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <img src="/images/logo/logo-y.png" alt="ARDOAK" className="h-7" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8 grid lg:grid-cols-12 gap-8">
        {/* 左：地圖卡＋訊息（示意） */}
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full border grid place-items-center">
                ✓
              </div>
              <div>
                <div className="text-sm text-gray-500">確認 #{order.id}</div>
                <h1 className="text-xl font-semibold">已送出，感謝您！</h1>
              </div>
            </div>

            <div className="mt-4 rounded-lg overflow-hidden border">
              {/* 你可換成實際 Google Map iframe */}
              <img
                src="https://maps.googleapis.com/maps/api/staticmap?center=Taichung&zoom=12&size=800x300&scale=2&maptype=roadmap&markers=color:red%7CTaichung"
                alt="選送地址地圖（示意）"
                className="w-full h-auto"
              />
            </div>

            <p className="mt-4 text-sm text-gray-700">
              您很快就會收到確認電子郵件。
            </p>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">訂單詳細資訊</h2>
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-gray-500 mb-1">聯絡資訊</div>
                <div>{order.contact?.email || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">付款方式</div>
                <div>
                  {order.payMethod === "card" ? "信用卡" : "LINE Pay"} —{" "}
                  <span className="font-medium">
                    {currency(order.pricing.total)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">運送地址</div>
                <div className="whitespace-pre-line">
                  {order.addr?.zip ? `${order.addr.zip}\n` : ""}
                  {order.addr?.country} {order.addr?.city}
                  {order.addr?.line1 ? `\n${order.addr.line1}` : ""}
                  {order.addr?.line2 ? `\n${order.addr.line2}` : ""}
                  {order.addr?.phone ? `\n${order.addr.phone}` : ""}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">運送方式</div>
                <div>000「宅配速送」新竹物流</div>
              </div>
            </div>
          </div>
        </section>

        {/* 右：金額摘要與商品 */}
        <aside className="lg:col-span-4">
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="space-y-4">
              {order.items.map((it) => (
                <div key={it.id} className="flex gap-3">
                  <div className="w-14 h-14 rounded-md overflow-hidden border">
                    <img
                      src={it.img}
                      alt={it.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium line-clamp-2">
                        {it.title}
                      </p>
                      <div className="text-sm whitespace-nowrap">
                        {currency(it.price * it.qty)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      尺寸 {it.variant} × {it.qty}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">小計</span>
                <span>{currency(order.pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">運送</span>
                <span>
                  {order.pricing.shipping === 0
                    ? "免費"
                    : currency(order.pricing.shipping)}
                </span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">折扣</span>
                  <span className="text-emerald-700">
                    - {currency(order.pricing.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3 text-base font-semibold">
                <span>總計</span>
                <span>{currency(order.pricing.total)}</span>
              </div>
            </div>

            <a
              href="/"
              className="mt-6 block text-center px-4 py-3 rounded-lg bg-black text-white"
            >
              繼續購物
            </a>
          </div>
        </aside>
      </main>
    </div>
  );
}
