"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Leaf, FlaskConical, ShieldCheck, HeartHandshake } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import React, { useRef, useEffect, useState } from "react";
// 動畫設定
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// 核心價值資料 [cite: 16-21]
const values = [
  {
    title: "植萃天然",
    desc: "嚴選全球頂級天然原料，回歸純粹的營養補給。",
    icon: <Leaf className="w-8 h-8 text-green-600" />,
    color: "bg-green-50",
  },
  {
    title: "科學創新",
    desc: "與全球領先科研機構合作，以實證數據打造高效配方。",
    icon: <FlaskConical className="w-8 h-8 text-blue-600" />,
    color: "bg-blue-50",
  },
  {
    title: "透明信任",
    desc: "全成分公開透明，通過台灣專業機構檢驗，安心無負擔。",
    icon: <ShieldCheck className="w-8 h-8 text-teal-600" />,
    color: "bg-teal-50",
  },
  {
    title: "關懷共鳴",
    desc: "傾聽使用者的真實需求，打造符合繁忙生活的健康節奏。",
    icon: <HeartHandshake className="w-8 h-8 text-rose-600" />,
    color: "bg-rose-50",
  },
];

// 專業團隊名單 [cite: 41-50]
// 註：圖片路徑請替換為您實際的專家照片
const teamMembers = [
  { name: "林智亨", title: "中醫師", image: "/images/people/1.jpg" },
  {
    name: "鄭玲君",
    title: "營養師",
    image: "/images/people/2.jpg",
  },
  { name: "林奎妙", title: "藥師", image: "/images/people/3.jpg" },
  {
    name: "陳安浚",
    title: "驗光師",
    image: "/images/people/4.jpg",
  },
  { name: "戴淑娟", title: "藥師", image: "/images/people/5.jpg" },
  {
    name: "葉孟娟",
    title: "諮商心理師",
    image: "/images/people/6.jpg",
  },
];

