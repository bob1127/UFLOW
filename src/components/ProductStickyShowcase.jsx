"use client";

import React from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";

/**
 * 仿 YURUMARU 官網「Product」區塊
 * - 置中標頭：Product / 縱書大標感 / 說明
 * - 每個 Point 為一個滿版面板：
 *   巨大描邊數字 + 中央大圓情境圖 + 右側縱書標題
 *   + 左側靠右說明與按鈕 + 四周漂浮小圓素材 + 圖下 ( POINT.0X ) 與英文
 * - 底部大 CTA
 */

const SERIF =
  '"Noto Serif TC", "Songti TC", "Hiragino Mincho ProN", Georgia, serif';

const DEFAULT_POINTS = [
  {
    number: "01",
    label: "Point.01",
    en: "Day and night, a golden formula that keeps you steady.",
    headingColumns: ["日間穩定精神，", "夜間放鬆好眠，", "黃金三角配方，", "守護你的每一天。"],
    description: (
      <>
        專利 GABAEX®、義大利速可包覆鎂
        <br />
        與法國香蜂草的黃金組合，
        <br />
        科學配比、足量攝取，
        <br />
        日夜都能安心補充。
      </>
    ),
    cta: { label: "了解配方詳情", href: "#" },
    centerImage: "/images/UFLOW GABA鎂鎂香蜂草/1.png",
    floats: [
      { src: "/images/DSCF7801.jpg", className: "left-[4%] top-[3%] h-[130px] w-[110px]" },
      { src: "/images/DSCF7845.jpg", className: "right-[2%] top-[32%] h-[120px] w-[120px]" },
      { src: "/images/DSCF7850.jpg", className: "right-[16%] bottom-[4%] h-[110px] w-[130px]" },
    ],
  },
  {
    number: "02",
    label: "Point.02",
    en: "Small capsule, big energy — fits into any daily routine.",
    headingColumns: ["輕巧好入口，", "隨身帶著走，", "忙碌生活也能", "隨時補充能量。"],
    description: (
      <>
        一日一顆，無需額外準備，
        <br />
        在家、辦公室或旅途中，
        <br />
        都能輕鬆維持
        <br />
        穩定的日夜節奏。
      </>
    ),
    centerImage: "/images/UFLOW GABA鎂鎂香蜂草/2.png",
    floats: [
      { src: "/images/DSCF7878.jpg", className: "left-[5%] top-[6%] h-[120px] w-[120px]" },
      { src: "/images/DSCF7833.jpg", className: "right-[4%] top-[28%] h-[130px] w-[110px]" },
    ],
  },
  {
    number: "03",
    label: "Point.03",
    en: "Clean formula, gentle on the body, made for everyday use.",
    headingColumns: ["溫和不刺激，", "天然萃取配方，", "長期補充也能", "安心無負擔。"],
    description: (
      <>
        嚴選國際專利原料，
        <br />
        不添加多餘人工成分，
        <br />
        科學驗證有效劑量，
        <br />
        給身體最單純的照顧。
      </>
    ),
    centerImage: "/images/UFLOW GABA鎂鎂香蜂草/3.png",
    floats: [
      { src: "/images/DSCF7806.jpg", className: "left-[6%] bottom-[8%] h-[120px] w-[130px]" },
      { src: "/images/DSCF7894.jpg", className: "right-[5%] top-[10%] h-[120px] w-[110px]" },
    ],
  },
];

function PointLabel({ label, en }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-3 text-[13px] font-medium uppercase tracking-[0.35em] text-[#6b6259]">
        <span className="text-[#c9c1b6]">(</span>
        <span>{label}</span>
        <span className="text-[#c9c1b6]">)</span>
      </div>
      <p
        className="mt-3 text-[11px] uppercase leading-[1.7] tracking-[0.2em] text-[#b3a99d]"
        style={{ fontFamily: SERIF }}
      >
        {en}
      </p>
    </div>
  );
}

