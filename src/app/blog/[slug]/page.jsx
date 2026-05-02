// app/blog/[slug]/page.js
import Image from "next/image";
import Link from "next/link";
import { getAllPostSlugs } from "@/lib/wordpress";
import { notFound } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.uflow.space";

// ===================== 🌟 共用圖片萃取工具 =====================
function getPostImage(post) {
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  let rawUrl =
    post.jetpack_featured_media_url ||
    featuredMedia?.media_details?.sizes?.large?.source_url ||
    featuredMedia?.media_details?.sizes?.full?.source_url ||
    featuredMedia?.source_url;

  if (!rawUrl && post.content?.rendered) {
    const imgMatch = post.content.rendered.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch && imgMatch[1]) rawUrl = imgMatch[1];
  }
  return rawUrl ? rawUrl.split("?")[0] : "/images/logo/uflow.png";
}

// ===================== 🌟 API 抓取函式 (單篇文章) =====================
async function getPostBySlugWithDebug(slug) {
  const rawBase =
    process.env.WORDPRESS_API_URL ||
    "https://inf.fjg.mybluehost.me/website_4ad5d5f2";
  const cleanBase = rawBase.split("/wp-json")[0].replace(/\/$/, "");
  const fetchUrl = `${cleanBase}/wp-json/wp/v2/posts?slug=${slug}&_embed`;

  try {
    const res = await fetch(fetchUrl, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    const posts = await res.json();
    return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
  } catch (error) {
    return null;
  }
}

// ===================== 🌟 API 抓取函式 (最新文章 NEWS) =====================
async function getRecentPosts(currentSlug) {
  const rawBase =
    process.env.WORDPRESS_API_URL ||
    "https://inf.fjg.mybluehost.me/website_4ad5d5f2";
  const cleanBase = rawBase.split("/wp-json")[0].replace(/\/$/, "");
  // 多抓幾筆，以防其中一筆是當前文章
  const fetchUrl = `${cleanBase}/wp-json/wp/v2/posts?_embed&per_page=4`;

  try {
    const res = await fetch(fetchUrl, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];
    const posts = await res.json();
    if (!Array.isArray(posts)) return [];
    // 過濾掉當前正在閱讀的文章，並只取前 3 篇
    return posts.filter((p) => p.slug !== currentSlug).slice(0, 3);
  } catch (error) {
    return [];
  }
}

// 1. 產生靜態路徑 (SSG)
export async function generateStaticParams() {
  try {
    const posts = await getAllPostSlugs();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    return [];
  }
}

// 2. 動態 Metadata (頂級 SEO)
export async function generateMetadata({ params }) {
  const post = await getPostBySlugWithDebug(params.slug);
  if (!post) return {};

  const imageUrl = getPostImage(post);
  const cleanDescription =
    post.excerpt?.rendered.replace(/<[^>]+>/g, "").substring(0, 160) ||
    "UFLOW 保健知識專欄";

  return {
    title: `${post.title.rendered} | UFLOW 健康生活`,
    description: cleanDescription,
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title.rendered,
      description: cleanDescription,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: new Date(post.date).toISOString(),
      modifiedTime: new Date(post.modified).toISOString(),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title.rendered,
        },
      ],
    },
  };
}

