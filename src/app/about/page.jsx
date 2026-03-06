// app/about/page.jsx
import Script from "next/script";
import Client from "./client"; // 確保這裡的路徑與你的 Client 元件檔名一致

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.uflow.space";

// ===================== 強化 SEO Metadata (純 JS 寫法) =====================
export const metadata = {
  title: "關於 UFLOW｜科學實證保健食品品牌｜研發理念、第三方檢驗與永續承諾",
  description:
    "UFLOW 專注於以科學為本的保健食品與日常營養補給。從原料溯源、配方研發到第三方檢驗與永續包裝，我們以更透明的方式，陪伴每一次有效的日常補給。",
  keywords: [
    "關於 UFLOW",
    "保健食品品牌",
    "營養補充品",
    "第三方檢驗",
    "原料溯源",
    "功能性營養",
    "研發理念",
    "永續包裝",
    "UFLOW",
  ],
  icons: {
    icon: "/images/logo/uflow.ico",
  },
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: `${SITE_URL}/about`,
    siteName: "UFLOW 功能性保健食品",
    title: "關於 UFLOW｜科學實證保健食品品牌｜研發理念、第三方檢驗與永續承諾",
    description:
      "我們相信每一份補給都應該有根據、能感受、且對地球友善。了解 UFLOW 的品牌故事、研發流程與品質保證。",
    images: [
      {
        url: `${SITE_URL}/images/og/about-og.jpg`,
        width: 1200,
        height: 630,
        alt: "UFLOW 品牌形象與研發理念封面",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "關於 UFLOW｜科學實證保健食品品牌",
    description:
      "UFLOW 專注於以科學為本的保健食品與日常營養補給。了解我們的品牌故事、研發流程與品質保證。",
    images: [`${SITE_URL}/images/og/about-og.jpg`],
  },
};

export default function AboutPage() {
  // ===================== JSON-LD 結構化資料 =====================
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      // 1. 公司/品牌實體標記
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "UFLOW",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/images/logo/uflow.png`,
        },
        description:
          "UFLOW 是一家以提供高品質健康產品為核心的品牌。我們的研發精神在於將科學方法應用於天然原料，以科技養護身心。",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: "Traditional Chinese",
        },
      },
      // 2. 專屬關於頁標記
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/about/#webpage`,
        url: `${SITE_URL}/about`,
        name: "關於 UFLOW｜科學實證保健食品品牌",
        description: "了解 UFLOW 的品牌故事、研發理念、第三方檢驗與永續承諾。",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      // 3. 麵包屑導覽標記
      {
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
            name: "關於我們",
            item: `${SITE_URL}/about`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <Script
        type="application/ld+json"
        id="ld-about-schema"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />
      <Client />
    </>
  );
}
