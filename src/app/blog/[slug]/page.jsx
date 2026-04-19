// app/blog/[slug]/page.js
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getAllPostSlugs } from "@/lib/wordpress";
import { notFound } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.uflow.space";

// 1. 產生靜態路徑 (SSG)
export async function generateStaticParams() {
  const posts = await getAllPostSlugs();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 2. 動態 Metadata (頂級 SEO)
export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};

  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  const imageUrl =
    post.jetpack_featured_media_url ||
    featuredMedia?.source_url ||
    `${SITE_URL}/images/logo/uflow.png`;

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
    twitter: {
      card: "summary_large_image",
      title: post.title.rendered,
      description: cleanDescription,
      images: [imageUrl],
    },
  };
}

// 3. 頁面組件 (LIG Style UI)
export default async function BlogPostPage({ params }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // 🛡️ 防彈圖片萃取邏輯 (延續我們先前的強大解法)
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
  const imageUrl = rawUrl ? rawUrl.split("?")[0] : "/images/logo/uflow.png";

  // 日期格式化為 LIG 風格 (YYYY.MM.DD)
  const dateObj = new Date(post.date);
  const formattedDate = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, "0")}.${String(dateObj.getDate()).padStart(2, "0")}`;

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
            name: "保健知識",
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
        image: imageUrl,
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
          .substring(0, 160),
      },
    ],
  };

  return (
    <article className="bg-[#FAF9F7] mt-5 sm:mt-20 min-h-screen pt-24 pb-32 font-sans text-slate-800 selection:bg-[#f58a9c] selection:text-white">
      {/* 注入 SEO 結構化資料 */}
      <div style={{ display: "none" }} aria-hidden="true">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 lg:px-8">
        {/* 麵包屑 Breadcrumbs */}
        <nav className="text-[13px] text-gray-500 mb-10 flex gap-2 items-center">
          <Link href="/" className="hover:text-[#f58a9c] transition-colors">
            Home
          </Link>
          <span>›</span>
          <Link href="/blog" className="hover:text-[#f58a9c] transition-colors">
            保健知識
          </Link>
          <span>›</span>
          <span
            className="text-gray-400 truncate max-w-[200px] md:max-w-md"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </nav>

        <div className="flex flex-col lg:flex-row relative">
          {/* 左側黏性分享列 (Sticky Sidebar - LIG Style) */}
          <aside className="hidden lg:flex flex-col w-[80px] shrink-0 relative">
            <div className="sticky top-32 flex flex-col items-center gap-6">
              <span
                className="writing-vertical text-xs font-bold tracking-widest text-gray-400 mb-2"
                style={{ writingMode: "vertical-rl" }}
              >
                Share
              </span>
              {/* FB Icon */}
              <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white transition-colors duration-300">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              {/* X (Twitter) Icon */}
              <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white transition-colors duration-300">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              {/* LINE Icon */}
              <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#00B900] hover:text-white transition-colors duration-300">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.901 8.868 9.351 9.585.367.078.871.24 1 .557.117.291.076.749.035 1.056l-.168 1.014c-.053.315-.24 1.157 1.013.628 1.254-.528 6.772-3.993 9.426-6.953C22.951 14.153 24 12.339 24 10.304zm-14.735 2.158H6.551v-4.52h2.714v.938H7.554v.846h1.711v.938H7.554v.86h1.711v.938zm3.253 0h-.995v-4.52h.995v4.52zm3.334 0h-1.07l-1.571-2.222v2.222h-.994v-4.52h1.07l1.571 2.222v-2.222h.994v4.52zm3.435-3.582h-1.711v.846h1.711v.938h-1.711v.86h1.711v.938h-2.706v-4.52h2.706v.938z" />
                </svg>
              </button>
            </div>
          </aside>

          {/* 右側主要內容區 Main Content */}
          <div className="flex-1 max-w-[850px]">
            {/* 標題區 */}
            <h1
              className="text-[28px] md:text-[38px] lg:text-[42px] font-bold leading-[1.4] mb-8 text-[#222]"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* 作者、日期與標籤列 */}
            <div className="flex flex-wrap items-center gap-4 mb-10 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {/* 作者大頭貼 (可替換真實頭像) */}
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                  <Image
                    src="/images/logo/uflow.png"
                    alt="UFLOW"
                    fill
                    className="object-cover p-1"
                  />
                </div>
                <div className="flex items-center gap-3 text-[14px] text-gray-500 font-medium">
                  <span className="text-gray-800">UFLOW 編輯團隊</span>
                  <span>{formattedDate}</span>
                </div>
              </div>

              {/* 分類標籤 (假如有分類的話可以動態 map) */}
              <div className="flex gap-2 ml-auto">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-bold rounded">
                  保健知識
                </span>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-bold rounded">
                  健康專欄
                </span>
              </div>
            </div>

            {/* 文章內文 Content */}
            <div
              className="
                prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-[#222] prose-headings:mb-6 prose-headings:mt-12
                prose-h2:text-[24px] md:prose-h2:text-[28px] prose-h2:border-l-4 prose-h2:border-[#f58a9c] prose-h2:pl-4
                prose-h3:text-[20px] md:prose-h3:text-[22px]
                prose-p:text-[#444] prose-p:leading-[1.9] prose-p:tracking-[0.03em] prose-p:mb-8
                prose-a:text-[#f58a9c] hover:prose-a:text-[#dd6f81] prose-a:underline-offset-4
                prose-img:rounded-lg prose-img:shadow-md prose-img:my-10
                prose-li:text-[#444] prose-li:leading-[1.8]
                prose-strong:text-[#222] prose-strong:bg-yellow-100/50
              "
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />

            {/* 手機版底部分享列 (隱藏於桌機) */}
            <div className="lg:hidden mt-16 pt-8 border-t border-gray-200 flex flex-col items-center gap-4">
              <span className="text-sm font-bold tracking-widest text-gray-400">
                SHARE
              </span>
              <div className="flex gap-4">
                <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.901 8.868 9.351 9.585.367.078.871.24 1 .557.117.291.076.749.035 1.056l-.168 1.014c-.053.315-.24 1.157 1.013.628 1.254-.528 6.772-3.993 9.426-6.953C22.951 14.153 24 12.339 24 10.304zm-14.735 2.158H6.551v-4.52h2.714v.938H7.554v.846h1.711v.938H7.554v.86h1.711v.938zm3.253 0h-.995v-4.52h.995v4.52zm3.334 0h-1.07l-1.571-2.222v2.222h-.994v-4.52h1.07l1.571 2.222v-2.222h.994v4.52zm3.435-3.582h-1.711v.846h1.711v.938h-1.711v.86h1.711v.938h-2.706v-4.52h2.706v.938z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