function PointPanel({ point, index }) {
  return (
    <div className="relative w-full">
      {/* ===== Desktop / 桌機：絕對定位還原版型 ===== */}
      <div className="relative hidden min-h-screen w-full items-center justify-center lg:flex">
        <div className="relative mx-auto h-[86vh] w-full max-w-[1180px]">
          {/* 巨大描邊數字 */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[-2%] -translate-x-1/2 select-none text-[22vw] font-light leading-none text-[#efeae3]"
            style={{ fontFamily: SERIF }}
          >
            {point.number}
          </span>

          {/* 中央大圓情境圖 */}
          <div className="absolute left-1/2 top-1/2 h-[440px] w-[400px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[50%] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
            <Image
              src={point.centerImage}
              alt={point.label}
              fill
              sizes="400px"
              className="object-cover"
              priority={index === 0}
            />
          </div>

          {/* 右側縱書標題 */}
          <div className="absolute right-[10%] top-[12%] flex flex-row-reverse gap-4">
            {point.headingColumns.map((col, i) => (
              <p
                key={i}
                className="text-[17px] font-medium leading-[1.1] tracking-[0.15em] text-[#3a332c]"
                style={{ fontFamily: SERIF, writingMode: "vertical-rl" }}
              >
                {col}
              </p>
            ))}
          </div>

          {/* 左側靠右說明 + 按鈕 */}
          <div className="absolute left-[6%] top-[36%] flex w-[210px] flex-col items-end text-right">
            <p className="text-[12px] leading-[2] tracking-[0.05em] text-[#7a7168]">
              {point.description}
            </p>
            {point.cta && (
              <Link
                href={point.cta.href}
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#3a332c]/40 px-6 py-3 text-[12px] tracking-wide text-[#3a332c] transition-colors hover:bg-[#3a332c] hover:text-white"
              >
                {point.cta.label}
                <span aria-hidden>›</span>
              </Link>
            )}
          </div>

          {/* 四周漂浮小圓素材 */}
          {point.floats.map((f, i) => (
            <div
              key={i}
              className={`absolute overflow-hidden rounded-[46%] shadow-[0_12px_36px_rgba(0,0,0,0.14)] ${f.className}`}
            >
              <Image src={f.src} alt="" fill sizes="140px" className="object-cover" />
            </div>
          ))}

          {/* 圖下方 Point 標籤 + 英文 */}
          <div className="absolute left-1/2 top-[calc(50%+250px)] -translate-x-1/2">
            <PointLabel label={point.label} en={point.en} />
          </div>
        </div>
      </div>

      {/* ===== Mobile / 手機：直向堆疊簡化版 ===== */}
      <div className="relative flex flex-col items-center px-6 py-16 lg:hidden">
        <span
          aria-hidden
          className="pointer-events-none mb-[-30px] select-none text-[38vw] font-light leading-none text-[#efeae3]"
          style={{ fontFamily: SERIF }}
        >
          {point.number}
        </span>

        <div className="relative z-[1] h-[300px] w-[270px] overflow-hidden rounded-[50%] shadow-[0_16px_48px_rgba(0,0,0,0.14)]">
          <Image
            src={point.centerImage}
            alt={point.label}
            fill
            sizes="270px"
            className="object-cover"
          />
        </div>

        <div className="mt-7">
          <PointLabel label={point.label} en={point.en} />
        </div>

        <h3
          className="mt-6 text-center text-[19px] font-medium leading-[1.9] tracking-[0.1em] text-[#3a332c]"
          style={{ fontFamily: SERIF }}
        >
          {point.headingColumns.map((col, i) => (
            <React.Fragment key={i}>
              {col}
              <br />
            </React.Fragment>
          ))}
        </h3>

        <p className="mt-5 text-center text-[13px] leading-[2] tracking-[0.05em] text-[#7a7168]">
          {point.description}
        </p>

        {point.cta && (
          <Link
            href={point.cta.href}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#3a332c]/40 px-7 py-3 text-[13px] tracking-wide text-[#3a332c] transition-colors hover:bg-[#3a332c] hover:text-white"
          >
            {point.cta.label}
            <span aria-hidden>›</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ProductStickyShowcase({
  eyebrow = "Product",
  lead = (
    <>
      這上一等的科學配方，
      <br />
      日夜都能包覆你的
      <br />
      身心平衡
    </>
  ),
  description = (
    <>
      針對生活步調緊湊、壓力大與睡眠品質不佳的現代人設計。
      <br />
      透過黃金三角配方，日間提振精神、夜間放鬆入眠，
      <br />
      讓每一天都能找回屬於自己的節奏。
    </>
  ),
  points = DEFAULT_POINTS,
  footerCta = { label: "查看完整商品資訊", href: "#" },
}) {
  return (
    <section className="relative w-full overflow-hidden bg-[#fbfaf7]">
      {/* 標頭 */}
      <div className="mx-auto w-full max-w-[860px] px-6 pt-20 pb-8 text-center sm:pt-24 lg:pt-28">
        <p className="text-[13px] font-medium uppercase tracking-[0.3em] text-[#b3a99d]">
          {eyebrow}
        </p>
        <h2
          className="mt-6 text-[clamp(1.5rem,3.6vw,2.4rem)] font-medium leading-[1.7] tracking-[0.08em] text-[#2f2a24]"
          style={{ fontFamily: SERIF }}
        >
          {lead}
        </h2>
        <p className="mt-6 text-[13px] leading-[2] tracking-wide text-[#8a8178] sm:text-[14px]">
          {description}
        </p>
      </div>

      {/* 三個 Point 面板 */}
      {points.map((point, index) => (
        <PointPanel key={point.label} point={point} index={index} />
      ))}

      {/* 底部 CTA */}
      <div className="flex w-full justify-center pb-24 pt-8">
        <Link
          href={footerCta.href}
          className="inline-flex items-center gap-3 rounded-full border border-[#3a332c] px-10 py-4 text-[13px] tracking-[0.1em] text-[#3a332c] transition-colors hover:bg-[#3a332c] hover:text-white"
        >
          {footerCta.label}
          <span aria-hidden>›</span>
        </Link>
      </div>
    </section>
  );
}
