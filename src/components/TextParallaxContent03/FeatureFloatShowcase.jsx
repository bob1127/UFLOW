"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { ArrowRight } from "lucide-react";

/**
 * 肽晶芙蓉 — 深色情境 + 左側漂浮圓角照片 + 大標文案 + 藥丸 CTA
 * 版型參照：深色模糊情境背景、左上/左下漂浮圓角照片、大標語 + 段落文案 + 圓角 CTA 按鈕
 */
export default function FeatureFloatShowcase() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const yPhotoTop = useSpring(
    useTransform(scrollYProgress, [0, 1], [40, -60]),
    { stiffness: 60, damping: 20 },
  );
  const yPhotoBottom = useSpring(
    useTransform(scrollYProgress, [0, 1], [80, -40]),
    { stiffness: 60, damping: 20 },
  );
  const yPhotoRight = useSpring(
    useTransform(scrollYProgress, [0, 1], [60, -80]),
    { stiffness: 60, damping: 20 },
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#2a2422] py-24 sm:py-28 lg:py-36"
    >
      {/* 背景情境圖：模糊 + 深色調 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 blur-[2px]"
        style={{ backgroundImage: "url('/images/DSCF7878.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1c1815]/95 via-[#231e1b]/80 to-[#2a2422]/40" />

      <div className="relative mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16">
        <div className="relative flex flex-col lg:min-h-[560px] lg:flex-row lg:items-center">
          {/* 左側：漂浮圓角照片 */}
          <div className="relative mx-auto mb-14 h-[300px] w-full max-w-[420px] sm:h-[360px] lg:mx-0 lg:mb-0 lg:h-[520px] lg:w-[42%]">
            <motion.div
              style={{ y: yPhotoTop }}
              className="absolute left-[6%] top-0 h-[150px] w-[150px] overflow-hidden rounded-[28px] border-2 border-white/20 shadow-2xl sm:h-[170px] sm:w-[170px] lg:left-[8%] lg:top-[2%] lg:h-[190px] lg:w-[190px]"
            >
              <Image
                src="/images/DSCF7801.jpg"
                alt="UFLOW 肽晶芙蓉 情境"
                fill
                sizes="200px"
                className="object-cover"
              />
            </motion.div>

            <motion.div
              style={{ y: yPhotoBottom }}
              className="absolute bottom-0 left-0 h-[190px] w-[220px] overflow-hidden rounded-[28px] border-2 border-white/20 shadow-2xl sm:h-[220px] sm:w-[250px] lg:bottom-[6%] lg:left-[0%] lg:h-[260px] lg:w-[300px]"
            >
              <Image
                src="/images/2894d77a-1a15-4b49-b982-8cc7a09e8029.png"
                alt="肽晶芙蓉 產品情境"
                fill
                sizes="320px"
                className="object-cover"
              />
            </motion.div>

            <motion.div
              style={{ y: yPhotoRight }}
              className="absolute right-[2%] top-[38%] hidden h-[150px] w-[150px] overflow-hidden rounded-[28px] border-2 border-white/20 shadow-2xl lg:block lg:h-[180px] lg:w-[180px]"
            >
              <Image
                src="/images/DSCF7850.jpg"
                alt="UFLOW 情境"
                fill
                sizes="200px"
                className="object-cover"
              />
            </motion.div>
          </div>

          {/* 右側：文案 */}
          <div className="w-full text-white lg:w-[58%] lg:pl-16">
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/60 sm:text-xs">
              Peptide Crystal Hibiscus
            </p>
            <h2 className="mt-4 text-[clamp(1.9rem,4.2vw,3.4rem)] font-bold leading-[1.35] tracking-tight">
              晶透煥亮，
              <br />
              喚回芙蓉貴婦肌。
            </h2>

            <div className="mt-6 max-w-md space-y-4 text-[13px] leading-[1.9] text-white/75 sm:text-[14px]">
              <p>
                日常中總被忽略的澎潤與透亮，是肽晶芙蓉最想找回的「妳」。
              </p>
              <p>
                結合美國專利微脂體穀胱甘肽、日本冰晶番茄與比利時正矽酸，
                溫柔包覆肌底，由內而外綻放自然光采。
              </p>
              <p>
                獻給每一個忙碌日常，也獻給安靜獨處的時刻，
                讓保養回歸簡單且安心。
              </p>
            </div>

            <Link
              href="/products/肽晶芙蓉"
              className="mt-9 inline-flex items-center gap-3 rounded-full border border-white/70 px-7 py-3.5 text-[13px] font-medium tracking-wide text-white transition-colors hover:bg-white hover:text-[#2a2422] sm:mt-10"
            >
              查看商品詳情
              <ArrowRight size={15} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
