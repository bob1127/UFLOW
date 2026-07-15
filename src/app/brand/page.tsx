// app/brand/page.tsx
import { Metadata } from "next";
import Client from "./client"; // 注意大小寫，確保與實際檔名一致
import {
  getSiteUrl,
  buildOrganizationSchema,
  buildWebPageSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildPlaceSchema,
  BUSINESS,
} from "@/lib/seo/business";

export const revalidate = 60;

const SITE_URL = getSiteUrl();

// 🌟 品牌專屬動態 FAQ 資料 (建立 E-E-A-T 信任度)
const brandFAQs = [
  {
    question: "UFLOW 的品牌核心理念是什麼？",
    answer:
      "我們堅持「植萃天然」與「科學創新」，嚴選全球頂級原料，並與領先科研機構合作，打造高效配比，為您找回身體原本的循環與平衡。",
  },
  {
    question: "UFLOW 的產品有通過安全檢驗嗎？",
    answer:
      "是的，我們深信透明與信任是品牌基礎。所有產品的全成分皆公開透明，並且皆通過台灣專業第三方機構檢驗合格，確保您食用安心無負擔。",
  },
  {
    question: "產品的研發團隊背景為何？",
    answer:
      "我們由生醫產業研究出發選擇與全球領先的科學研究機構合作，確保每一款產品都符合最嚴格的品質標準，有效促進身心健康。",
  },
  {
    question: "UFLOW 品牌公司地址與統一編號是什麼？",
    answer: `${BUSINESS.legalName}（UFLOW）營業所位於${BUSINESS.fullAddress}，統一編號 ${BUSINESS.taxID}。客服電話 ${BUSINESS.telephone}，信箱 ${BUSINESS.email}。`,
  },
];

// ===================== 強化 SEO Metadata =====================
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL), // 核心：設定 base URL
  title: "關於 UFLOW｜科學實證保健食品品牌｜研發理念、第三方檢驗與永續承諾",
  description:
    "UFLOW 專注於以科學為本的保健食品與日常營養補給。從原料溯源、配方研發到第三方檢驗與永續包裝，我們以更透明的方式，陪伴每一次有效的日常補給。營業所：桃園市桃園區永興里三民路三段28之1號3樓之1。",
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
    "慶安有福",
    "桃園保健食品",
    "統一編號 60781383",
  ],
  icons: {
    icon: "/images/logo/uflow.ico",
  },
  alternates: {
    canonical: "/brand", // 搭配 metadataBase 使用相對路徑
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "/brand",
    siteName: "UFLOW 功能性保健食品",
    title: "關於 UFLOW｜科學實證保健食品品牌｜研發理念、第三方檢驗與永續承諾",
    description:
      "我們相信每一份補給都應該有根據、能感受、且對地球友善。了解 UFLOW 的品牌故事、研發流程與品質保證。",
    images: [
      {
        url: "/images/og/about-og.jpg", // 搭配 metadataBase 使用相對路徑
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
    images: ["/images/og/about-og.jpg"],
  },
};

export default function BrandPage() {
  // ===================== GEO / Google 商家結構化資料 =====================
  const schemaOrganization = buildOrganizationSchema(SITE_URL);
  const schemaPlace = buildPlaceSchema(SITE_URL);

  const schemaWebPage = {
    ...buildWebPageSchema({
      siteUrl: SITE_URL,
      type: "AboutPage",
      idPath: "/brand/#webpage",
      url: `${SITE_URL}/brand`,
      name: "關於 UFLOW｜科學實證保健食品品牌",
      description:
        "了解 UFLOW 的品牌故事、研發理念、第三方檢驗與永續承諾。營業所位於桃園市桃園區。",
    }),
    breadcrumb: { "@id": `${SITE_URL}/brand/#breadcrumb` },
    mainEntity: { "@id": `${SITE_URL}/#organization` },
  };

  const schemaBreadcrumb = buildBreadcrumbSchema(
    [
      { name: "首頁", url: SITE_URL },
      { name: "品牌資訊", url: `${SITE_URL}/brand` },
    ],
    SITE_URL,
    "/brand/#breadcrumb",
  );

  const schemaFAQ = buildFaqSchema(brandFAQs, SITE_URL, "/brand/#faq");

  return (
    <>
      {/* 獨立拆分，逐一注入 JSON-LD 結構化資料，並移除包裹的 div */}
      <script
        type="application/ld+json"
        id="schema-organization"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }}
      />
      <script
        type="application/ld+json"
        id="schema-place"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaPlace) }}
      />
      <script
        type="application/ld+json"
        id="schema-webpage"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebPage) }}
      />
      <script
        type="application/ld+json"
        id="schema-breadcrumb"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        id="schema-faq"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }}
      />

      {/* 渲染包含動畫的 Client 端元件 */}
      <Client faqs={brandFAQs} />
    </>
  );
}
