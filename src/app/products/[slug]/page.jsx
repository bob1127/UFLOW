// app/products/[slug]/page.jsx
import { fetchAllProductSlugs, fetchProductBySlug } from "@/lib/woo";
import ProductClient from "./Client";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.uflow.space";

// ===================== 動態 FAQ 生成器 =====================
function getProductFAQs(productName) {
  const name = productName.toLowerCase();

  if (name.includes("gaba") || name.includes("香蜂草") || name.includes("鎂")) {
    return [
      {
        question: "為什麼要採用 1+1 顆設計？",
        answer:
          "我們主張日夜雙段調理的「節奏管理」概念。白天保持精神，夜晚自然放鬆，非一次性壓抑身體，而是陪伴身體走過一整天的節奏變化，無刺激性且不含藥性，適合長期每日使用。",
      },
      {
        question: "GABA 鎂鎂香蜂草的主要成分有哪些？",
        answer:
          "嚴選三大國際原廠專利足量成分：包含韓國專利 GABAEX 500mg、義大利專利速可包覆鎂 200mg，以及法國原廠香蜂草 200mg，成分國別與劑量全透明。",
      },
      {
        question: "這款產品適合哪些族群？",
        answer:
          "特別適合高壓工作型態、作息與飲食不規律、需要調時差或長途搭機、飲酒頻率較高、睡眠品質不穩定，以及規律運動與健身的族群。",
      },
    ];
  } else if (name.includes("肽晶芙蓉")) {
    return [
      {
        question: "肽晶芙蓉與一般抗氧化產品有何不同？",
        answer:
          "我們採用先進的「微脂體包覆技術」，大幅提升吸收率。內含微脂體榖胱甘肽、冰晶番茄及能 24 小時緩慢釋放的複方維生素 C，能有效防光傷、支持抗氧化循環，維持基底透亮感與健康氣色。",
      },
      {
        question: "這款產品適合哪些人補充？",
        answer:
          "特別適合醫美後保養族群、對美極度要求的族群、髮質脆弱族群、經常飲酒族群，以及運動健身族群，幫助您重建 17 歲的素顏元氣。",
      },
    ];
  } else if (
    name.includes("維他菌") ||
    name.includes("合生元") ||
    name.includes("益生菌")
  ) {
    return [
      {
        question: "吃益生菌為什麼常常覺得沒感覺？",
        answer:
          "原因通常不是菌不好，而是消化道環境不適合好菌留存。我們採用「合生元 (Synbiotics)」設計，將益生菌、益生元與後生元（專利益萃質®）結合，維持細菌叢在體內的續航力。",
      },
      {
        question: "維他菌合生元含有哪些關鍵菌株？",
        answer:
          "我們嚴選 4 株具功能分工的原廠菌株：LPL28 (調整蠕動節奏)、AP-32 (支持菌相平衡)、F-1 (協助防護機制)、CP-9 (高耐受性)，並採用專利三層包埋凍晶技術提升存活率。",
      },
      {
        question: "產品有搭配中藥調理嗎？",
        answer:
          "有的，UFLOW 維他菌合生元在益生菌配方中特別搭配了漢方成分，提供更溫和且完整的營養補充設計，作為日常規律調理的輔助。",
      },
    ];
  }

  return [
    {
      question: "商品有提供退換貨服務嗎？",
      answer:
        "有的，全館滿 NT$ 2,000 免運費。若商品包裝破損或內容有異，請於收到後 7 日內聯繫客服。若因個人原因退換貨，商品需保持未拆封狀態。",
    },
    {
      question: "UFLOW 的產品特色是什麼？",
      answer:
        "UFLOW 致力於經過科學研究提供有效的健康輔助方案，嚴選國際原廠專利足量成分，並拒絕無效添加，陪伴您走過每一天的健康節奏。",
    },
  ];
}

