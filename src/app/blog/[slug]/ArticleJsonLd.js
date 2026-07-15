// components/ArticleJsonLd.js
import React from "react";
import { buildOrganizationSchema } from "@/lib/seo/business";

export default function ArticleJsonLd({ post, siteUrl, imageUrl }) {
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;

  // 清除 HTML 標籤，萃取乾淨的描述
  const cleanDescription =
    post.excerpt?.rendered.replace(/<[^>]+>/g, "").substring(0, 160) ||
    "UFLOW 專業保健知識與營養專欄";

  // 1. 麵包屑結構化資料 (BreadcrumbList)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首頁", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "保健專欄", item: `${siteUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.title.rendered, item: canonicalUrl },
    ],
  };

  // 2. 文章結構化資料 (BlogPosting)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    headline: post.title.rendered,
    description: cleanDescription,
    image: [imageUrl],
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.modified).toISOString(),
    author: {
      "@type": "Organization",
      name: "UFLOW 專業營養團隊",
      url: siteUrl,
    },
    publisher: { "@id": `${siteUrl}/#organization` },
    inLanguage: "zh-TW",
  };

  // 3. 商家資訊結構化資料：與全站共用同一份 Organization/LocalBusiness 定義
  // （真實地址、統編、電話），避免不同頁面出現互相矛盾的商家資料
  const localBusinessSchema = buildOrganizationSchema(siteUrl);

  // 4. 常見問題結構化資料 (FAQPage)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "UFLOW 的保健食品是哪裡生產的？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "我們所有的保健食品皆在台灣嚴格把關製造，並通過多項安全檢驗，確保消費者吃得安心。",
        },
      },
      {
        "@type": "Question",
        name: "吃 UFLOW 保健食品需要注意什麼？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "建議依照產品包裝上的每日建議用量食用。如有特殊疾病、孕婦或哺乳期間，請先諮詢專業醫師意見。",
        },
      },
      // 👈 你可以在這裡繼續新增更多與 UFLOW 相關的常見問題
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}