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
  if (!p) {
    return { title: "商品未找到", robots: { index: false } } as any;
  }

  const ogImg = p.images?.[0]?.src;
  const url = `https://www.kuankoshi.com/products/${p.slug}`;
  const desc160 =
    p.short_description?.replace(/<[^>]+>/g, " ")?.slice(0, 160) || p.name;

  return {
    title: `${p.name}｜商品介紹與購買`,
    description: desc160,
    alternates: { canonical: url },
    openGraph: {
      // ✅ Next 14 不支援 "product"；使用 "website" 或省略 type
      type: "website",
      title: `${p.name}｜商品介紹與購買`,
      url,
      images: ogImg
        ? [{ url: ogImg, width: 1200, height: 630, alt: p.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.name}｜商品介紹與購買`,
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
  // 後備資料（當 Woo API 失敗時）
  const fallback = {
    id: "shake-pack",
    name: "SHAKE PACK",
    subname: "產品名稱",
    price: 4210,
    desc: "健康蛋白質 15g / 50次分次包裝",
    images: [
      "https://d2w53g1q050m78.cloudfront.net/koredakecojp/uploads/images/pages/products/shakepack-3.jpg",
      "https://d2w53g1q050m78.cloudfront.net/koredakecojp/uploads/images/pages/products/shakepack-2.jpg",
      "https://d2w53g1q050m78.cloudfront.net/koredakecojp/uploads/images/pages/products/shakepack-4.jpg",
      "https://d2w53g1q050m78.cloudfront.net/koredakecojp/uploads/images/pages/products/shakepack-5.jpg",
      "https://ec-force.s3.amazonaws.com/koredakecojp/uploads/images/pages/products/shakepack_8-milktea.jpg?20250401",
    ],
  };

  let woo: Awaited<ReturnType<typeof fetchProductBySlug>> | null = null;
  try {
    woo = await fetchProductBySlug(params.slug);
  } catch {
    woo = null;
  }

  // JSON-LD（產品）
  const ld = woo
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: woo.name,
        image: (woo.images || []).map((i) => i.src),
        description: (woo.short_description || woo.description || "").replace(
          /<[^>]+>/g,
          " "
        ),
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
                desc: (woo.short_description || woo.description || "").replace(
                  /<[^>]+>/g,
                  " "
                ),
                images: (woo.images || []).map((i) => i.src),
              }
            : fallback
        }
      />
    </>
  );
}
