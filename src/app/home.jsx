// app/home.jsx
"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { Link } from "next-view-transitions";
import MainScrollCard from "../components/MainScrollCard";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ReactLenis } from "@studio-freight/react-lenis";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const BLOG_FILTERS = [
  { id: "all", label: "全部文章", match: null },
  { id: "peptide", label: "肽晶芙蓉", match: /芙蓉|肽晶/ },
  { id: "gaba", label: "GABA 鎂鎂", match: /GABA|助眠|入睡/i },
  { id: "synbiotics", label: "維他菌合生元", match: /維他菌|合生元/ },
  { id: "beauty", label: "美妍保養", match: /美妍|美容|肌|養顏|芙蓉/ },
  { id: "rhythm", label: "日夜節奏", match: /節奏|睡眠|放鬆|GABA/i },
  { id: "gut", label: "腸道健康", match: /腸|消化|菌|合生元/ },
  {
    id: "knowledge",
    label: "保健知識",
    match: /營養|補給|健康|知識|推薦|藥師|營養師/,
  },
];

function formatBlogDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

// 🌟 接收 Server (page.jsx) 傳來的 faqs、items、posts
export default function Home({ faqs = [], items = [], posts = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [activeBlogFilter, setActiveBlogFilter] = useState("all");

  const filteredPosts = useMemo(() => {
    const filter = BLOG_FILTERS.find((f) => f.id === activeBlogFilter);
    if (!filter?.match) return posts;
    const matched = posts.filter((post) => filter.match.test(post.title || ""));
    return matched.length > 0 ? matched : posts;
  }, [posts, activeBlogFilter]);

  const displayPosts = filteredPosts.slice(0, 3);

  useEffect(() => {
    const timer = setTimeout(() => setShowModal(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  const containerRef = useRef(null);

  useEffect(() => {
    const initGSAPAnimations = () => {
      const ctx = gsap.context(() => {
        const images = document.querySelectorAll(".animate-image-wrapper");

        images.forEach((image, i) => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: image,
              start: "top bottom",
              end: "top center",
              toggleActions: "play none none none",
              id: "imageReveal-" + i,
            },
          });

          tl.fromTo(
            image.querySelector(".overlay"),
            { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 0.7,
              ease: "power2.inOut",
            },
          )
            .to(image.querySelector(".overlay"), {
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
              duration: 0.7,
              ease: "power2.inOut",
            })
            .fromTo(
              image.querySelector(".image-container"),
              { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
              {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: 1.5,
                ease: "power3.inOut",
              },
              "-=0.5",
            )
            .fromTo(
              image.querySelector(".img-zoom"),
              {
                scale: 1.84,
                willChange: "transform",
                transformOrigin: "center center",
              },
              {
                scale: 1,
                duration: 2.5,
                ease: "expo.out",
              },
              "<",
            );
        });

        ScrollTrigger.refresh();
      }, containerRef);

      return ctx;
    };

    let ctx;
    const onTransitionComplete = () => {
      ctx = initGSAPAnimations();
    };

    window.addEventListener("pageTransitionComplete", onTransitionComplete);

    if (!sessionStorage.getItem("transitioning")) {
      ctx = initGSAPAnimations();
    } else {
      sessionStorage.removeItem("transitioning");
    }

    return () => {
      if (ctx) ctx.revert();
      window.removeEventListener(
        "pageTransitionComplete",
        onTransitionComplete,
      );
    };
  }, []);

  return (
    <ReactLenis root>
      <div className="w-screen bg-white" ref={containerRef}>
        {/* ✅ 右下角懸浮廣告影片區塊 */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0, y: 100, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 100, x: 20 }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.5 }}
              className="fixed bottom-4 right-4 z-[9999] w-60 sm:w-72 md:w-80 aspect-[9/16] overflow-hidden border-4 border-white shadow-2xl bg-black"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-2 z-20 group bg-black/50 hover:bg-black text-white/80 hover:text-white rounded-full p-1.5 transition-all duration-300"
                aria-label="Close video"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <video
                src="/video/UFLOW.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🚀 如果你的 MainScrollCard 裡面需要用到價格，就把 items 傳進去 */}
        <MainScrollCard items={items} />

        {/* Ranking — 參照圖片設計，原文案不變 */}
        <section className="section-two-column w-full bg-white pt-16 pb-4 sm:pt-20 sm:pb-6">
          <div className="mb-8 px-5 sm:mb-10 sm:px-8 lg:px-10">
            <h2 className="text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-none tracking-tight text-[#1a1a1a]">
              Features
            </h2>
            <p className="mt-2 text-[13px] tracking-wide text-[#555] sm:text-[14px]">
              我們產品特色
            </p>
          </div>

          <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">
            {[
              {
                href: "/blog/專業驗光師大推-我選擇uflow-肽晶芙蓉-營養補給複",
                image: "/images/DSCF7894.jpg",
                rank: "01",
                badges: ["國際原廠", "專利足量"],
                title: "肽晶芙蓉",
                subtitle: "國際原廠 專利足量",
                body: "適用族群： 對美極度要求族群、 醫美後保養族群、 髮質脆弱族群、 經常飲酒族群、 身體卡卡族群、 運動健身族群",
              },
              {
                href: "/blog/藥師不藏私推薦-溫和幫助入睡採大廠頂尖原料-uflow-gaba",
                image: "/images/DSCF7801.jpg",
                rank: "02",
                badges: ["國際原廠", "專利足量"],
                title: "GABA 鎂鎂香蜂草",
                subtitle: "國際原廠 專利足量",
                body: "適用族群： 高壓工作型態者、腦袋停不下來 作息與飲食不規律者 調時差、長途搭機者 飲酒頻率較高者 睡眠品質不穩定者 規律運動與健身族群",
              },
              {
                href: "/blog/男神營養師：忙碌上班族的日常營養補給策略-uflow維",
                image: "/images/DSCF7806.jpg",
                rank: "03",
                badges: ["國際原廠", "專利足量"],
                title: "GABA 鎂鎂香蜂草",
                subtitle: "國際原廠 專利足量",
                body: "適用族群： 高壓工作型態者、腦袋停不下來 作息與飲食不規律者 調時差、長途搭機者 飲酒頻率較高者 睡眠品質不穩定者 規律運動與健身族群",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative block aspect-[4/5] w-full overflow-hidden bg-[#eee] sm:aspect-square"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />

                <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-1 right-2 z-0 select-none text-[clamp(3.25rem,7.5vw,5.25rem)] font-bold leading-none tracking-tight text-white/25 sm:bottom-2 sm:right-3"
                >
                  No. {item.rank}
                </span>

                <div className="absolute inset-x-0 bottom-0 z-[1] p-4 sm:p-5 lg:p-6">
                  <div className="flex flex-wrap gap-1.5">
                    {item.badges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#1a1a1a] sm:text-[12px]"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 max-w-[92%] text-[13px] font-medium leading-snug tracking-wide text-white sm:text-[14px]">
                    {item.title}
                    <span className="mx-1.5 font-normal text-white/70">|</span>
                    {item.subtitle}
                  </p>
                  <p className="mt-1.5 max-w-[90%] text-[12px] font-normal leading-relaxed tracking-wide text-white/90 line-clamp-3 sm:text-[13px]">
                    {item.body}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        {/* Official Blog — 完全參照設計，抓取後台文章 */}
        <section className="section-main-products w-full bg-white pt-16 pb-16 sm:pt-20 sm:pb-24">
          <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
            {/* Header */}
            <header className="mb-8 sm:mb-10">
              <h2 className="text-[clamp(1.85rem,3.8vw,2.65rem)] font-bold leading-none tracking-tight text-[#1a1a1a]">
                保健知識專欄
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed tracking-wide text-[#555] sm:text-[15px]">
                UFLOW
              </p>
            </header>

            {/* Category tabs */}
            <div className="mb-10 flex flex-wrap gap-2 sm:mb-12 sm:gap-2.5">
              {BLOG_FILTERS.map((filter) => {
                const active = activeBlogFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveBlogFilter(filter.id)}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-[3px] border px-3.5 text-[13px] leading-none transition-colors sm:text-[14px] ${
                      active
                        ? "border-[#3a3a3a] bg-[#3a3a3a] text-white"
                        : "border-[#D6D3CD] bg-[#F5F5F0] text-[#2F2B28] hover:border-[#3a3a3a]/55"
                    }`}
                  >
                    <span>{filter.label}</span>
                    <ChevronDown
                      size={13}
                      strokeWidth={2.25}
                      className="shrink-0 opacity-70"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Article grid — 圖片無間距、欄位等寬對齊 */}
          <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
            {displayPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-0">
                {displayPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group m-1 flex min-w-0 flex-col"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#D9D7D2] sm:aspect-[1/1]">
                      <Image
                        src={post.imageUrl || "/images/logo/uflow.png"}
                        alt={post.title}
                        fill
                        sizes="(min-width: 640px) 33vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="flex flex-1 flex-col px-0 pt-4 sm:px-5 sm:pt-5">
                      <time
                        dateTime={post.date}
                        className="block text-[12px] leading-none tracking-wide text-[#777] sm:text-[13px]"
                      >
                        {formatBlogDate(post.date)}
                      </time>
                      <h3 className="mt-2.5 min-h-[3.2em] text-[15px] font-bold leading-[1.55] tracking-tight text-[#1a1a1a] transition-colors line-clamp-2 group-hover:text-[#e6657b] sm:text-[16px]">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-[#D6D3CD] bg-white/50 py-20 text-center">
                <p className="text-[15px] text-[#777]">目前暫無文章</p>
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 flex justify-end sm:mt-14">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-3 text-[13px] tracking-wide text-[#2F2B28] transition-colors hover:text-[#e6657b] sm:text-[14px]"
              >
                <span>保健知識文章一覽</span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#3a3a3a] text-white transition-transform duration-300 group-hover:translate-x-0.5">
                  <ChevronRight size={15} strokeWidth={2.5} />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* 🌟 Google FAQ 結構化資料對應的實際視覺畫面 */}
        {faqs && faqs.length > 0 && (
          <section className="w-full bg-white pt-20 pb-24">
            <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
              <div className="mb-12 md:mb-16">
                <p className="text-sm font-medium tracking-[0.12em] text-[#2F2B28]/60 uppercase">
                  FAQ
                </p>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-[#2F2B28]">
                  常見問題
                </h2>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#2F2B28]/70">
                  了解更多關於 UFLOW 的購物與產品資訊
                </p>
              </div>

              <div className="border-t border-[#E8E6E3]">
                {faqs.map((faq, idx) => (
                  <article
                    key={idx}
                    className="grid grid-cols-1 gap-4 border-b border-[#E8E6E3] py-10 md:grid-cols-[auto_minmax(0,0.95fr)_minmax(0,1.35fr)] md:gap-8 lg:gap-12 md:py-12"
                  >
                    <span className="pt-0.5 text-sm font-semibold tabular-nums text-[#2F2B28]">
                      {String(idx + 1).padStart(2, "0")}.
                    </span>

                    <div className="min-w-0">
                      <p className="text-[13px] font-medium tracking-[0.06em] text-[#2F2B28]/55">
                        Question
                      </p>
                      <h3 className="mt-1.5 text-xl font-bold leading-snug tracking-tight text-[#2F2B28] md:text-[1.35rem] lg:text-[1.5rem]">
                        {faq.question}
                      </h3>
                    </div>

                    <p className="min-w-0 text-[15px] leading-[1.85] text-[#2F2B28]/75 md:pt-0.5">
                      {faq.answer}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </ReactLenis>
  );
}
