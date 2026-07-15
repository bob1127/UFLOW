"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { Link } from "next-view-transitions";
import ExampleContent03 from "./ExampleContent03";

const TextParallaxContentExample = () => {
  return (
    <>
      <div className="relative isolate bg-white">
        {/* 第一段：GABA 產品 + 文案 — 手機版隱藏 */}
        <section className="relative mt-20 hidden w-full flex-col items-center justify-center overflow-hidden bg-[url('/images/三種02.png')] bg-cover bg-[center_center] bg-no-repeat md:bg-[center_top] lg:flex lg:bg-center">
          <div className="absolute inset-0 z-0 bg-black/60 lg:hidden" />

          <div className="txt relative z-10 flex w-full flex-col items-center justify-center px-6 py-16 lg:absolute lg:right-[5%] lg:top-1/2 lg:max-w-[550px] lg:-translate-y-1/2 lg:items-start lg:p-0">
            <h2 className="text-center text-3xl font-bold text-stone-50 drop-shadow-lg sm:text-4xl lg:text-left lg:text-5xl">
              GABA 鎂鎂香蜂草
            </h2>
            <div className="mt-5 text-center lg:text-left">
              <h3 className="my-2 text-lg font-normal text-stone-50 drop-shadow-md sm:text-xl lg:text-2xl">
                舒壓好眠．能量循環的科學新方
              </h3>
              <h3 className="my-2 text-lg font-normal text-stone-50 drop-shadow-md sm:text-xl lg:text-2xl">
                專利GABA x 速可包覆鎂 x 法國香蜂草
              </h3>
            </div>
            <p className="!text-left mt-4 text-sm leading-relaxed tracking-wider text-stone-50 drop-shadow-sm sm:text-base lg:text-left">
              針對生活步調緊湊、壓力大與睡眠品質不佳的現代人設計 。嚴選韓國專利
              GABAEX® (500mg) 作為情緒煞車，搭配義大利 SideMag® 速可包覆鎂
              (200mg)，利用 Sucrosomial® 專利技術提升吸收率達 300%
              。加上法國香蜂草萃取，以黃金三角配方，幫助您日間提振精神、夜間放鬆入眠。
            </p>

            <div className="flex w-full flex-wrap justify-center gap-x-8 gap-y-6 py-8 lg:justify-start">
              {[
                "https://coralclub.ru/rcp/templates/promarine-collagen-tripeptides/assets/best-product-first-ByYP-jMQ.svg",
                "https://coralclub.ru/rcp/templates/promarine-collagen-tripeptides/assets/best-product-second-DFPnTpt2.svg",
                "https://coralclub.ru/rcp/templates/promarine-collagen-tripeptides/assets/best-product-third-BBToOs3r.svg",
              ].map((src) => (
                <div key={src} className="flex flex-col items-center">
                  <Image
                    src={src}
                    alt="純天然成分"
                    width={80}
                    height={80}
                    className="h-[60px] w-[60px] lg:h-[70px] lg:w-[70px]"
                    placeholder="empty"
                    loading="lazy"
                  />
                  <b className="mt-3 text-sm text-stone-50 drop-shadow-md lg:text-base">
                    純天然成分
                  </b>
                </div>
              ))}
            </div>

            <div className="h-[2px] w-full rounded-full bg-[#ebebeb]/50" />

            <div className="mt-3 flex w-full flex-col justify-between gap-2 text-center sm:flex-row lg:text-left">
              <span className="whitespace-normal text-[13px] tracking-widest text-stone-50 drop-shadow-sm">
                經過國家級的驗證，專業醫生的背書
              </span>
              <span className="hidden whitespace-normal text-[13px] tracking-widest text-stone-50 drop-shadow-sm sm:block">
                經過國家級的驗證，專業醫生的背書
              </span>
            </div>
          </div>
        </section>

        {/* 肽晶芙蓉 sticky parallax + 四卡內容（手機保留主視覺與文案） */}
        <TextParallaxContent>
          <div className="min-h-[120vh] space-y-32 px-8 pb-24 pt-[6vh] lg:min-h-[180vh] lg:pb-32 lg:pt-[8vh]">
            <h1 className="text-4xl text-white" />
            {/* 漂浮特色卡：手機版隱藏，避免與主視覺搶視線 */}
            <div className="hidden lg:block">
              <ExampleContent03 />
            </div>
          </div>
        </TextParallaxContent>
      </div>
    </>
  );
};