// 3. 頁面組件 (日系極簡 UI)
export default async function BlogPostPage({ params }) {
  const post = await getPostBySlugWithDebug(params.slug);

  if (!post) {
    notFound();
  }

  // 同時抓取最新的推薦文章
  const recentPosts = await getRecentPosts(params.slug);

  // 取得主圖
  const mainImageUrl = getPostImage(post);

  // 日期格式化為圖示風格 (YYYY/MM/DD)
  const dateObj = new Date(post.date);
  const formattedDate = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${String(dateObj.getDate()).padStart(2, "0")}`;

  // ===================== 👑 官方標準結構化資料 JSON-LD =====================
  const articleSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/blog/${post.slug}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "BLOG",
            item: `${SITE_URL}/blog`,
          },
          { "@type": "ListItem", position: 3, name: post.title.rendered },
        ],
      },
      {
        "@type": "Article",
        "@id": `${SITE_URL}/blog/${post.slug}/#article`,
        isPartOf: { "@id": `${SITE_URL}/blog/${post.slug}/#breadcrumb` },
        headline: post.title.rendered,
        image: mainImageUrl,
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
      },
    ],
  };

  return (
    <article className="bg-[#fafafa] mt-[60px] min-h-screen pt-16 pb-32 font-sans text-gray-900 selection:bg-gray-200 selection:text-black">
      {/* 注入 SEO 結構化資料 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* ================= 文章主要內容區塊 ================= */}
      <div className="max-w-[800px] mx-auto px-5 lg:px-8">
        {/* 標題與日期區 */}
        <header className="mb-10 mt-10">
          <h1
            className="text-[24px] md:text-[30px] font-bold leading-snug mb-4 text-[#111]"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <div className="flex items-center gap-4 text-[11px] md:text-[12px] tracking-widest text-[#111]">
            <span>{formattedDate}</span>
            <span>NEWS</span>
          </div>
        </header>

        {/* 文章內文 Content (已縮小字體與調整行距) */}
        <div
          className="
            prose prose-base max-w-none
            prose-headings:font-bold prose-headings:text-[#111] prose-headings:mb-6 prose-headings:mt-12
            prose-h2:text-[20px] md:prose-h2:text-[22px] prose-h2:border-none prose-h2:pl-0
            prose-h3:text-[16px] md:prose-h3:text-[18px]
            prose-p:text-[#333] prose-p:text-[14px] md:prose-p:text-[15px] prose-p:leading-[2.2] prose-p:tracking-[0.05em] prose-p:mb-8
            prose-a:text-[#111] prose-a:underline hover:prose-a:text-gray-500 prose-a:underline-offset-4
            prose-img:w-full prose-img:my-10 prose-img:rounded-none prose-img:shadow-none
            prose-li:text-[#333] prose-li:text-[14px] md:prose-li:text-[15px] prose-li:leading-[2.2]
            prose-strong:text-[#111] prose-strong:font-bold
          "
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
      </div>

      {/* ================= 底部 NEWS 相關文章區塊 ================= */}
      {recentPosts && recentPosts.length > 0 && (
        <div className="max-w-[1000px] mx-auto px-5 lg:px-8 mt-24 pt-16 border-t border-gray-200">
          <h2 className="text-[18px] md:text-[20px] font-bold text-[#111] mb-10 tracking-wider uppercase">
            NEWS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
            {recentPosts.map((recentPost) => {
              const rImageUrl = getPostImage(recentPost);
              const rDateObj = new Date(recentPost.date);
              const rFormattedDate = `${rDateObj.getFullYear()}/${String(rDateObj.getMonth() + 1).padStart(2, "0")}/${String(rDateObj.getDate()).padStart(2, "0")}`;

              return (
                <Link
                  key={recentPost.id}
                  href={`/blog/${recentPost.slug}`}
                  className="block group"
                >
                  {/* 縮圖 */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-square mb-4 overflow-hidden bg-gray-100">
                    <Image
                      src={rImageUrl}
                      alt={recentPost.title.rendered.replace(/<[^>]+>/g, "")}
                      fill
                      className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  {/* 日期與標籤 */}
                  <div className="text-[10px] md:text-[11px] leading-tight text-[#111] font-medium tracking-wider mb-2">
                    <div>{rFormattedDate}</div>
                    <div className="mt-[2px]">NEWS</div>
                  </div>

                  {/* 標題 */}
                  <h3
                    className="text-[13px] md:text-[14px] text-[#111] leading-snug line-clamp-3 group-hover:text-gray-500 transition-colors"
                    dangerouslySetInnerHTML={{
                      __html: recentPost.title.rendered,
                    }}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 底部返回按鈕 */}
      <div className="mt-16 flex justify-center">
        <Link
          href="/blog"
          className="text-[12px] md:text-[13px] tracking-widest text-[#111] hover:text-gray-500 transition-colors uppercase border-b border-[#111] hover:border-gray-500 pb-1"
        >
          ← Back to Blog
        </Link>
      </div>
    </article>
  );
}