export async function generateStaticParams() {
  try {
    const slugs = await fetchAllProductSlugs({ perPage: 50 });
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

// ===================== Metadata =====================
export async function generateMetadata({ params }) {
  const p = await fetchProductBySlug(params.slug);
  const siteName = "UFLOW 保健食品官方網站";

  if (!p) {
    return {
      title: "找不到商品｜UFLOW",
      description: "您尋找的商品不存在或已下架。",
    };
  }

  const title = `${p.name}｜UFLOW 保健食品商品介紹與購買`;
  const rawDesc = p.short_description || p.description || "";
  const descText =
    rawDesc
      .replace(/<[^>]+>/g, " ")
      .trim()
      .slice(0, 160) || `${p.name} - UFLOW嚴選高品質保健食品，為您的健康把關。`;
  const productUrl = `${SITE_URL}/products/${params.slug}`;

  const safeImages = p?.images;
  const images = Array.isArray(safeImages)
    ? safeImages.map((i) => i?.src).filter(Boolean)
    : [];
  const safeCategories = p?.categories;
  const categories = Array.isArray(safeCategories)
    ? safeCategories.map((c) => c?.name).filter(Boolean)
    : [];

  return {
    title,
    description: descText,
    keywords: [p.name, "UFLOW", "保健食品", "益生菌", "營養補充", ...categories]
      .filter(Boolean)
      .join(", "),
    alternates: { canonical: productUrl },
    openGraph: {
      title,
      description: descText,
      url: productUrl,
      siteName,
      images: images.map((src) => ({
        url: src,
        width: 800,
        height: 800,
        alt: p.name,
      })),
      type: "website",
      locale: "zh_TW",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: descText,
      images: images.length > 0 ? [images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  let woo = null;
  try {
    woo = await fetchProductBySlug(params.slug);
  } catch {
    woo = null;
  }

  const fallback = {
    id: "uflow-supplement-pack",
    name: "UFLOW 嚴選商品",
    subname: "",
    price: 0,
    shortDescription: "",
    description: "",
    images: [],
    attributes: [],
    acf: null,
  };

  const productFAQs = woo ? getProductFAQs(woo.name) : [];
  const schemaImages =
    woo && Array.isArray(woo.images)
      ? woo.images.map((i) => i?.src).filter(Boolean)
      : [];

  // ===================== 👑 內頁終極 @graph 結構化資料 =====================
  const schemaGraph = woo
    ? {
        "@context": "https://schema.org",
        "@graph": [
          // 1. 公司實體標記 (Organization)
          {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: "UFLOW",
            url: SITE_URL,
            logo: {
              "@type": "ImageObject",
              url: `${SITE_URL}/images/logo/uflow.png`,
            },
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer service",
              availableLanguage: "Traditional Chinese",
            },
          },
          // 2. 商品結構化資料 (Product)
          {
            "@type": "Product",
            name: woo.name,
            image: schemaImages,
            description: (woo.short_description || woo.description || "")
              .replace(/<[^>]+>/g, " ")
              .trim(),
            sku: woo.sku || String(woo.id),
            brand: { "@id": `${SITE_URL}/#organization` }, // 👈 完美連結品牌
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "5.0",
              reviewCount: "114",
              bestRating: "5",
              worstRating: "1",
            },
            offers: {
              "@type": "Offer",
              url: `${SITE_URL}/products/${woo.slug}`,
              priceCurrency: "TWD",
              price: Number(woo.price || 0),
              priceValidUntil: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1),
              )
                .toISOString()
                .split("T")[0],
              itemCondition: "https://schema.org/NewCondition",
              availability:
                woo.stock_status === "instock"
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              seller: { "@id": `${SITE_URL}/#organization` }, // 👈 完美連結販售者
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                applicableCountry: "TW",
                returnPolicyCategory:
                  "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: 7,
                returnMethod: "https://schema.org/ReturnByMail",
              },
            },
          },
          // 3. 常見問題結構化資料 (FAQPage)
          {
            "@type": "FAQPage",
            mainEntity: productFAQs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
          // 4. 麵包屑導覽結構化資料 (BreadcrumbList)
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "首頁",
                item: `${SITE_URL}`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "所有商品",
                item: `${SITE_URL}/products`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: woo.name,
                item: `${SITE_URL}/products/${woo.slug}`,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {schemaGraph && (
        <div style={{ display: "none" }} aria-hidden="true">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
          />
        </div>
      )}
      <ProductClient
        faqs={productFAQs}
        product={
          woo
            ? {
                id: String(woo.id),
                name: woo.name,
                subname: "",
                price: Number(woo.price || 0),
                regularPrice: Number(woo.regular_price || woo.price || 0),
                salePrice: woo.sale_price ? Number(woo.sale_price) : null,
                shortDescription: woo.short_description || "",
                description: woo.description || "",
                images: schemaImages,
                attributes: woo.attributes || [],
                acf: woo.acf || null,
              }
            : fallback
        }
      />
    </>
  );
}
