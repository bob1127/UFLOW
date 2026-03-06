// app/page.jsx
import Script from "next/script";
import Client from "./home"; // 確保此路徑與你的 Client 元件檔名一致

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.uflow.space";

// ===================== 強化 SEO Metadata =====================
export const metadata = {
  title: "UFLOW｜功能性保健食品與營養補給｜專為亞洲體質研發・安心第三方檢驗",
  description:
    "UFLOW 專注於功能性保健食品與日常營養補給：益生菌、魚油、葉黃素、維生素 D3/K2、關節與睡眠配方等。嚴選原料、無多餘添加，並通過第三方檢驗，讓你補得安心、每日有感。",
  keywords: [
    "保健食品",
    "營養補充品",
    "益生菌",
    "魚油",
    "葉黃素",
    "維生素D3",
    "維生素K2",
    "關節保健",
    "睡眠保健",
    "機能飲品",
    "第三方檢驗",
    "UFLOW",
  ],
  icons: {
    icon: "/images/logo/uflow.ico",
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: SITE_URL,
    siteName: "UFLOW",
    title: "UFLOW｜功能性保健食品與營養補給｜專為亞洲體質研發・安心第三方檢驗",
    description:
      "嚴選原料、無多餘添加，並通過第三方檢驗的功能性保健食品。從視力、腸道、關節到睡眠，UFLOW 讓日常補給更有效率。",
    images: [
      {
        url: `${SITE_URL}/images/肽晶芙蓉/重返17歲の元氣-850.png`,
        width: 1200,
        height: 630,
        alt: "UFLOW 功能性保健食品品牌形象",
      },
    ],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const revalidate = 60;

export default function Page() {
  // ===================== JSON-LD 首頁專屬結構化資料 =====================
  // 針對首頁，使用 @graph 包裝 WebSite, Organization 與 WebPage 標記
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      // 1. 網站標記 (WebSite) - 告訴 Google 這是整個網站的入口，並有利於觸發站內搜尋框
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "UFLOW",
        description:
          "功能性保健食品與營養補給｜專為亞洲體質研發・安心第三方檢驗",
        inLanguage: "zh-TW",
      },
      // 2. 品牌實體標記 (Organization) - 建立品牌權威度 (E-E-A-T)
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "UFLOW",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/images/logo/uflow.png`, // 建議確認 Logo 實際路徑
        },
        description:
          "UFLOW 專注於功能性保健食品與日常營養補給。嚴選原料、無多餘添加，並通過第三方檢驗，讓你補得安心、每日有感。",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: "Traditional Chinese",
        },
      },
      // 3. 網頁標記 (WebPage) - 宣告這個具體的頁面是首頁
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: "UFLOW｜功能性保健食品與營養補給",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@id": `${SITE_URL}/#organization`,
        },
        description:
          "UFLOW 專注於功能性保健食品與日常營養補給：益生菌、魚油、葉黃素、維生素 D3/K2、關節與睡眠配方等。嚴選原料、無多餘添加，並通過第三方檢驗，讓你補得安心、每日有感。",
      },
    ],
  };

  return (
    <>
      {/* 埋入首頁結構化資料 */}
      <Script
        type="application/ld+json"
        id="ld-home-schema"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />

      {/* 渲染 Client 動畫與 UI 元件 */}
      <Client />
    </>
  );
}