/* ===== TextParallaxContent wrapper ===== */
const TextParallaxContent = ({ children }) => {
  const containerRef = useRef(null);
  return (
    <div ref={containerRef} className="relative isolate">
      <div className="sticky top-0 z-0 h-screen overflow-hidden will-change-transform">
        <StickyBackground />
        <OverlayCopy containerRef={containerRef} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const StickyBackground = () => {
  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://hfa-mqt-qoqix3fm.landinghub.site/.landinghub/https%3A%2F%2Fd2w53g1q050m78.cloudfront.net%2Fkoredakecojp%2Fuploads%2Fimages%2Fpages%2Findex%2Findex-message01_pc.jpg')",
        }}
      />
      {/* 透明黑遮罩 — 提升白字可讀性 */}
      <div className="absolute inset-0 bg-black/45" />
    </>
  );
};

/** 圖一二風格：置中襯線大標 + 英文字距 + 藥丸 CTA */
const OverlayCopy = ({ containerRef }) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const rawOpacity = useTransform(
    scrollYProgress,
    [0.12, 0.4, 0.75],
    [0, 1, 0],
  );

  const y = useSpring(rawY, { damping: 30, stiffness: 120 });
  const opacity = useSpring(rawOpacity, { damping: 30, stiffness: 120 });

  return (
    <motion.div
      style={{
        y,
        opacity,
        transform: "translateZ(0)",
        willChange: "transform",
      }}
      className="absolute left-0 top-0 z-[2] flex h-screen w-full flex-col items-center justify-center px-6 text-white"
    >
      {/* 裝飾點 */}
      <div className="mb-5 flex items-center gap-2 md:mb-7">
        <span className="h-1 w-1 rotate-45 bg-white/90" />
        <span className="h-1.5 w-1.5 rotate-45 bg-white" />
        <span className="h-1 w-1 rotate-45 bg-white/90" />
      </div>

      {/* 主標 — 圖二襯線標題 */}
      <h2 className="font-serif text-center text-[clamp(1.75rem,4.5vw,3.25rem)] font-medium leading-[1.55] tracking-wide text-white">
        晶透煥亮，
        <br />
        喚回芙蓉貴婦肌。
      </h2>

      {/* 類別標籤 — 英文無襯線＋寬字距 */}
      <p className="mt-6 text-center font-sans text-[10px] font-medium uppercase tracking-[0.35em] text-white/90 sm:mt-8 sm:text-[11px]">
        Peptide Crystal Hibiscus
      </p>

      {/* 說明文 — 寬字距、小字 */}
      <p className="mt-4 max-w-md text-center text-[10px] leading-[2] tracking-[0.18em] text-white/80 sm:mt-5 sm:text-[11px] sm:tracking-[0.22em]">
        微脂體穀胱甘肽 × 日本冰晶番茄
        <br />
        美適矽正矽酸 × 複方維生素 C
        <br />
        由內而外，綻放極致透亮光采
      </p>

      {/* 藥丸 CTA */}
      <Link
        href="/products/肽晶芙蓉"
        className="pointer-events-auto mt-8 inline-flex items-center gap-2 rounded-full border border-white/85 px-7 py-3 text-[12px] tracking-wide text-white transition-colors hover:bg-white hover:text-[#2a2422] sm:mt-10 sm:px-8 sm:text-[13px]"
      >
        查看商品詳情
        <span aria-hidden>›</span>
      </Link>
    </motion.div>
  );
};

export default TextParallaxContentExample;
