"use client";
// import styles from "./page.module.scss";
import React, { useRef, useEffect, useState } from "react";
import { Link } from "next-view-transitions";
import Carousel from "../components/FactaryCarousel/index";
import MainScrollCard from "../components/MainScrollCard";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import TestimonialsSection from "@/components/TestimonialsSection";
const FeatureCarousel = dynamic(
  () => import("../components/EmblaCarouselTravel/index"),
  {
    ssr: false,
  },
);
import { ReactLenis } from "@studio-freight/react-lenis";
import Image from "next/image";
import Marquee from "react-fast-marquee";
// import { Link } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);
const backgroundImage = "/images/S__23085150.png";
const myLoader = ({ src, width, quality, placeholder }) => {
  return `https://www.dot-st.com/static/docs/nikoand/pages/2022_city_creek_v2/assets/images/${src}?w=${width}?p=${placeholder}`;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  // ✅ 新增控制彈窗顯示的狀態
  const [showModal, setShowModal] = useState(false);

  // ✅ 設定進入頁面後延遲 10 秒開啟彈窗
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 10000); // 10000ms = 10秒
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const font = new FontFace(
      "ResourceHanRoundedCN-Heavy",
      "url(/fonts/ResourceHanRoundedCN-Heavy.ttf)",
    );

    font
      .load()
      .then((loadedFont) => {
        document.fonts.add(loadedFont);
        if (carouselRef.current) {
          carouselRef.current.style.fontFamily =
            "ResourceHanRoundedCN-Heavy, sans-serif";
        }
      })
      .catch((error) => {
        console.log("字體加載失敗:", error);
      });
  }, []);

  // ... (省略 testimonials 資料，保持原樣) ...
  const testimonials = [
    {
      quote:
        "春天輕盈柔軟，讓寶貝自在探索；夏日涼爽透氣，盡情玩耍不悶熱；秋季層次搭配，既保暖又時尚；冬日蓬鬆可愛，溫暖包裹每個童年時光。每個季節都有不同的美好！",
      name: "四季童趣穿搭，陪伴孩子快樂成長！",
      designation: "Product Manager at TechFlow",
      src: "/images/img01.jpg",
    },
    {
      quote:
        "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
      name: "Michael Rodriguez",
      designation: "CTO at InnovateSphere",
      src: "/images/slider-banner02.jpg",
    },
    {
      quote:
        "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
      name: "Emily Watson",
      designation: "Operations Director at CloudScale",
      src: "/images/slider-banner04.jpg",
    },
    {
      quote:
        "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
      name: "James Kim",
      designation: "Engineering Lead at DataPro",
      src: "/images/kv.webp",
    },
  ];
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
    <ReactLenis root>
      <div className="">
        {/* ✅ 修改後的：右下角懸浮廣告影片區塊 (開始) */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              // 動畫改為從右下角滑入
              initial={{ opacity: 0, y: 100, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 100, x: 20 }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.5 }}
              // 樣式修改：固定定位右下角、IG直式比例、無圓角、白邊框、陰影
              className="fixed bottom-4 right-4 z-[9999] w-60 sm:w-72 md:w-80 aspect-[9/16] overflow-hidden border-4 border-white shadow-2xl bg-black"
            >
              {/* 關閉按鈕：樣式調整為適合深色背景的簡潔按鈕 */}
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

              {/* 影片播放器 */}
              <video
                src="/video/UFLOW.mp4"
                autoPlay
                loop
                muted // ⚠️ 必須靜音才能在大多數瀏覽器自動播放
                playsInline
                // 確保影片填滿容器並保持比例
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ 修改後的：右下角懸浮廣告影片區塊 (結束) */}

        <MainScrollCard />

        {/* ... (以下原本的 sections 程式碼保持不變，請確保完整複製) ... */}

        <section className="section-two-column xl:w-[95%] sm:w-[90%] w-full mx-auto pt-20">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Card 2 */}
            <div className="aspect-[1/1] group relative overflow-hidden m-4 sm:m-5">
              {/* 白色邊框框 */}
              <div className="description border border-white scale-110 md:scale-125 group-hover:scale-100 duration-400 transition-all w-[94%] md:w-[90%] absolute z-50 h-[94%] md:h-[90%] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" />
              {/* 文字區塊 */}
              <div className="description p-5 sm:p-7 md:p-10 duration-400 transition-all w-[94%] md:w-[90%] absolute z-40 h-[94%] md:h-[90%] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                <div className="w-full h-full flex justify-between flex-col">
                  <div>
                    <h2 className="font-bold text-white leading-none text-3xl sm:text-3xl md:text-3xl xl:text-4xl 2xl:text-5xl">
                      肽晶芙蓉
                    </h2>
                    <h2 className="font-bold text-white leading-none mt-2 text-3xl sm:text-3xl md:text-3xl xl:text-4xl 2xl:text-5xl">
                      國際原廠 專利足量
                    </h2>
                  </div>
                  <div className="w-full lg:w-1/2 mt-4 md:mt-0">
                    <p className="text-white tracking-widest leading-relaxed text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px]">
                      適用族群： 對美極度要求族群、 醫美後保養族群、
                      髮質脆弱族群、 經常飲酒族群、 身體卡卡族群、 運動健身族群
                    </p>
                  </div>
                </div>
              </div>
              {/* 背景圖片 */}
              <Image
                src="/images/DSCF7894.jpg"
                alt="img"
                placeholder="empty"
                className="object-cover scale-100 group-hover:scale-110 duration-500"
                loading="lazy"
                fill
              />
            </div>

            {/* Card 2 */}
            <div className="aspect-[1/1] group relative overflow-hidden m-4 sm:m-5">
              {/* 白色邊框框 */}
              <div className="description border border-white scale-110 md:scale-125 group-hover:scale-100 duration-400 transition-all w-[94%] md:w-[90%] absolute z-50 h-[94%] md:h-[90%] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" />
              {/* 文字區塊 */}
              <div className="description p-5 sm:p-7 md:p-10 duration-400 transition-all w-[94%] md:w-[90%] absolute z-40 h-[94%] md:h-[90%] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                <div className="w-full h-full flex justify-between flex-col">
                  <div>
                    <h2 className="font-bold text-white leading-none text-3xl sm:text-3xl md:text-3xl xl:text-3xl 2xl:text-5xl">
                      GABA 鎂鎂香蜂草
                    </h2>
                    <h2 className="font-bold text-white leading-none mt-2 text-3xl sm:text-3xl md:text-3xl xl:text-3xl 2xl:text-5xl">
                      國際原廠 專利足量
                    </h2>
                  </div>
                  <div className="w-full lg:w-1/2 mt-4 md:mt-0">
                    <p className="text-white tracking-widest leading-relaxed text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px]">
                      適用族群： 高壓工作型態者、腦袋停不下來 作息與飲食不規律者
                      調時差、長途搭機者 飲酒頻率較高者 睡眠品質不穩定者
                      規律運動與健身族群
                    </p>
                  </div>
                </div>
              </div>
              {/* 背景圖片 */}
              <Image
                src="/images/DSCF7801.jpg"
                alt="img"
                placeholder="empty"
                className="object-cover scale-100 group-hover:scale-110 duration-500"
                loading="lazy"
                fill
              />
            </div>
          </div>
        </section>
        <section className="bg-white w-full    min-h-[80vh] pt-32    relative">
          <div className="absolute  w-[90%] max-w-[1750px]  right-[-7%]  xl:right-[0%] top-1/2 z-20 -translate-y-1/2">
            <TestimonialsSection />
          </div>
        </section>
        <section className="section-main-products w-full pt-16 sm:pt-20">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* 文字區 */}
            <div className="text max-w-xl md:max-w-[500px] pt-4 md:pt-0 pb-4 md:pb-0 md:pr-6">
              <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight">
                UFLOW
              </h1>
              <h2 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold">
                養分循環補給
              </h2>
              <div className="mt-4 space-y-2">
                <p className="tracking-wider text-sm sm:text-[15px] font-normal leading-relaxed">
                  重返 17 歲的元氣，遠離惡體質。
                </p>
                <p className="tracking-wider text-sm sm:text-[15px] font-normal leading-relaxed">
                  堅持「植萃天然」與「科學創新」。
                  我們選用國際大廠專利原料，以科學實證的足量配方，
                  為您找回身體原本的循環與平衡，打造簡單且富有活力的健康生活。
                </p>
              </div>
            </div>

            {/* 按鈕區 */}
            <div className="flex w-full md:w-auto justify-start md:justify-end md:items-end pb-2 md:pb-0">
              <Link href="/blog">
                <button className="group mt-5 relative inline-flex h-[calc(48px+8px)] items-center justify-center rounded-full bg-[#f58a9c] py-1 pl-6 pr-14 font-medium text-neutral-50">
                  <span className="z-10 pr-2">相關文章</span>
                  <div className="absolute right-1 inline-flex h-12 w-12 items-center justify-end rounded-full bg-[#e6657b] transition-[width] group-hover:w-[calc(100%-8px)]">
                    <div className="mr-3.5 flex items-center justify-center">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-neutral-50"
                      >
                        <path
                          d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </button>
              </Link>
            </div>
          </div>

          {/* 下方輪播 */}
          <div className="w-full overflow-hidden mt-4 sm:mt-6">
            <Carousel />
          </div>
        </section>
      </div>
    </ReactLenis>
  );
}
