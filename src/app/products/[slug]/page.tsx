// app/products/[slug]/page.tsx
import { fetchAllProductSlugs, fetchProductBySlug } from "@/lib/woo";
import ProductClient from "./Client";
import Script from "next/script";

export const revalidate = 60; // ISR 每 60 秒

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
  const baseUrl = "https://www.kuankoshi.com"; // 👈 之後可換成正式網域

  if (!p) {
    const notFoundTitle = `商品未找到｜${siteName}`;
    return {
      title: notFoundTitle,
      description: "抱歉，找不到對應的 UFLOW 保健食品商品。",
      robots: { index: false, follow: false },
      openGraph: {
        type: "website",
        title: notFoundTitle,
        siteName,
        url: `${baseUrl}/products/${params.slug}`,
      },
    } as any;
  }

  const ogImg = p.images?.[0]?.src;
  const url = `${baseUrl}/products/${p.slug}`;

  const rawDesc =
    p.short_description || p.description || `${p.name}｜UFLOW 保健食品`;
  const descText = rawDesc
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const desc160 =
    descText.length > 160 ? `${descText.slice(0, 157)}…` : descText;

  const title = `${p.name}｜UFLOW 保健食品商品介紹與購買`;

  return {
    title,
    description: desc160,
    keywords: [
      "UFLOW",
      "UFLOW 保健食品",
      "保健食品",
      "營養補充品",
      "機能飲品",
      "健康食品",
      p.name,
    ],
    alternates: { canonical: url },
    openGraph: {
      type: "website", // Next 14 建議用 website
      title,
      description: desc160,
      url,
      siteName,
      images: ogImg
        ? [{ url: ogImg, width: 1200, height: 630, alt: p.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc160,
      images: ogImg ? [ogImg] : undefined,
    },
  } as any;
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  // ✅ 後備資料：UFLOW 類型的保健食品示意
  const fallback = {
    id: "uflow-supplement-pack",
    name: "UFLOW 日常機能營養配方",
    subname: "Daily Functional Nutrition",
    price: 1480,
    desc: "UFLOW 精選維生素、礦物質與機能配方，協助調整體質、維持日常好精神。",
    images: [
      "https://d2w53g1q050m78.cloudfront.net/koredakecojp/uploads/images/pages/products/shakepack-3.jpg",
      "https://d2w53g1q050m78.cloudfront.net/koredakecojp/uploads/images/pages/products/shakepack-2.jpg",
    ],
  };

  let woo: Awaited<ReturnType<typeof fetchProductBySlug>> | null = null;
  try {
    woo = await fetchProductBySlug(params.slug);
  } catch {
    woo = null;
  }

  // ✅ JSON-LD（Product + Brand）
  const ld = woo
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: woo.name,
        brand: {
          "@type": "Brand",
          name: "UFLOW",
        },
        image: (woo.images || []).map((i) => i.src),
        description: (woo.short_description || woo.description || "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
        offers: {
          "@type": "Offer",
          priceCurrency: "JPY",
          price: Number(woo.price || 0),
          availability: "https://schema.org/InStock",
          url: `https://www.kuankoshi.com/products/${woo.slug}`,
        },
      }
    : {
        "@context": "https://schema.org",
        "@type": "Product",
        name: fallback.name,
        brand: {
          "@type": "Brand",
          name: "UFLOW",
        },
        image: fallback.images,
        description: fallback.desc,
        offers: {
          "@type": "Offer",
          priceCurrency: "JPY",
          price: fallback.price,
          availability: "https://schema.org/InStock",
        },
      };

  return (
    <>
      {/* ✅ 結構化資料，SSR 時就輸出在 HTML 裡 */}
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
                price: Number(woo.price || 0),
                desc: (woo.short_description || woo.description || "")
                  .replace(/<[^>]+>/g, " ")
                  .replace(/\s+/g, " ")
                  .trim(),
                images: (woo.images || []).map((i) => i.src),
              }
            : fallback
        }
      />
    </>
  );
}
