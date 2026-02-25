"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Leaf, FlaskConical, ShieldCheck, HeartHandshake } from "lucide-react";
import Link from "next/link";
import ScrollAnimate from "../../components/ScrollAnimation/page.jsx";
// import SvgImg from "../../components/SVGImage.jsx";
// import HeroSlider from "../../components/HeroSlideContact/page";
import { Accordion, AccordionItem } from "@heroui/react";
import Character from "../../components/TextOpacityScroll/Character.jsx";
import GsapText from "../../components/RevealText/index";
import MotionImage from "../../components/MotionImage.jsx";

import Swiper from "../../components/SwiperCarousel/SwiperCardFood.jsx";

// import HoverCard from "../../components/HoverCardBuild/index";

// import { PlaceholdersAndVanishInput } from "../../components/ui/placeholders-and-vanish-input.js";
// import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
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

  gsap.registerPlugin(CustomEase);

  const placeholders = [
    "理想的家，該具備哪些元素？",
    "選擇房子時，你最在意什麼？",
    "如何找到兼具品質與舒適的住宅？",
    "買房是投資還是生活選擇？",
    "未來的家，會是什麼模樣？",
  ];

  const handleChange = (e) => {
    console.log(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("submitted");
  };
  return (
    <main className="w-full bg-white text-[#2b3742] overflow-hidden pt-20">
      <section>
        <div>
          <ScrollAnimate />
        </div>
      </section>
      {/* 輪播區 */}
      <section className="section-padding">
        <Swiper />
      </section>

      {/* 動畫區 */}

      {/* 室內設計問題 區 */}
      <section className="flex flex-col w-full max-w-[1120px] mx-auto px-4 md:px-8 py-12 md:py-24">
        {/* 頂部標題區塊：使用 justify-between 確保左右貼齊邊界 */}
        <div className="flex flex-col md:flex-row justify-between md:items-end w-full mb-12 lg:mb-16 gap-8">
          {/* 左側主標 + 說明 */}
          <div className="w-full md:w-3/4 flex flex-col">
            <h2 className="text-4xl md:text-[2.6rem] leading-tight text-gray-900 font-normal">
              養分循環補給
              <br className="hidden md:block" />
              相關問題
            </h2>
            <div className="line bg-black h-[1px] w-[80px] my-6"></div>
            <p className="text-gray-800 text-sm md:text-base font-light max-w-[400px] leading-relaxed">
              我們相信，健康是一種生活方式，
              也是一種簡單、自然且富有活力的人生。
            </p>
          </div>

          {/* 右側標籤：使用文字直排 (writing-mode) 完美貼齊右側緣 */}
          <div className="w-full md:w-1/4 flex justify-start md:justify-end md:pb-2">
            <span className="text-[1rem] md:text-[1.1rem] text-gray-500 tracking-widest uppercase md:[writing-mode:vertical-rl] md:rotate-180">
              LIFE - Healthy
            </span>
          </div>
        </div>

        {/* QA 卡片區塊：使用 Grid 網格系統，保證三張卡片自動撐滿並貼齊左右緣 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 w-full">
          {[
            {
              title1: "植粹與天然",
              title2: "植粹與天然",
              tag: "Natural",
              desc: "我們的每一款產品都選用最純粹、最自然的成分，確保每一位 顧客都能享受天然的健康益處。",
              img: "/images/DSCF7801.jpg",
            },
            {
              title1: "創新與科學",
              title2: "創新與科學",
              tag: "創新",
              desc: "我們致力於將創新的科技與天然成分相結合， 通過科學研究為顧客提供更加有效的健康解決方案。",
              img: "/images/DSCF7872.jpg",
            },
            {
              title1: "透明與信任",
              title2: "透明與信任",
              tag: "Trust",
              desc: "我們相信誠實與透明是建立品牌信任的基礎， 會讓每一位顧客了解產品來源、成分及使用方式。",
              img: "/images/DSCF7850.jpg",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group flex flex-col items-start w-full overflow-hidden cursor-pointer"
            >
              {/* 圖片容器：設定 aspect ratio 讓圖片高度統一 */}
              <div className="overflow-hidden w-full aspect-[4/5] relative bg-gray-100">
                <Image
                  src={item.img}
                  alt={`qa-item-${i}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover w-full h-full group-hover:scale-110 group-hover:rounded-[32px] transition-all duration-700 ease-out"
                />
              </div>

              {/* 文字說明區塊：移除左右 px，緊貼圖片邊緣 */}
              <div className="flex flex-col py-6 items-start w-full">
                <span className="text-gray-400 tracking-wider text-sm mb-2 font-medium">
                  - {item.tag}
                </span>

                <button className="relative h-8 bg-transparent text-neutral-800 font-semibold focus:outline-none text-left">
                  <span className="relative inline-flex overflow-hidden h-full items-center">
                    <div className="translate-y-0 text-lg md:text-[1.15rem] skew-y-0 transition duration-500 group-hover:-translate-y-[120%] group-hover:skew-y-12">
                      {item.title1}
                    </div>
                    <div className="absolute top-0 text-lg md:text-[1.15rem] translate-y-[120%] skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                      {item.title2}
                    </div>
                  </span>
                </button>

                <p className="text-[15px] text-gray-500 mt-3 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* 1. Hero Section：品牌標語 [cite: 1-4] */}

      <section className="section_features w-full pt-16 sm:pt-20">
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
