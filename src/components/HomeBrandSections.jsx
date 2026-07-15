"use client";

import Image from "next/image";
import { Play } from "lucide-react";

/**
 * 首頁兩段新增區塊：
 * 1) Brand Story — Who We Are + 雙欄圖文
 * 2) Movie — 滿版情境圖 + 左對齊文案 + 播放 CTA
 */
export default function HomeBrandSections() {
  return (
    <>
      {/* ===== Brand Story ===== */}
      <section className="relative w-full overflow-hidden bg-white px-4 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        {/* 大型背景描邊字 */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 select-none whitespace-nowrap text-[clamp(3.5rem,14vw,9rem)] font-bold uppercase leading-none tracking-tight text-transparent opacity-40"
          style={{
            WebkitTextStroke: "1px rgba(0,0,0,0.12)",
          }}
        >
          Who We Are
        </div>

        <div className="relative mx-auto flex w-full max-w-[1200px] gap-6 lg:gap-10">
          {/* 左側垂直標籤 */}
          <div className="hidden shrink-0 pt-28 md:block">
            <p
              className="text-[11px] font-medium tracking-[0.25em] text-stone-500"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              Brand story
            </p>
          </div>

          <div className="min-w-0 flex-1">
            {/* 導語 */}
            <div className="mx-auto max-w-3xl pt-10 text-center md:pt-16 md:text-left">
              <p className="mb-2 text-[11px] font-medium tracking-[0.2em] text-stone-400 md:hidden">
                Brand story
              </p>
              <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight tracking-tight text-stone-900">
                關於 UFLOW
              </h2>
              <p className="mt-4 text-[clamp(1.05rem,2.2vw,1.35rem)] font-semibold leading-relaxed text-stone-800">
                「為日常找回健康節奏的保健食品品牌」
              </p>
              <p className="mt-5 text-[13px] leading-[1.9] tracking-wide text-stone-600 sm:text-[14px]">
                我們相信，健康應該簡單、自然且可持續。
                以科學方法應用於天然原料，科技養護身心，
                陪伴你在忙碌生活中，重新掌握身體的韻律。
              </p>
            </div>

            {/* 雙欄圖文 */}
            <div className="mt-14 grid grid-cols-1 gap-10 md:mt-16 md:grid-cols-2 md:gap-8 lg:mt-20 lg:gap-12">
              {[
                {
                  img: "/images/DSCF7777.jpg",
                  en: "Our Mission",
                  title: "品牌使命",
                  body: "以「植萃天然 × 科學創新」為核心，嚴選全球頂級原料與實證配方，讓每一次補給都有根據、能感受，也對身體友善。",
                },
                {
                  img: "/images/DSCF7850.jpg",
                  en: "Feature",
                  title: "UFLOW 的堅持",
                  body: "全成分公開透明、通過專業檢驗認證。從原料溯源到配方研發，我們用更嚴謹的標準，守護你日常的健康循環。",
                },
              ].map((item) => (
                <article key={item.en} className="flex flex-col">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-5 text-[13px] font-bold tracking-wide text-stone-900 sm:mt-6 sm:text-[14px]">
                    {item.en}
                  </p>
                  <h3 className="mt-1 text-[18px] font-bold tracking-wide text-stone-900 sm:text-[20px]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[13px] leading-[1.9] tracking-wide text-stone-600 sm:text-[14px]">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Movie ===== */}
      <section className="relative max-w-[90%] flex min-h-[70vh] w-full items-center overflow-hidden sm:min-h-[75vh] lg:min-h-[85vh]">
        {/* 滿版背景，不隨滾動放大 */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/images/ce209f41-6938-4303-965a-b0c38d07f758.png')",
          }}
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 py-20 sm:px-10 lg:px-16">
          <div className="max-w-xl text-white">
            <h2 className="mt-4 text-[clamp(1.6rem,4vw,2.75rem)] font-bold leading-[1.35] tracking-tight">
              找回身體原本的循環
              <br />
              從日常開始養護身心
            </h2>
            <p className="mt-5 text-[13px] leading-[1.9] text-white/85 sm:text-[14px]">
              透過品牌故事影片，認識 UFLOW
              如何以科學實證與天然植萃，陪伴你在緊湊節奏中，重新感受輕盈與平衡。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
