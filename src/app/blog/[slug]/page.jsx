// app/blog/[slug]/page.js
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getAllPostSlugs } from "@/lib/wordpress";
import { notFound } from "next/navigation";

// 1. 產生靜態路徑 (SSG 核心)
// Next.js build 時會呼叫這個函式，預先產生這些 HTML
export async function generateStaticParams() {
  const posts = await getAllPostSlugs();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 2. 動態 Metadata (SEO)
export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  
  return {
    title: `${post.title.rendered} - UFLOW`,
    description: post.excerpt.rendered.replace(/<[^>]+>/g, ''),
    openGraph: {
      images: [featuredMedia?.source_url || ''],
    },
  };
}

// 3. 頁面組件
export default async function BlogPostPage({ params }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  const imageUrl = featuredMedia?.source_url;
  const date = new Date(post.date).toLocaleDateString("zh-TW", { year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <article className="bg-[#fcfcfc] min-h-screen pb-20">
      {/* --- Hero Section (仿 transit.jp) --- */}
      <div className="relative w-full h-[60vh] md:h-[80vh]">
        {imageUrl ? (
            <Image
            src={imageUrl}
            alt={post.title.rendered}
            fill
            className="object-cover"
            priority
            />
        ) : (
            <div className="w-full h-full bg-gray-200" />
        )}
        {/* 遮罩，讓文字清楚一點 */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* 標題置於 Hero 底部或中間 */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20 bg-gradient-to-t from-black/80 to-transparent">
             <div className="max-w-4xl mx-auto">
                <div className="text-white text-sm md:text-base tracking-widest mb-4 font-light">
                   HEALTH & LIFESTYLE / {date}
                </div>
                <h1 
                    className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />
             </div>
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="max-w-3xl mx-auto px-5 py-16 md:py-24">
        {/* 文章內容：使用 Tailwind Typography 插件 (prose) 來美化 WP 輸出的 HTML */}
        <div 
          className="
            prose prose-lg md:prose-xl prose-slate mx-auto
            prose-headings:font-bold prose-headings:text-slate-800
            prose-p:text-slate-600 prose-p:leading-loose prose-p:tracking-wide
            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-10
            prose-a:text-[#f58a9c] hover:prose-a:text-[#dd6f81]
          "
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
        
        {/* --- Navigation / Footer --- */}
        <div className="mt-20 pt-10 border-t border-gray-200 flex justify-between items-center">
             <Link href="/project-list" className="group flex items-center gap-2 text-slate-500 hover:text-black transition-colors">
                <span className="transform group-hover:-translate-x-1 transition-transform">←</span> 
                BACK TO LIST
             </Link>
             
             {/* 這裡可以放分享按鈕 */}
             <div className="flex gap-4">
                 <button className="text-sm font-bold border border-gray-300 rounded-full px-4 py-1 hover:bg-black hover:text-white transition-all">
                    SHARE
                 </button>
             </div>
        </div>
      </div>
    </article>
  );
}