// app/products/[slug]/page.jsx
import { fetchAllProductSlugs, fetchProductBySlug } from "@/lib/woo";
import {
  filterValidImageUrls,
  sanitizeHtmlImages,
  toFullSizeImageUrl,
} from "@/lib/imageValidation";
import { toSiteMediaUrls, toSiteMediaPath } from "@/lib/mediaUrl";
import { buildImageAlt } from "@/lib/imageAlt";
import ProductClient from "./Client"; // 確保檔名大小寫與你的 Client 檔案一致
import {
  getSiteUrl,
  buildOrganizationSchema,
  BUSINESS,
} from "@/lib/seo/business";

export const revalidate = 60;

const SITE_URL = getSiteUrl();

// ===================== 動態 FAQ 生成器 =====================
function getProductFAQs(productName) {
  const name = String(productName).toLowerCase();

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

  // 預設 FAQ
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

// ===================== SSG 動態路由生成 =====================
export async function generateStaticParams() {
  try {
    const slugs = await fetchAllProductSlugs({ perPage: 50 });
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

// ===================== Metadata 動態生成與 SEO 優化 =====================
export async function generateMetadata({ params }) {
  const p = await fetchProductBySlug(params.slug);
  const siteName = "UFLOW 功能性保健食品官方商城";

  if (!p) {
    return {
      title: "找不到商品｜UFLOW",
      description: "您尋找的商品不存在或已下架。",
    };
  }

  // 1. 萃取分類名稱，用來豐富標題關鍵字
  const safeCategories = p?.categories;
  const categories = Array.isArray(safeCategories)
    ? safeCategories.map((c) => c?.name).filter(Boolean)
    : [];
  const categoryString =
    categories.length > 0 ? categories.slice(0, 2).join("、") : "營養補給";

  // 🌟 2. 優化且豐富的動態標題 (Title)
  // 組合範例："【維他菌合生元】專業益生菌、營養補給推薦｜UFLOW 保健食品"
  const title = `【${p.name}】專業${categoryString}推薦｜UFLOW 保健食品、日常健康調理`;

  // 3. 萃取乾淨的描述 (Description)
  const rawDesc = p.short_description || p.description || "";
  const cleanDesc = rawDesc
    .replace(/<[^>]+>/g, " ")
    .trim()
    .slice(0, 150);
  const descText = cleanDesc
    ? `${cleanDesc}... 了解更多關於 UFLOW ${p.name} 的科學實證配方與功效。`
    : `探索 UFLOW 嚴選【${p.name}】，我們以科學實證與天然植萃，為您提供最安心的高品質保健食品。全館滿額免運，立即查看詳細成分與評價！`;

  const productPath = `/products/${params.slug}`; // 相對路徑配合 metadataBase

  const safeImages = p?.images;
  const rawImages = Array.isArray(safeImages)
    ? safeImages.map((i) => toFullSizeImageUrl(i?.src)).filter(Boolean)
    : [];
  const validImages = await filterValidImageUrls(rawImages);
  // og:image 使用正式網域絕對 URL（經 Next rewrite 代理）
  const images = toSiteMediaUrls(validImages, SITE_URL);

  return {
    metadataBase: new URL(SITE_URL), // 核心：設定 base URL，解決 localhost 與正式機圖片路徑問題
    title,
    description: descText,
    keywords: [
      p.name,
      "UFLOW",
      "保健食品",
      categoryString,
      "營養補充",
      "科學實證",
      "原廠授權",
      ...categories,
    ]
      .filter(Boolean)
      .join(", "),
    alternates: { canonical: productPath },
    openGraph: {
      title,
      description: descText,
      url: productPath,
      siteName,
      images: images.map((src, i) => ({
        url: src,
        width: 800,
        height: 800,
        alt: buildImageAlt({
          name: p.name,
          src,
          index: i + 1,
          role: i === 0 ? "og" : "gallery",
        }),
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
    detailedContent: "",
    images: [],
    attributes: [],
    variations: [],
    acf: null,
  };

  const productFAQs = woo ? getProductFAQs(woo.name) : [];
  const rawSchemaImages =
    woo && Array.isArray(woo.images)
      ? woo.images.map((i) => toFullSizeImageUrl(i?.src)).filter(Boolean)
      : [];
  const validSchemaImages = await filterValidImageUrls(rawSchemaImages);
  // 畫廊用站內相對路徑；Schema / og 用正式網域絕對 URL
  const galleryImages = validSchemaImages.map((u) => toSiteMediaPath(u));
  const schemaImages = toSiteMediaUrls(validSchemaImages, SITE_URL);
  const productUrl = woo ? `${SITE_URL}/products/${woo.slug}` : "";

  let sanitizedShortDescription = "";
  let sanitizedDescription = "";
  let sanitizedDetailedContent = "";
  let sanitizedAcf = woo?.acf || null;
  if (woo) {
    const acfDetailed = woo.acf?.detailed_content || "";
    const [shortHtml, descHtml, acfHtml] = await Promise.all([
      sanitizeHtmlImages(woo.short_description || "", woo.name),
      sanitizeHtmlImages(woo.description || "", woo.name),
      sanitizeHtmlImages(acfDetailed, woo.name),
    ]);
    sanitizedShortDescription = shortHtml;
    sanitizedDescription = descHtml;
    sanitizedDetailedContent = acfHtml;
    if (acfDetailed) {
      sanitizedAcf = { detailed_content: acfHtml };
    }
  }

  const pureDescription = woo
    ? (woo.short_description || woo.description || "")
        .replace(/<[^>]+>/g, " ")
        .trim()
    : "";
  const finalPrice = woo ? Number(woo.price || 0) : 0;
  const availability =
    woo && woo.stock_status === "instock"
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  // ===================== 👑 結構化資料 1：商家與品牌實體 =====================
  // 與全站共用同一份 Organization/LocalBusiness 定義，確保地址、統編、聯絡方式一致
  const schemaBusiness = buildOrganizationSchema(SITE_URL);

  // ===================== 👑 結構化資料 2：商品與報價 =====================
  // 必填：name / brand / image / description / offers(price, priceCurrency, availability) / url
  const schemaProduct = woo
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${productUrl}/#product`,
        name: woo.name,
        url: productUrl,
        image: schemaImages,
        description: pureDescription || `探索 UFLOW 嚴選 ${woo.name}。`,
        sku: woo.sku || String(woo.id),
        brand: {
          "@type": "Brand",
          name: BUSINESS.brandName, // UFLOW
          url: SITE_URL,
          logo: `${SITE_URL}/images/logo/uflow.png`,
        },
        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "TWD",
          price: String(finalPrice),
          priceValidUntil: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1),
          )
            .toISOString()
            .split("T")[0],
          itemCondition: "https://schema.org/NewCondition",
          availability: availability,
          seller: { "@id": `${SITE_URL}/#organization` },

          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "TW",
            returnPolicyCategory:
              "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 7,
            returnMethod: "https://schema.org/ReturnByMail",
          },

          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "TW",
            },
            shippingRate: {
              "@type": "MonetaryAmount",
              value: String(BUSINESS.defaultShippingFee ?? 80),
              currency: "TWD",
            },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: {
                "@type": "QuantitativeValue",
                minValue: 1,
                maxValue: 2,
                unitCode: "d",
              },
              transitTime: {
                "@type": "QuantitativeValue",
                minValue: 1,
                maxValue: 3,
                unitCode: "d",
              },
            },
          },
        },
      }
    : null;

  // ===================== 👑 結構化資料 3：常見問題 =====================
  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/products/${params.slug}/#faq`,
    mainEntity: productFAQs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  // ===================== 👑 結構化資料 4：麵包屑導覽 =====================
  const schemaBreadcrumb = woo
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/products/${woo.slug}/#breadcrumb`,
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
      }
    : null;

  return (
    <>
      {/* 獨立拆分，逐一注入 JSON-LD，確保不在 div 包裝內 */}
      <script
        type="application/ld+json"
        id="schema-business"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBusiness) }}
      />
      {woo && (
        <script
          type="application/ld+json"
          id="schema-product"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaProduct) }}
        />
      )}
      <script
        type="application/ld+json"
        id="schema-faq"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }}
      />
      {woo && (
        <script
          type="application/ld+json"
          id="schema-breadcrumb"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }}
        />
      )}

      {/* 渲染 Client 端元件 */}
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
                shortDescription: sanitizedShortDescription,
                description: sanitizedDescription,
                detailedContent: sanitizedDetailedContent,
                images: galleryImages,
                attributes: woo.attributes || [],
                variations: (woo.variations || []).map((v) => ({
                  id: v.id,
                  sku: v.sku || "",
                  label: v.label,
                  price: Number(v.price || 0),
                  regularPrice: Number(v.regular_price || v.price || 0),
                  salePrice: v.sale_price ? Number(v.sale_price) : null,
                  description: v.description || "",
                  stockStatus: v.stock_status || "instock",
                })),
                acf: sanitizedAcf,
              }
            : fallback
        }
      />
    </>
  );
}
