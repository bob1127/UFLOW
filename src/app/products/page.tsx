// app/products/page.tsx
import { fetchAllProducts } from "@/lib/woo";
import Client from "./Client";
import Script from "next/script";
import type { Metadata } from "next";

// 🔄 設定您的正式網址 (請修改這裡)
// 建議設定在 .env 檔案中，例如 process.env.NEXT_PUBLIC_SITE_URL
const SITE_URL = "https://www.your-actual-domain.com";

export const revalidate = 60;

// 1. 完整的 SEO Metadata 設定
export const metadata: Metadata = {
  title: "所有商品一覽｜UFLOW 保健食品",
  description:
    "瀏覽 UFLOW 熱銷保健食品與植物營養飲品，包含維他菌合生元、日常機能配方。提供完整商品資訊、價格、規格與購買服務。",
  keywords: ["UFLOW", "保健食品", "益生菌", "合生元", "植物營養", "健康"],
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    title: "所有商品一覽｜UFLOW 保健食品",
    description: "瀏覽 UFLOW 熱銷保健食品，為您的健康提供最佳選擇。",
    url: `${SITE_URL}/products`,
    siteName: "UFLOW",
    images: [
      {
        url: `${SITE_URL}/images/og/products-cover.jpg`, // 請確保此圖片存在
        width: 1200,
        height: 630,
        alt: "UFLOW 商品一覽",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "所有商品一覽｜UFLOW 保健食品",
    description: "瀏覽 UFLOW 熱銷保健食品，為您的健康提供最佳選擇。",
    images: [`${SITE_URL}/images/og/products-cover.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function ProductsPage() {
  let items: any[] = [];

  try {
    items = await fetchAllProducts();
  } catch (error) {
    console.error("Failed to load products:", error);
    items = [];
  }

  // 2. 建立 ItemList 結構化資料 (Schema.org)
  // 這告訴搜尋引擎這是一個「列表頁」，包含哪些產品
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/products/${product.slug}`,
      name: product.name,
      image: product.images?.[0]?.src || "",
      offers: {
        "@type": "Offer",
        priceCurrency: "TWD",
        price: product.price,
      },
    })),
  };

  return (
    <>
      {/* 注入結構化資料 */}
      <Script
        id="json-ld-products"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 渲染 Client Component */}
      <Client items={items} />
    </>
  );
}
