// app/cart/page.jsx  （✅ 不要加 "use client"）

import CartPageClient from "./client"; // 預設匯入 client.jsx 的 default export
import React from "react";
import { getSiteUrl } from "@/lib/seo/business";

// ✅ 讓這個 route 以 SSG / ISR 方式輸出 HTML
export const dynamic = "force-static"; // 強制靜態
export const revalidate = 60 * 60; // ISR：每 1 小時最多重新產一次

const SITE_URL = getSiteUrl();

// ✅ SEO metadata（UFLOW 保健食品）
export const metadata = {
  title: "購物車｜UFLOW 官方保健食品商城",
  description:
    "查看您在 UFLOW 保健食品官方網站選購的保健食品、營養補充品與機能飲品。於此頁調整數量、輸入折扣碼並完成結帳，打造屬於你的日常健康步調。",
  keywords: [
    "UFLOW",
    "UFLOW 保健食品",
    "保健食品",
    "營養補充品",
    "機能飲品",
    "維生素",
    "健康管理",
    "購物車",
    "結帳頁",
  ],
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_URL}/cart`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/cart`,
    siteName: "UFLOW 官方保健食品商城",
    title: "購物車｜UFLOW 官方保健食品商城",
    description:
      "確認 UFLOW 保健食品購物車中的商品與金額，享受安心、透明的線上結帳流程。",
    images: [
      {
        url: `${SITE_URL}/images/logo/uflow.png`,
        width: 1200,
        height: 630,
        alt: "UFLOW 保健食品購物車畫面",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "購物車｜UFLOW 官方保健食品商城",
    description: "查看 UFLOW 保健食品購物車中的商品明細，輕鬆完成結帳流程。",
    images: [`${SITE_URL}/images/logo/uflow.png`],
  },
};

export default function CartPage() {
  // ✅ JSON-LD 結構化資料（讓搜尋引擎更懂這頁是在做什麼）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/cart/#webpage`,
    name: "購物車｜UFLOW 官方保健食品商城",
    description:
      "UFLOW 官方保健食品商城購物車頁面，在這裡確認商品明細、數量與小計金額，並進入結帳流程。",
    url: `${SITE_URL}/cart`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "首頁",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "購物車",
          item: `${SITE_URL}/cart`,
        },
      ],
    },
  };

  return (
    <>
      {/* ✅ 結構化資料：會直接輸出在 SSR HTML 裡，蜘蛛一進來就看得到 */}
      <script
        type="application/ld+json"
        // 注意：要轉成字串
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ✅ 真正的互動式購物車畫面（client component） */}
      <CartPageClient />
    </>
  );
}
