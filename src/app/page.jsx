// app/page.jsx
import Client from "./home";
import { fetchAllProducts } from "@/lib/woo"; // 🚀 引入抓取商品的 API
import {
  getSiteUrl,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildWebPageSchema,
  buildFaqSchema,
  buildBreadcrumbSchema,
  buildPlaceSchema,
} from "@/lib/seo/business";
import { getPostImageUrl } from "@/lib/blogImages";

const SITE_URL = getSiteUrl();

// 🌟 首頁動態 FAQ 資料
const homeFAQs = [
  {
    question: "UFLOW 的保健食品與市售產品有何不同？",
    answer:
      "我們堅持「科學調配、足量攝取」與成分全透明。嚴選如微脂體穀胱甘肽、韓國 GABAEX、義大利速可包覆鎂、專利益萃質等國際大廠專利原料，拒絕無效添加，針對亞洲體質打造有感的健康輔助方案。",
  },
  {
    question: "產品是哪裡製造的？食用安全嗎？",
    answer:
      "我們的產品皆在台灣符合 ISO22000 與 HACCP 規範的專業廠房製造，全系列產品皆通過第三方公正檢驗，不含西藥與重金屬，確保您每日食用安全無虞。",
  },
  {
    question: "訂購後大約幾天可以收到商品？有退換貨服務嗎？",
    answer:
      "現貨商品一般於訂單確認後 1-3 個工作天內出貨。全館單筆滿 NT$ 2,000 即享免運費。若收到商品包裝破損或內容有異，請於 7 日內聯繫 UFLOW 客服進行退換貨。惟因保健食品退貨後可能涉及衛生安全疑慮，除非商品本身有瑕疵，否則辦理退換貨時，請務必確保產品為全新且未拆封（封膜完整，且產品不得有任何明顯破損或污漬）。",
  },
];

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "UFLOW 慶安有福｜功能性保健食品｜肽晶芙蓉・GABA鎂鎂・維他菌合生元",
  description:
    "UFLOW 專注於功能性保健食品，堅持「國際原廠、專利足量」。主打微脂體肽晶芙蓉、日夜節奏管理 GABA鎂鎂香蜂草、專利維他菌合生元。拒絕無效添加，全系列通過第三方檢驗，為您打造科學營養補給。",
  keywords: [
    "保健食品",
    "慶安有福",
    "UFLOW",
    "肽晶芙蓉",
    "微脂體穀胱甘肽",
    "冰晶番茄",
    "GABA鎂鎂香蜂草",
    "專利GABA",
    "速可包覆鎂",
    "維他菌合生元",
    "專利益生菌",
    "益萃質",
    "第三方檢驗",
    "桃園保健食品",
    "桃園市桃園區",
    "統一編號 60781383",
  ],
  icons: { icon: "/images/logo/uflow.ico" },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "/",
    siteName: "UFLOW 慶安有福",
    title: "UFLOW 慶安有福｜功能性保健食品｜專為亞洲體質研發",
    description:
      "堅持國際原廠、專利足量！從養顏美容(肽晶芙蓉)、日夜放鬆(GABA鎂鎂香蜂草)到消化道健康(維他菌合生元)，UFLOW 讓日常補給更科學、更有效率。",
    images: [
      {
        url: "/images/肽晶芙蓉/重返17歲の元氣-850.png",
        width: 1200,
        height: 630,
        alt: "UFLOW 功能性保健食品品牌形象",
      },
    ],
  },
  alternates: { canonical: "/" },
};

export const revalidate = 60;

function getCleanPostImage(post) {
  return getPostImageUrl(post, "/images/logo/uflow.png");
}

