// app/products/page.tsx
import { fetchAllProducts, filterHotProducts } from "@/lib/woo";
import Client from "./Client";
import Script from "next/script";
import type { Metadata } from "next";
import { getSiteUrl, buildBreadcrumbSchema } from "@/lib/seo/business";
import { toSiteMediaUrl } from "@/lib/mediaUrl";

const SITE_URL = getSiteUrl();

export const revalidate = 60;

export const metadata: Metadata = {
  title: "熱門產品｜UFLOW 保健食品",
  description:
    "瀏覽 UFLOW 熱銷保健食品與植物營養飲品，包含維他菌合生元、日常機能配方。提供完整商品資訊、價格、規格與購買服務。",
  keywords: ["UFLOW", "保健食品", "益生菌", "合生元", "植物營養", "健康"],
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    title: "熱門產品｜UFLOW 保健食品",
    description: "瀏覽 UFLOW 熱銷保健食品，為您的健康提供最佳選擇。",
    url: `${SITE_URL}/products`,
    siteName: "UFLOW",
    images: [
      {
        url: `${SITE_URL}/images/og/products-cover.jpg`,
        width: 1200,
        height: 630,
        alt: "UFLOW 熱門產品",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "熱門產品｜UFLOW 保健食品",
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
    const all = await fetchAllProducts();
    items = filterHotProducts(all);
  } catch (error) {
    console.error("Failed to load products:", error);
    items = [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/products/#itemlist`,
    itemListElement: items.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/products/${product.slug}`,
      name: product.name,
      image: product.images?.[0]?.src
        ? toSiteMediaUrl(product.images[0].src, SITE_URL)
        : "",
      offers: {
        "@type": "Offer",
        priceCurrency: "TWD",
        price: product.price,
      },
    })),
  };

  const breadcrumbJsonLd = buildBreadcrumbSchema(
    [
      { name: "首頁", url: SITE_URL },
      { name: "熱門產品", url: `${SITE_URL}/products` },
    ],
    SITE_URL,
    "/products/#breadcrumb",
  );

  return (
    <>
      <Script
        id="json-ld-products"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="json-ld-products-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Client items={items} title="熱門產品" />
    </>
  );
}
