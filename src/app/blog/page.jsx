// app/blog/page.jsx
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

  console.log(`🌐 [除錯 - 網址確認] 準備請求 API: ${fetchUrl}`);

  try {
    const res = await fetch(fetchUrl, {
      // 💡 如果你要在 Vercel 立即看到除錯結果，建議先暫時改為 cache: "no-store"
      // 測試成功抓到資料後，再改回 next: { revalidate: 3600 }
      next: { revalidate: 3600 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    console.log(`📡 [除錯 - 回應狀態]: HTTP ${res.status} ${res.statusText}`);

    if (!res.ok) {
      // 🛑 完整除錯：印出被拒絕的真正原因 (例如印出 Bluehost 防火牆的 HTML)
      const errorText = await res.text();
      console.error(
        `❌ [除錯 - API 響應錯誤]: \n`,
        errorText.substring(0, 500),
      ); // 取前 500 字元避免 log 爆掉
      return [];
    }

    // 🛑 完整除錯：確認回傳的是不是真的 JSON，防止 200 OK 卻回傳 HTML 錯誤頁
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error(
        `❌ [除錯 - 資料格式錯誤] API 回傳的不是 JSON，而是: ${contentType}`,
      );
      const badText = await res.text();
      console.error(`❌ [除錯 - 內容預覽]: \n`, badText.substring(0, 500));
      return [];
    }

    const posts = await res.json();
    console.log(
      `✅ [除錯 - 抓取成功]: 共取得 ${Array.isArray(posts) ? posts.length : 0} 篇文章`,
    );
    return Array.isArray(posts) ? posts : [];
  } catch (error) {
    console.error(
      "❌ [除錯 - Fetch 執行失敗] 完全連不上 API，錯誤原因:",
      error.message || error,
    );
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
