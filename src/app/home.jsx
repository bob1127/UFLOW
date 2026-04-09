"use client";

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

gsap.registerPlugin(ScrollTrigger);

// 🌟 接收 Server (page.jsx) 傳來的 faqs 資料
export default function Home({ faqs = [] }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const carouselRef = useRef(null);

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
      <div className="w-screen " ref={containerRef}>
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

        <MainScrollCard />

        <section className="section-two-column xl:w-[95%] sm:w-[90%] w-full mx-auto pt-20">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <Link
              href="/products/peptide-crystal-hibiscus"
              className="aspect-[1/1] group relative overflow-hidden m-4 sm:m-5 block"
            >
              <div className="description border border-white scale-110 md:scale-125 group-hover:scale-100 duration-400 transition-all w-[94%] md:w-[90%] absolute z-50 h-[94%] md:h-[90%] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" />
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
              <Image
                src="/images/DSCF7894.jpg"
                alt="img"
                className="object-cover scale-100 group-hover:scale-110 duration-500"
                loading="lazy"
                fill
              />
            </Link>

            <Link
              href="/products/gaba-magnesium"
              className="aspect-[1/1] group relative overflow-hidden m-4 sm:m-5 block"
            >
              <div className="description border border-white scale-110 md:scale-125 group-hover:scale-100 duration-400 transition-all w-[94%] md:w-[90%] absolute z-50 h-[94%] md:h-[90%] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" />
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
              <Image
                src="/images/DSCF7801.jpg"
                alt="img"
                className="object-cover scale-100 group-hover:scale-110 duration-500"
                loading="lazy"
                fill
              />
            </Link>
          </div>
        </section>

        <section className="section-main-products w-full pt-16 sm:pt-20">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
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
                  我們選用國際大廠專利原料，以科學實證的足量配方，為您找回身體原本的循環與平衡，打造簡單且富有活力的健康生活。
                </p>
              </div>
            </div>

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

          <div
            className="w-full overflow-hidden mt-4 sm:mt-6"
            ref={carouselRef}
          >
            <Carousel />
          </div>
        </section>

        {/* 🌟 Google FAQ 結構化資料對應的實際視覺畫面 */}
        {faqs && faqs.length > 0 && (
          <section className="w-full bg-gray-50 pt-20 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  常見問題 FAQ
                </h2>
                <p className="text-gray-500">
                  了解更多關於 UFLOW 的購物與產品資訊
                </p>
              </div>
              <div className="space-y-6">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100"
                  >
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                      <span className="text-rose-500 shrink-0">Q.</span>
                      <span>{faq.question}</span>
                    </h3>
                    <p className="text-gray-600 leading-relaxed flex items-start gap-3">
                      <span className="text-emerald-600 font-bold shrink-0">
                        A.
                      </span>
                      <span>{faq.answer}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </ReactLenis>
  );
}
