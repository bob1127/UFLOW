"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";

/**
 * 肽晶芙蓉特色 — 圖一二風格圓角漂浮素材卡
 */
const FEATURES = [
  {
    src: "/images/about/晶透源頭：LiposoMax微脂體穀胱甘肽.png",
    title: "晶透源頭",
    en: "LiposoMax®",
    desc: "美國專利微脂體技術，突破吸收極限，由內而外綻放透亮光采。",
    position:
      "lg:absolute lg:left-[8%] lg:top-[4%] lg:z-20 lg:w-[280px] xl:w-[320px]",
  },
  {
    src: "/images/about/日本冰晶番茄 嚴選日本專利冰晶番茄.png",
    title: "隱形防護",
    en: "Phytonoid®",
    desc: "日本專利冰晶番茄，抵禦外在光線刺激，撐起全天候隱形防護。",
    position:
      "lg:absolute lg:left-[4%] lg:top-[52%] lg:z-20 lg:w-[280px] xl:w-[320px]",
  },
  {
    src: "/images/about/彈力支撐：Mesoporosil® 比利時正矽酸.png",
    title: "彈力支撐",
    en: "Mesoporosil®",
    desc: "比利時專利正矽酸，穩固膠原結構，重現緊緻與澎潤感。",
    position:
      "lg:absolute lg:right-[4%] lg:top-[-2%] lg:z-20 lg:w-[280px] xl:w-[320px]",
  },
  {
    src: "/images/about/抗氧封存：PUREWAY-C® 複方維生素 C.png",
    title: "抗氧封存",
    en: "PUREWAY-C®",
    desc: "複方維生素 C 協同抗氧，喚回彈、緊、嫩芙蓉貴婦肌。",
    position:
      "lg:absolute lg:bottom-[8%] lg:right-[8%] lg:z-20 lg:w-[280px] xl:w-[320px]",
  },
];

export default function ExampleContent03() {
  const txtRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: txtRef,
    offset: ["start 0.8", "end 0.2"],
  });

  const rawOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0, 1, 1, 0],
  );
  const rawY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const opacity = useSpring(rawOpacity, { damping: 20, stiffness: 100 });
  const y = useSpring(rawY, { damping: 20, stiffness: 100 });

  return (
    <motion.div
      ref={txtRef}
      style={{ opacity, y }}
      className="mx-auto flex w-[90%] max-w-[1920px] flex-row"
    >
      <div className="relative flex w-full flex-col gap-10 lg:h-[120vh] lg:flex-row lg:gap-0">
        {FEATURES.map((item) => (
          <div
            key={item.en}
            className={`relative flex w-full justify-center lg:block lg:w-auto ${item.position}`}
          >
            <article className="flex w-full max-w-[340px] flex-col items-center text-center lg:max-w-none">
              {/* 圓角漂浮圖 — 圖一二小素材語彙 */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[36px] shadow-[0_16px_48px_rgba(0,0,0,0.35)] sm:rounded-[44px] lg:aspect-square lg:rounded-[48px]">
                <Image
                  src={item.src}
                  alt={`${item.title} ${item.en}`}
                  fill
                  sizes="320px"
                  className="object-cover"
                  placeholder="empty"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/15" />
              </div>

              <h3 className="mt-5 font-serif text-[18px] font-medium tracking-wide text-white sm:text-[20px]">
                {item.title}
              </h3>
              <p className="mt-1.5 font-sans text-[10px] uppercase tracking-[0.28em] text-white/70">
                {item.en}
              </p>
              <p className="mt-3 max-w-[280px] font-sans text-[12px] leading-[1.85] tracking-wide text-white/80 sm:text-[13px]">
                {item.desc}
              </p>
            </article>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
