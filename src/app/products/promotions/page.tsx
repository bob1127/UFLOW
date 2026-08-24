// app/products/promotions/page.tsx
import { fetchAllProducts, filterPromoProducts } from "@/lib/woo";
import Client from "../Client";
import Script from "next/script";
import type { Metadata } from "next";
import { getSiteUrl, buildBreadcrumbSchema } from "@/lib/seo/business";
import { toSiteMediaUrl } from "@/lib/mediaUrl";

const SITE_URL = getSiteUrl();

export const revalidate = 60;

export const metadata: Metadata = {
  title: "優惠活動｜UFLOW 保健食品",
  description:
    "瀏覽 UFLOW 限時優惠與促銷方案，包含買二送一、買三贈二等活動商品，把握期間限定折扣。",
  keywords: ["UFLOW", "優惠活動", "促銷", "保健食品", "限時折扣"],
  alternates: {
    canonical: `${SITE_URL}/products/promotions`,
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    title: "優惠活動｜UFLOW 保健食品",
    description: "瀏覽 UFLOW 限時優惠與促銷方案，把握期間限定折扣。",
    url: `${SITE_URL}/products/promotions`,
    siteName: "UFLOW",
    images: [
      {
        url: `${SITE_URL}/images/og/products-cover.jpg`,
        width: 1200,
        height: 630,
        alt: "UFLOW 優惠活動",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "優惠活動｜UFLOW 保健食品",
    description: "瀏覽 UFLOW 限時優惠與促銷方案，把握期間限定折扣。",
    images: [`${SITE_URL}/images/og/products-cover.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function PromotionsPage() {
  let items: any[] = [];

  try {
    const all = await fetchAllProducts();
    items = filterPromoProducts(all);
  } catch (error) {
    console.error("Failed to load promo products:", error);
    items = [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/products/promotions/#itemlist`,
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
      { name: "優惠活動", url: `${SITE_URL}/products/promotions` },
    ],
    SITE_URL,
    "/products/promotions/#breadcrumb",
  );

  return (
    <>
      <Script
        id="json-ld-promotions"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="json-ld-promotions-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Client items={items} title="優惠活動" />
    </>
  );
}
