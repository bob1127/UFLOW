// app/page.js
import HomeClient from "./ProjectListClient"; // 確保路徑與你的檔名相符

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.uflow.space";

export const metadata = {
  title:
    "保健知識與健康生活方式 | UFLOW 慶安有福保健食品 ｜ 照顧您生活健康，多種保健產品",
  description: "探索保健知識與健康生活方式",
};

// 這是伺服器端抓取邏輯
async function getPosts() {
  const apiUrl =
    process.env.WORDPRESS_API_URL ||
    "https://inf.fjg.mybluehost.me/website_4ad5d5f2";

  if (!apiUrl) {
    console.error("❌ 錯誤：找不到環境變數 WORDPRESS_API_URL");
    return [];
  }

  try {
    const res = await fetch(`${apiUrl}/posts?_embed&per_page=10`, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error(`❌ Fetch 失敗，狀態碼: ${res.status}`);
      return [];
    }

    const posts = await res.json();
    return posts;
  } catch (error) {
    console.error("❌ 抓取過程發生嚴重錯誤:", error);
    return [];
  }
}

export default async function Page() {
  const posts = await getPosts();

  // ===================== 👑 動態產生 Blog 列表的結構化資料 =====================
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/blog/#webpage`,
        url: `${SITE_URL}/blog`,
        name: "UFLOW 保健知識與營養專欄",
        description:
          "專業營養師與健康專家撰寫的保健食品知識、日常營養補充指南。",
        inLanguage: "zh-TW",
      },
      {
        "@type": "Blog",
        "@id": `${SITE_URL}/blog/#blog`,
        name: "UFLOW 保健知識",
        // 動態將抓到的 WP 文章 Mapping 成 Google 規定的 BlogPosting 格式
        blogPost: posts.map((post) => {
          const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
          const imgUrl =
            featuredMedia?.media_details?.sizes?.large?.source_url ||
            featuredMedia?.source_url ||
            `${SITE_URL}/images/logo/uflow.png`;

          return {
            "@type": "BlogPosting",
            "@id": `${SITE_URL}/blog/${post.slug}/#article`,
            url: `${SITE_URL}/blog/${post.slug}`,
            headline: post.title.rendered,
            image: imgUrl,
            datePublished: new Date(post.date).toISOString(),
            dateModified: new Date(post.modified).toISOString(),
            author: {
              "@type": "Organization",
              name: "UFLOW 專業營養團隊",
              url: SITE_URL,
            },
            publisher: {
              "@type": "Organization",
              name: "UFLOW",
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/images/logo/uflow.png`,
              },
            },
            description: post.excerpt?.rendered
              .replace(/<[^>]+>/g, "")
              .substring(0, 150),
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${SITE_URL}/blog/${post.slug}`,
            },
            about: {
              "@type": "Thing",
              name: "保健食品與營養知識",
            },
          };
        }),
      },
    ],
  };

  return (
    <main>
      {/* 注入 SEO 結構化資料 (隱藏在背景給爬蟲看) */}
      <div style={{ display: "none" }} aria-hidden="true">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        />
      </div>

      <HomeClient posts={posts} />
    </main>
  );
}
