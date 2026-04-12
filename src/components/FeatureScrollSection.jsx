"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const featuresData = [
  {
    id: "01",
    title: "植萃天然",
    desc: "嚴選全球頂級天然原料，回歸純粹的營養補給。",
    bgColor: "bg-blue-100",
  },
  {
    id: "02",
    title: "科學創新",
    desc: "與全球領先科研機構合作，以實證數據打造高效配方。",
    bgColor: "bg-yellow-100",
  },
  {
    id: "03",
    title: "透明信任",
    desc: "全成分公開透明，通過台灣專業機構檢驗，安心無負擔。",
    bgColor: "bg-green-100",
  },
  {
    id: "04",
    title: "關懷共鳴",
    desc: "傾聽使用者的真實需求，打造符合繁忙生活的健康節奏。",
    bgColor: "bg-purple-100",
  },
];

export default function FeatureScrollSection() {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".feature-card");

      cards.forEach((card) => {
        // ✨ 絲滑綁定滾輪的 Timeline ( Scrub 模式 )
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 85%", // 卡片頂端進入畫面 85% 時觸發
            end: "bottom 15%", // 卡片底端離開畫面 15% 時結束
            scrub: 1, // 1 秒的平滑慣性，超級絲滑的關鍵！
          },
        });

        // ✨ 完美的 3 段式動畫：進入 -> 停留 -> 離開
        tl.to(card, { opacity: 1, scale: 1, duration: 1, ease: "power1.out" }) // 1. 滑入變大
          .to(card, { opacity: 1, scale: 1, duration: 0.5 }) // 2. 螢幕中央停留片刻
          .to(card, {
            opacity: 0.9,
            scale: 0.8,
            duration: 1,
            ease: "power1.in",
          }); // 3. 離開變小
      });

      // 強制 GSAP 重新計算高度，防止抓錯位置
      setTimeout(() => ScrollTrigger.refresh(), 500);
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#f4f4f6] text-[#2c2c2c] py-20 lg:py-32"
    >
      {/* === 背景大文字凍結效果 === */}
      <div className="absolute top-[10%] left-0 w-full z-0 pointer-events-none select-none overflow-hidden">
        <h2 className="text-[25vw] font-black text-[#e8e8eb] leading-none whitespace-nowrap -ml-[5%]">
          UFLOW UFLOW
        </h2>
      </div>

      {/* 🚨 items-start 是 Flexbox 搭配 Sticky 必備的條件 */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-start gap-12 lg:gap-24">
        {/* === 左側：固定區塊 (Sticky) === */}
        {/* 將 sticky 設定在元素本身，並給予 top 值 */}
        <div className="w-full lg:w-5/12 sticky top-[15vh] z-20 pb-10">
          <span className="text-sm font-bold text-yellow-500 tracking-widest mb-4 uppercase inline-block">
            Our feature
          </span>
          <h2 className="text-4xl lg:text-5xl font-black leading-[1.3] tracking-wider mb-8">
            我們的 願景
            <br />
            打造每個人在繁忙生活中的健康節奏
          </h2>
          <p className="text-[#555] leading-loose mb-10 text-[15px] lg:text-[16px] max-w-md">
            UFLOW
            是一家以提供高品質健康產品為核心的品牌。我們的研發精神在於將科學方法應用於天然原料，以科技養護身心。
            <br />
            <br />
            我們選擇與全球領先的科學研究機構合作，確保每一款產品都符合最嚴格的品質標準，並能有效促進身心健康。從日常生活出發，為您找回身體原本的循環與平衡。
          </p>

          <button className="bg-[#1a1a1a] text-white rounded-full px-8 py-4 font-bold w-fit flex items-center gap-4 hover:bg-gray-800 transition-colors duration-300 shadow-xl">
            我們的產品
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* === 右側：滾動焦點卡片區塊 === */}
        <div className="w-full lg:w-7/12 flex flex-col relative z-10">
          <div className="pt-[20vh] pb-[20vh] flex flex-col gap-[35vh]">
            {featuresData.map((data, index) => (
              <div
                key={index}
                // ✨ 預設套用 Tailwind 的 opacity-20 與 scale-80，確保一開始就是半透明的
                className="feature-card opacity-90 scale-80 will-change-transform bg-white rounded-[40px] p-8 lg:p-14  w-full max-w-2xl mx-auto origin-center"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-blue-600 font-bold tracking-widest text-sm uppercase">
                    Point
                  </span>
                  <div className="w-8 h-[2px] bg-blue-600"></div>
                  <span className="text-blue-600 font-bold text-lg">
                    {data.id}
                  </span>
                </div>

                <h3 className="text-2xl lg:text-3xl font-bold leading-[1.5] mb-6 text-[#2c2c2c] whitespace-pre-line">
                  {data.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-[15px] lg:text-[16px]">
                  {data.desc}
                </p>

                <div className="mt-10 relative w-full h-[200px] flex justify-end items-center">
                  <div
                    className={`w-32 h-32 rounded-full ${data.bgColor} absolute right-10 top-0 opacity-80 mix-blend-multiply`}
                  ></div>
                  <div className="w-40 h-40 bg-gray-50 rounded-2xl relative z-10 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200">
                    [ 圖片替換區 ]
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