async function getHomePosts() {
  const rawBase =
    process.env.WORDPRESS_API_URL ||
    "https://inf.fjg.mybluehost.me/website_4ad5d5f2";
  const cleanBase = rawBase.split("/wp-json")[0].replace(/\/$/, "");
  const fetchUrl = `${cleanBase}/wp-json/wp/v2/posts?_embed&per_page=9`;

  try {
    const res = await fetch(fetchUrl, {
      next: { revalidate: 60 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });

    if (!res.ok) return [];

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) return [];

    const posts = await res.json();
    if (!Array.isArray(posts)) return [];

    return posts.map((post) => {
      let slug = post.slug || "";
      try {
        slug = decodeURIComponent(slug);
      } catch {
        /* keep encoded slug */
      }

      return {
        id: post.id,
        slug,
        title: (post.title?.rendered || "").replace(/<[^>]+>/g, ""),
        date: post.date,
        imageUrl: getCleanPostImage(post),
      };
    });
  } catch (error) {
    console.error("❌ 首頁 Blog API 抓取失敗:", error);
    return [];
  }
}

// 🚀 改為 async 函式，支援伺服器端抓取資料
export default async function Page() {
  // ===================== GEO / Google 商家結構化資料 =====================
  const schemaOrganization = buildOrganizationSchema(SITE_URL);
  const schemaWebSite = buildWebSiteSchema(SITE_URL);
  const schemaPlace = buildPlaceSchema(SITE_URL);

  const schemaWebPage = {
    ...buildWebPageSchema({
      siteUrl: SITE_URL,
      type: "WebPage",
      idPath: "/#webpage",
      url: SITE_URL,
      name: "UFLOW｜科學足量保健食品｜肽晶芙蓉・GABA鎂鎂・維他菌合生元",
      description:
        "UFLOW 專注於功能性保健食品。主打微脂體肽晶芙蓉、日夜節奏管理 GABA鎂鎂香蜂草、專利維他菌合生元。拒絕無效添加，讓你補得安心、每日有感。",
    }),
    breadcrumb: { "@id": `${SITE_URL}/#breadcrumb` },
    mainEntity: { "@id": `${SITE_URL}/#organization` },
  };

  const schemaBreadcrumb = buildBreadcrumbSchema(
    [{ name: "首頁", url: SITE_URL }],
    SITE_URL,
    "/#breadcrumb",
  );

  const schemaFAQ = buildFaqSchema(homeFAQs, SITE_URL, "/#faq");

  const schemaItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/#collection`,
    name: "UFLOW 主打科學專利保健食品",
    description:
      "為您推薦 UFLOW 最受歡迎的養顏美容、日夜調理與消化道健康食品。",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        url: `${SITE_URL}/products/肽晶芙蓉`,
        name: "肽晶芙蓉",
      },
      {
        "@type": "ListItem",
        position: 2,
        url: `${SITE_URL}/products/gaba鎂鎂香蜂草`,
        name: "GABA 鎂鎂香蜂草",
      },
      {
        "@type": "ListItem",
        position: 3,
        url: `${SITE_URL}/products/synbiotics`,
        name: "維他菌合生元",
      },
    ],
  };

  // 🚀 核心：在伺服器端抓取 WooCommerce 商品資料
  let items = [];
  try {
    items = await fetchAllProducts();
    console.log("🌐 [首頁] 成功抓取 WooCommerce 商品數量:", items?.length);
  } catch (error) {
    console.error("❌ 首頁抓取產品失敗:", error);
  }

  // 🚀 首頁 Official Blog：抓取最新文章
  let posts = [];
  try {
    posts = await getHomePosts();
    console.log("🌐 [首頁] 成功抓取 Blog 文章數量:", posts?.length);
  } catch (error) {
    console.error("❌ 首頁抓取文章失敗:", error);
  }

  return (
    <>
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
        id="schema-website"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebSite) }}
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
      <script
        type="application/ld+json"
        id="schema-itemlist"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaItemList) }}
      />

      {/* 🚀 把 faqs、items、posts 一起傳遞給前端畫面 */}
      <Client faqs={homeFAQs} items={items} posts={posts} />
    </>
  );
}