export default function AboutPage() {
  const imageRefs = useRef([]);
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
    <main className="w-full bg-white text-[#2b3742] overflow-hidden pt-20">
      {/* 1. Hero Section：品牌標語 [cite: 1-4] */}
      <section className="relative w-full h-[90vh] min-h-[500px] flex items-center justify-center bg-[url('/images/products/鎂鎂香蜂草.png')] bg-center bg-no-repeat bg-cover">
        {/* ▼▼▼ 新增：黑色透明遮罩 (Overlay) ▼▼▼ */}
        {/* inset-0: 填滿父層 / bg-black/50: 黑色50%透明度 / z-0: 確保在文字下方 */}
        <div className="absolute inset-0 bg-black/50 z-0" />

        {/* 背景裝飾圓 */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full border border-gray-200/50 opacity-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-blue-50 to-purple-50 blur-3xl opacity-60" />

        {/* 內容區塊 (維持 relative z-10 以確保浮在遮罩上) */}
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center gap-6"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl text-white md:text-6xl font-bold leading-tight"
            >
              養分循環補給 <br />
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="max-w-xl text-lg text-gray-200 mt-4 leading-relaxed"
            >
              我們相信，健康是一種生活方式，<br></br>
              也是一種簡單、自然且富有活力的人生。
            </motion.p>
          </motion.div>
        </div>
      </section>
      <section className="section_features w-full pt-16 sm:pt-20">
        {/* 上半：價值觀區塊 */}
        <div className="flex flex-col items-center justify-center mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="w-full py-8 sm:py-10">
            {/* 標題 */}
            <div className="px-2 sm:px-6 lg:px-10 text-center sm:text-left">
              <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight">
                value
              </h1>
              <h2 className="mt-2 font-bold text-2xl sm:text-3xl lg:text-4xl leading-snug">
                我們的價值觀
              </h2>
            </div>

            {/* 四個 value 區塊 */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-y-10 py-6 sm:py-8">
              <div className="px-2 sm:px-6 lg:px-10 py-3 sm:py-5">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  植粹與天然
                </h2>
                <p className="max-w-[500px] text-sm sm:text-base leading-relaxed text-gray-700">
                  我們的每一款產品都選用最純粹、最自然的成分，確保每一位
                  顧客都能享受天然的健康益處。
                </p>
              </div>

              <div className="px-2 sm:px-6 lg:px-10 py-3 sm:py-5">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  創新與科學
                </h2>
                <p className="max-w-[500px] text-sm sm:text-base leading-relaxed text-gray-700">
                  我們致力於將創新的科技與天然成分相結合，
                  通過科學研究為顧客提供更加有效的健康解決方案。
                </p>
              </div>

              <div className="px-2 sm:px-6 lg:px-10 py-3 sm:py-5">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  透明與信任
                </h2>
                <p className="max-w-[500px] text-sm sm:text-base leading-relaxed text-gray-700">
                  我們相信誠實與透明是建立品牌信任的基礎，
                  會讓每一位顧客了解產品來源、成分及使用方式。
                </p>
              </div>

              <div className="px-2 sm:px-6 lg:px-10 py-3 sm:py-5">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  關懷與共鳴
                </h2>
                <p className="max-w-[500px] text-sm sm:text-base leading-relaxed text-gray-700">
                  我們關注每一位顧客的健康與生活需求，用心傾聽，
                  提供貼心服務，並建立長久連結與信任。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 下半：圖片＋說明區塊 */}
        <div className="flex flex-col md:flex-row w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* 左側圖片區 */}
          <div className="flex flex-col w-full">
            <div className="img w-full mx-auto sm:mx-3 h-auto md:h-[70vh] xl:h-[80vh] overflow-hidden">
              {/* ✅ 保留動畫 class，不動效果 */}
              <div className="animate-image-wrapper relative w-full aspect-[4/5] md:h-full overflow-hidden">
                <div className="overlay absolute inset-0 bg-black z-10" />
                <div className="image-container relative w-full h-full overflow-hidden">
                  <div className="img-zoom absolute inset-0 will-change-transform">
                    <Image
                      src="/images/DSCF7777.jpg"
                      alt="About Image 1"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 2024px) 60vw, 50vw"
                      priority={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 文字 + 按鈕區 */}
            <div className="flex flex-col md:flex-row justify-between gap-6 sm:gap-4 mt-4 sm:mt-6">
              {/* 左文案 */}
              <div className="w-full md:w-1/2">
                <div className="flex flex-col pl-1 sm:pl-3 py-6 sm:py-10">
                  <p className="text-base sm:text-lg lg:text-[1.3rem] font-light leading-relaxed">
                    專利配方 | 醫師推薦
                  </p>
                  <span className="mt-4 sm:mt-5 leading-relaxed text-gray-500 font-light text-sm sm:text-[0.95rem] max-w-md">
                    我們選擇與全球領先的科學研究機構合作，確保每一款產品都符合最嚴格的品質標準，並能有效促進身心健康。從日常生活出發，為您找回身體原本的循環與平衡。
                  </span>
                </div>
              </div>

              {/* 右文案 + 按鈕 */}
              <div className="w-full md:w-1/2">
                <div className="flex items-end md:items-end justify-end flex-col text-right">
                  <span className="mt-2 sm:mt-5 leading-relaxed text-gray-500 font-light text-sm sm:text-[0.95rem] max-w-md">
                    UFLOW 是一家以提供高品質健康產品為核心的品牌。 <br />
                    我們的研發精神在於將科學方法應用於天然原料，以科技養護身心。
                  </span>

                  <button className="group mt-6 sm:mt-10 relative inline-flex h-10 sm:h-12 items-center justify-center overflow-hidden rounded-full px-5 sm:px-6 text-sm sm:text-base text-neutral-950">
                    <span className="relative inline-flex overflow-hidden">
                      <div className="absolute origin-bottom transition duration-500 [transform:translateX(-150%)_skewX(33deg)] group-hover:[transform:translateX(0)_skewX(0deg)]">
                        Go Product →
                      </div>
                      <div className="transition duration-500 [transform:translateX(0%)_skewX(0deg)] group-hover:[transform:translateX(150%)_skewX(33deg)]">
                        Go Product →
                      </div>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 2. 品牌故事：左圖右文 [cite: 7, 9, 10] */}
      <section className="py-24 container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative aspect-[4/3]  overflow-hidden"
          >
            {/* 請替換為 PDF P.2 的雙人形象照或類似風格照片 */}
            <Image
              src="/images/about/抗氧封存：PUREWAY-C® 複方維生素 C.png"
              alt="UFLOW Brand Story"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          <motion.div
            className="w-full lg:w-1/2 flex flex-col gap-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-2 relative inline-block">
              我們的願景
            </h2>
            <h3 className="text-xl font-medium text-gray-800">
              打造每個人在繁忙生活中的健康節奏
            </h3>
            <div className="text-gray-600 leading-8 space-y-4">
              <p>
                UFLOW
                是一家以提供高品質健康產品為核心的品牌。我們的研發精神在於將
                <strong className="text-gray-900 mx-1">
                  科學方法應用於天然原料
                </strong>
                ，以科技養護身心。
              </p>
              <p>
                我們選擇與全球領先的科學研究機構合作，確保每一款產品都符合最嚴格的品質標準，並能有效促進身心健康。從日常生活出發，為您找回身體原本的循環與平衡。
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              UFLOW 新概念
            </h2>
            <div className="w-12 h-1 bg-blue-500 mx-auto my-6 rounded-full"></div>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              堅持四大原則，以科學與自然的完美平衡，為您的健康嚴格把關。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {values.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col items-center text-center"
              >
                {/* 圖示區塊：拿掉卡片，保留純粹的圓形與圖示 */}
                <div
                  className={`w-20 h-20 rounded-full ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ease-out`}
                >
                  {/* 稍微調整 Icon 大小以符合新的比例 */}
                  <div className="scale-110">{item.icon}</div>
                </div>

                {/* 文字內容 */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-7 text-sm px-2">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA 區塊 */}
      <section className="py-20 bg-[#2b3742] text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">
            準備好找回生活的健康節奏了嗎？
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            探索我們為您精心打造的科學營養配方，開始您的 UFLOW 之旅。
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-[#2b3742] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg shadow-white/10"
          >
            前往選購商品
          </Link>
        </div>
      </section>
    </main>
  );
}
