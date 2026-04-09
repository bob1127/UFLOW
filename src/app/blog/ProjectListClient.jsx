"use client";

import { useState, useEffect } from "react";
import { Link } from "next-view-transitions";
import Image from "next/image";
// 引入你原本的組件
import ImageTextSlider from "../../components/ImageTextSlider.jsx";
import HeroSlider from "../../components/HeroSlideContact/page";
import { ReactLenis } from "@studio-freight/react-lenis";

export default function HomeClient({ posts }) {
  const [showNav, setShowNav] = useState(true);

  useEffect(() => {
    let lastScrollY = 0;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNav(currentScrollY < lastScrollY);
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <ReactLenis
      root
      options={{
        duration: 2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        touchMultiplier: 1.5,
        wheelMultiplier: 1.2,
      }}
    >
      <div className="">
        {/* Hero Slider */}
        <section className="pb-[100px]">
          <HeroSlider />
        </section>

        {/* Image Text Slider */}
        <section>
          <ImageTextSlider />
        </section>

        {/* BLOG SECTION */}
        <section className="section_where_go h-auto mt-[10px]">
          <div className="section-title py-[50px] flex flex-col justify-center items-center ">
            <h2 className="text-slate-900 text-[45px]">關於保健知識？</h2>
            <p>BLOG</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {posts && posts.length > 0 ? (
              posts.map((post) => {
                // 🚀 【終極防彈版圖片萃取 3.0】 🚀
                const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];

                // 步驟 1：先嘗試抓取正規的精選圖片
                let rawUrl =
                  post.jetpack_featured_media_url ||
                  featuredMedia?.media_details?.sizes?.large?.source_url ||
                  featuredMedia?.media_details?.sizes?.full?.source_url ||
                  featuredMedia?.source_url;

                // 步驟 2：【內容萃取術】如果沒有精選圖片，就去文章 HTML 內容裡面挖第一張圖！
                if (!rawUrl && post.content?.rendered) {
                  const imgMatch = post.content.rendered.match(
                    /<img[^>]+src="([^">]+)"/,
                  );
                  if (imgMatch && imgMatch[1]) {
                    rawUrl = imgMatch[1];
                  }
                }

                // 步驟 3：【淨化網址】移除 Jetpack 搞鬼的參數 (?fit=...&ssl=1)，保留乾淨原圖
                let imageUrl = "/images/logo/uflow.png"; // 預設底線
                if (rawUrl) {
                  imageUrl = rawUrl.split("?")[0]; // 把問號後面的東西全部切掉
                }

                console.log(
                  `✅ [${post.title.rendered}] 最終乾淨網址:`,
                  imageUrl,
                );

                // 處理日期與摘要...
                const date = new Date(post.date).toLocaleDateString("zh-TW");
                const rawExcerpt = post.excerpt?.rendered || "";
                const cleanExcerpt =
                  rawExcerpt.replace(/<[^>]+>/g, "").substring(0, 50) + "...";

                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="block h-full"
                  >
                    <div className="article-card bg-white group border-[.5px] border-gray-200 h-full flex flex-col">
                      <div className="card-img aspect-[4/3] overflow-hidden relative">
                        <Image
                          src={imageUrl}
                          alt={post.title.rendered.replace(/<[^>]+>/g, "")}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="card-conetent group px-5 py-3 flex flex-col flex-1">
                        <div className="title mb-4">
                          <b
                            className="text-lg mb-2 block line-clamp-2"
                            dangerouslySetInnerHTML={{
                              __html: post.title.rendered,
                            }}
                          />
                          <p className="max-w-[300px]">
                            <span
                              className="
                              inline bg-gradient-to-r from-black to-black bg-[length:0%_2px] bg-no-repeat bg-left-bottom group-hover:bg-[length:100%_2px] transition-[background-size] duration-500 text-[.9rem] tracking-wider text-gray-600
                            "
                            >
                              {cleanExcerpt}
                            </span>
                          </p>
                        </div>

                        <div className="mt-auto">
                          <div className="tag mt-2">
                            <b className="text-[.8rem] text-slate-800 group-hover:text-[#f58a9c] transition-colors">
                              READ MORE →
                            </b>
                          </div>
                          <div className="date mt-2 border-t pt-2 border-gray-100">
                            <span className="text-[.7rem] text-gray-500">
                              <span className="text-[.65rem] text-gray-500">
                                PUBLISH DATE
                              </span>{" "}
                              | {date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center py-20 bg-gray-50">
                <p className="text-gray-500 text-lg">目前暫無文章</p>
              </div>
            )}
          </div>

          <Link
            href="/blog"
            className="more-btn bg-[#f58a9c] hover:bg-[#dd6f81] duration-200 text-[20px] flex justify-center text-white py-6 cursor-pointer"
          >
            更多文章
          </Link>
        </section>
      </div>
    </ReactLenis>
  );
}
