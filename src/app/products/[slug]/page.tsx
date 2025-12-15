// app/products/[slug]/page.tsx
import { fetchAllProductSlugs, fetchProductBySlug } from "@/lib/woo";
import ProductClient from "./Client";
import Script from "next/script";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const slugs = await fetchAllProductSlugs({ perPage: 50 });
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [] as { slug: string }[];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const p = await fetchProductBySlug(params.slug);
  const siteName = "UFLOW 保健食品官方網站";
  const baseUrl = "https://www.kuankoshi.com";

  if (!p) {
    // ... (維持原樣)
    return {} as any;
  }

  // ... (維持原樣 metadata 邏輯)
  const title = `${p.name}｜UFLOW 保健食品商品介紹與購買`;

  // 簡單處理 meta description (去除 HTML標籤)
  const rawDesc = p.short_description || p.description || "";
  const descText = rawDesc
    .replace(/<[^>]+>/g, " ")
    .trim()
    .slice(0, 160);

  return {
    title,
    description: descText,
    // ... (維持原樣)
  } as any;
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const fallback = {
    id: "uflow-supplement-pack",
    name: "UFLOW 日常機能營養配方",
    subname: "Daily Functional Nutrition",
    price: 1480,
    shortDescription: "UFLOW 精選維生素、礦物質與機能配方。",
    description: "<p>這是預設的詳細說明...</p>",
    images: [
      "https://d2w53g1q050m78.cloudfront.net/koredakecojp/uploads/images/pages/products/shakepack-3.jpg",
    ],
  };

  let woo: Awaited<ReturnType<typeof fetchProductBySlug>> | null = null;
  try {
    woo = await fetchProductBySlug(params.slug);
  } catch {
    woo = null;
  }

  const ld = woo
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: woo.name,
        brand: { "@type": "Brand", name: "UFLOW" },
        image: (woo.images || []).map((i) => i.src),
        description: (woo.short_description || "").replace(/<[^>]+>/g, " "),
        offers: {
          "@type": "Offer",
          priceCurrency: "TWD", // 修正幣別為台幣
          price: Number(woo.price || 0),
          availability: "https://schema.org/InStock",
          url: `https://www.kuankoshi.com/products/${woo.slug}`,
        },
      }
    : {}; // Fallback LD 省略

  return (
    <>
      <Script
        type="application/ld+json"
        id="ld-product"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      <ProductClient
        product={
          woo
            ? {
                id: String(woo.id),
                name: woo.name,
                subname: "",
                // 👇 修改這裡：傳遞更多價格資訊
                price: Number(woo.price || 0), // 這是目前實際售價 (若有特價會是特價，沒特價會是原價)
                regularPrice: Number(woo.regular_price || woo.price || 0), // 原價
                salePrice: woo.sale_price ? Number(woo.sale_price) : null, // 特價 (如果有的話)

                shortDescription: woo.short_description || "",
                description: woo.description || "",
                images: (woo.images || []).map((i) => i.src),
              }
            : fallback
        }
      />
    </>
  );
}
