import HomeClient from "./ProjectListClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.uflow.space";

// 🏆 核心設定：開啟 ISR 模式，每小時自動在背景重新生成頁面
export const revalidate = 3600;

export const metadata = {
  title:
    "保健知識與健康生活方式 | UFLOW 慶安有福保健食品 ｜ 照顧您生活健康，多種保健產品",
  description:
    "探索由 UFLOW 專業營養團隊撰寫的保健知識，包含益生菌、穀胱甘肽、GABA 等專業營養補充指南。",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
};

async function getPosts() {
  const rawBase =
    process.env.WORDPRESS_API_URL ||
    "https://inf.fjg.mybluehost.me/website_4ad5d5f2";
  const cleanBase = rawBase.split("/wp-json")[0].replace(/\/$/, "");
  const fetchUrl = `${cleanBase}/wp-json/wp/v2/posts?_embed&per_page=10`;

  console.log(`🌐 [ISR 生成中] 正在抓取數據以建立靜態頁面: ${fetchUrl}`);

  try {
    const res = await fetch(fetchUrl, {
      // 這裡不寫 cache: "no-store"，改用 next.revalidate 讓它變成 ISR
      next: { revalidate: 3600 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error(`❌ WP API 響應錯誤: ${res.status}`);
      return [];
    }

    const posts = await res.json();
    return Array.isArray(posts) ? posts : [];
  } catch (error) {
    console.error("❌ ISR 抓取失敗，將回傳上次快取的內容:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  // ===================== 👑 SEO 結構化資料 (JSON-LD) =====================
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/blog/#webpage`,
        url: `${SITE_URL}/blog`,
        name: "UFLOW 保健知識與營養專欄",
        description: "由專業營養師撰寫的保健知識、日常營養補充指南。",
        publisher: {
          "@type": "Organization",
          name: "UFLOW 慶安有福",
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/images/logo/uflow.png`,
          },
        },
        inLanguage: "zh-TW",
      },
      {
        "@type": "Blog",
        "@id": `${SITE_URL}/blog/#blog`,
        name: "UFLOW 健康生活 Blog",
        blogPost: posts.map((post) => ({
          "@type": "BlogPosting",
          headline: post.title.rendered,
          image:
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            `${SITE_URL}/images/logo/uflow.png`,
          datePublished: new Date(post.date).toISOString(),
          url: `${SITE_URL}/blog/${post.slug}`,
        })),
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />
      <HomeClient posts={posts} />
    </main>
  );
}
