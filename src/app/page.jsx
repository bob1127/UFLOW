// app/page.jsx
import Client from "./home";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.uflow.space";

// 🌟 首頁動態 FAQ 資料
const homeFAQs = [
  {
    question: "UFLOW 的保健食品是哪裡製造的？",
    answer:
      "我們的產品嚴選國際大廠專利原料，並在台灣符合 ISO22000 與 HACCP 規範的專業廠房製造，全系列產品皆通過第三方公正檢驗，確保安全無虞。",
  },
  {
    question: "訂購後大約幾天可以收到商品？",
    answer:
      "現貨商品一般於訂單確認後 1-3 個工作天內出貨（不含例假日），配送時間依物流狀況而定。全館單筆滿 NT$ 2,000 即享免運費優惠。",
  },
  {
    question: "請問有提供退換貨服務嗎？",
    answer:
      "有的，我們提供完善的售後服務。若收到商品發現包裝破損或內容有異，請於 7 日內聯繫 UFLOW 客服。若因個人因素申請退換貨，商品必須保持全新未拆封狀態。",
  },
];

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
  icons: { icon: "/images/logo/uflow.ico" },
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
  alternates: { canonical: SITE_URL },
};

export const revalidate = 60;

export default function Page() {
  // ===================== 👑 首頁終極 @graph 結構化資料 =====================
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "UFLOW",
        alternateName: "UFLOW 保健食品",
        description:
          "功能性保健食品與營養補給｜專為亞洲體質研發・安心第三方檢驗",
        inLanguage: "zh-TW",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "UFLOW",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/images/logo/uflow.png`,
        },
        image: `${SITE_URL}/images/logo/uflow.png`,
        description:
          "UFLOW 專注於功能性保健食品與日常營養補給。嚴選原料、無多餘添加，並通過第三方檢驗，讓你補得安心、每日有感。",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          areaServed: "TW",
          availableLanguage: ["Traditional Chinese", "English"],
        },
        sameAs: [
          "https://www.facebook.com/uflow",
          "https://www.instagram.com/uflow",
          "https://line.me/R/ti/p/@uflow",
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: "UFLOW｜功能性保健食品與營養補給",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        description:
          "UFLOW 專注於功能性保健食品與日常營養補給：益生菌、魚油、葉黃素、維生素 D3/K2、關節與睡眠配方等。嚴選原料、無多餘添加，並通過第三方檢驗，讓你補得安心、每日有感。",
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: homeFAQs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <div style={{ display: "none" }} aria-hidden="true">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        />
      </div>
      <Client faqs={homeFAQs} />
    </>
  );
}
