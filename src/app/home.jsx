"use client";
// import styles from "./page.module.scss";
import React, { useRef, useEffect, useState } from "react";
import { Link } from "next-view-transitions";
// import { AnimatePresence } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
const Slider = dynamic(
  () => import("../components/SwiperCarousel/SwiperCardAbout"),
  {
    ssr: false,
  }
);
const FeatureCarousel = dynamic(
  () => import("../components/EmblaCarouselTravel/index"),
  {
    ssr: false,
  }
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

  useEffect(() => {
    const font = new FontFace(
      "ResourceHanRoundedCN-Heavy",
      "url(/fonts/ResourceHanRoundedCN-Heavy.ttf)"
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
            }
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
              "-=0.5"
            )
            // 4) 圖片做縮放：由 1.24 → 1.00（更長、更明顯）
            .fromTo(
              image.querySelector(".img-zoom"),
              {
                scale: 1.84, // ← 起始放大一點
                willChange: "transform",
                transformOrigin: "center center",
              },
              {
                scale: 1,
                duration: 2.5, // ← 時間拉長（原 1.6 → 2.4）
                ease: "expo.out", // ← 更順暢的減速收尾
              },
              "<" // 與前一段同步開始
            );
        });

        ScrollTrigger.refresh();
      }, containerRef);

      return ctx;
    };

    let ctx; // ← 這裡移除 : any

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
        onTransitionComplete
      );
    };
  }, []);

  return (
    <ReactLenis root>
      <div className="bg-[#FFFAF4]">
        <div className="pt-6">
          <Slider ratio="16/9" autoplayDelay={4500} speed={1400} />
        </div>
        <section className="section-main-products xl:w-[95%] sm:w-[90%] w-full mx-auto pt-20">
          <div className="flex flex-col lg:flex-row">
            {/* 左側文字區 */}
            <div className="text w-full lg:w-[30%] p-6 lg:p-10 flex flex-col justify-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                UFLOW
              </h1>
              <h2 className="text-xl sm:text-2xl mt-4">
                UFLOW是一家以提供高品質健康產品為核心的品牌
              </h2>
              <div className="mt-4">
                <p className="tracking-wider leading-relaxed">
                  研發的精神在以科學方法應用於天然原料科技養護身心。。
                </p>
                <p className="tracking-wider leading-relaxed mt-2">
                  我們相信，健康是一種生活方式，也是一種簡單、自然且富有活力的人生。
                </p>

                <button className="group mt-5 relative inline-flex h-[calc(48px+8px)] items-center justify-center rounded-full bg-neutral-950 py-1 pl-6 pr-14 font-medium text-neutral-50">
                  <span className="z-10 pr-2">更多產品</span>
                  <div className="absolute right-1 inline-flex h-12 w-12 items-center justify-end rounded-full bg-neutral-700 transition-[width] group-hover:w-[calc(100%-8px)]">
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
              </div>
            </div>

            {/* 右側產品區 */}
            <div className="product w-full lg:w-[70%] mt-10 lg:mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
                {/* Card 1 */}
                <div className="group p-6 lg:p-8">
                  <Link href="/product">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src="/images/78f5a2cdd76c7a7dd092a19eabcd753d.jpg"
                        alt="img"
                        placeholder="empty"
                        className="object-cover group-hover:scale-90 duration-200"
                        loading="lazy"
                        fill
                        sizes="(min-width: 1024px) 800px, 100vw"
                      />
                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                        viewBox="0 0 100 75"
                        preserveAspectRatio="none"
                      >
                        <rect
                          x="1"
                          y="1"
                          width="98"
                          height="73"
                          fill="none"
                          stroke="black"
                          strokeWidth="1"
                          strokeDasharray="6 2"
                          vectorEffect="non-scaling-stroke"
                          className="animate-ants"
                        />
                      </svg>
                    </div>
                  </Link>

                  <div className="info mt-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-[20px] border ml-[-2px] border-gray-500 text-gray-500 px-4 w-auto text-[13px] py-1 whitespace-nowrap">
                        熱銷產品
                      </span>
                      <div className="flex text-[15px] justify-center whitespace-nowrap">
                        NT,400$
                      </div>
                    </div>

                    <br />
                    <b className="text-lg sm:text-xl tracking-widest">
                      穀胱甘肽
                    </b>
                    <p className="text-[14px] tracking-wider mt-1 leading-relaxed">
                      防禦紫外線傷害、抑制黑色素生成，並有助於淡
                      化色斑、提亮膚色。
                    </p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="group p-6 lg:p-8">
                  <Link href="/product">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src="/images/78f5a2cdd76c7a7dd092a19eabcd753d.jpg"
                        alt="img"
                        placeholder="empty"
                        className="object-cover group-hover:scale-90 duration-200"
                        loading="lazy"
                        fill
                        sizes="(min-width: 1024px) 800px, 100vw"
                      />
                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                        viewBox="0 0 100 75"
                        preserveAspectRatio="none"
                      >
                        <rect
                          x="1"
                          y="1"
                          width="98"
                          height="73"
                          fill="none"
                          stroke="black"
                          strokeWidth="1"
                          strokeDasharray="6 2"
                          vectorEffect="non-scaling-stroke"
                          className="animate-ants"
                        />
                      </svg>
                    </div>
                  </Link>

                  <div className="info mt-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-[20px] border ml-[-2px] border-gray-500 text-gray-500 px-4 w-auto text-[13px] py-1 whitespace-nowrap">
                        熱銷產品
                      </span>
                      <div className="flex text-[15px] justify-center whitespace-nowrap">
                        NT,400$
                      </div>
                    </div>

                    <br />
                    <b className="text-lg sm:text-xl tracking-widest">
                      穀胱甘肽
                    </b>
                    <p className="text-[14px] tracking-wider mt-1 leading-relaxed">
                      防禦紫外線傷害、抑制黑色素生成，並有助於淡
                      化色斑、提亮膚色。
                    </p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="group p-6 lg:p-8">
                  <Link href="/product">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src="/images/78f5a2cdd76c7a7dd092a19eabcd753d.jpg"
                        alt="img"
                        placeholder="empty"
                        className="object-cover group-hover:scale-90 duration-200"
                        loading="lazy"
                        fill
                        sizes="(min-width: 1024px) 800px, 100vw"
                      />
                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                        viewBox="0 0 100 75"
                        preserveAspectRatio="none"
                      >
                        <rect
                          x="1"
                          y="1"
                          width="98"
                          height="73"
                          fill="none"
                          stroke="black"
                          strokeWidth="1"
                          strokeDasharray="6 2"
                          vectorEffect="non-scaling-stroke"
                          className="animate-ants"
                        />
                      </svg>
                    </div>
                  </Link>

                  <div className="info mt-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-[20px] border ml-[-2px] border-gray-500 text-gray-500 px-4 w-auto text-[13px] py-1 whitespace-nowrap">
                        熱銷產品
                      </span>
                      <div className="flex text-[15px] justify-center whitespace-nowrap">
                        NT,400$
                      </div>
                    </div>

                    <br />
                    <b className="text-lg sm:text-xl tracking-widest">
                      穀胱甘肽
                    </b>
                    <p className="text-[14px] tracking-wider mt-1 leading-relaxed">
                      防禦紫外線傷害、抑制黑色素生成，並有助於淡
                      化色斑、提亮膚色。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                    <h2 className="font-bold text-white leading-none text-3xl sm:text-3xl md:text-3xl xl:text-5xl 2xl:text-7xl">
                      THE
                    </h2>
                    <h2 className="font-bold text-white leading-none mt-2 text-3xl sm:text-3xl md:text-3xl xl:text-5xl 2xl:text-7xl">
                      MUG GARUD
                    </h2>
                  </div>
                  <div className="w-full lg:w-1/2 mt-4 md:mt-0">
                    <p className="text-white tracking-widest leading-relaxed text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px]">
                      歷經一年多的構思，我們終於實現了KOREDAKE商業化的艱鉅目標。這是一款營養均衡、注重美味的獨特蛋白質。我們希望人們每天都能喝到它，因此我們精心打造了天然的甜味和易於飲用的口味。
                    </p>
                  </div>
                </div>
              </div>
              {/* 背景圖片 */}
              <Image
                src="/images/78cfb4ed2959fd2d7884c0f3846e59df.jpg"
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
                    <h2 className="font-bold text-white leading-none text-3xl sm:text-3xl md:text-3xl xl:text-5xl 2xl:text-7xl">
                      THE
                    </h2>
                    <h2 className="font-bold text-white leading-none mt-2 text-3xl sm:text-3xl md:text-3xl xl:text-5xl 2xl:text-7xl">
                      MUG GARUD
                    </h2>
                  </div>
                  <div className="w-full lg:w-1/2 mt-4 md:mt-0">
                    <p className="text-white tracking-widest leading-relaxed text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px]">
                      歷經一年多的構思，我們終於實現了KOREDAKE商業化的艱鉅目標。這是一款營養均衡、注重美味的獨特蛋白質。我們希望人們每天都能喝到它，因此我們精心打造了天然的甜味和易於飲用的口味。
                    </p>
                  </div>
                </div>
              </div>
              {/* 背景圖片 */}
              <Image
                src="/images/78cfb4ed2959fd2d7884c0f3846e59df.jpg"
                alt="img"
                placeholder="empty"
                className="object-cover scale-100 group-hover:scale-110 duration-500"
                loading="lazy"
                fill
              />
            </div>
          </div>
        </section>
        <section className="section_features w-full pt-16 sm:pt-20">
          {/* 上半：價值觀區塊 */}
          <div className="flex flex-col items-center justify-center mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
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
          <div className="flex flex-col md:flex-row w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* 左側圖片區 */}
            <div className="flex flex-col w-full">
              <div className="img w-full mx-auto sm:mx-3 h-auto md:h-[70vh] xl:h-[80vh] overflow-hidden">
                {/* ✅ 保留動畫 class，不動效果 */}
                <div className="animate-image-wrapper relative w-full aspect-[4/5] md:h-full overflow-hidden">
                  <div className="overlay absolute inset-0 bg-black z-10" />
                  <div className="image-container relative w-full h-full overflow-hidden">
                    <div className="img-zoom absolute inset-0 will-change-transform">
                      <Image
                        src="https://coralclub.ru/images/main/image4.jpg"
                        alt="About Image 1"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 50vw"
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
                      建築と環境の「間」を考える
                    </p>
                    <span className="mt-4 sm:mt-5 leading-relaxed text-gray-500 font-light text-sm sm:text-[0.95rem] max-w-md">
                      Having the architecture as black and the environment as
                      white, we consider that human being’s comfort zone lies
                      within the ranges of gray.
                    </span>
                  </div>
                </div>

                {/* 右文案 + 按鈕 */}
                <div className="w-full md:w-1/2">
                  <div className="flex items-end md:items-end justify-end flex-col text-right">
                    <span className="mt-2 sm:mt-5 leading-relaxed text-gray-500 font-light text-sm sm:text-[0.95rem] max-w-md">
                      Please find our concept, <br />
                      philosophy, and information here.
                    </span>

                    <button className="group mt-6 sm:mt-10 relative inline-flex h-10 sm:h-12 items-center justify-center overflow-hidden rounded-full px-5 sm:px-6 text-sm sm:text-base text-neutral-950">
                      <span className="relative inline-flex overflow-hidden">
                        <div className="absolute origin-bottom transition duration-500 [transform:translateX(-150%)_skewX(33deg)] group-hover:[transform:translateX(0)_skewX(0deg)]">
                          Go PROJECTS →
                        </div>
                        <div className="transition duration-500 [transform:translateX(0%)_skewX(0deg)] group-hover:[transform:translateX(150%)_skewX(33deg)]">
                          Go PROJECTS →
                        </div>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section-main-products w-full pt-16 sm:pt-20">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* 文字區 */}
            <div className="text max-w-xl md:max-w-[500px] pt-4 md:pt-0 pb-4 md:pb-0 md:pr-6">
              <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight">
                Mission
              </h1>
              <h2 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold">
                我們的使命
              </h2>
              <div className="mt-4 space-y-2">
                <p className="tracking-wider text-sm sm:text-[15px] font-normal leading-relaxed">
                  打造每個人在繁忙生活中的健康節奏。
                </p>
                <p className="tracking-wider text-sm sm:text-[15px] font-normal leading-relaxed">
                  我們選擇與全球領先的科學研究機構合作，
                  確保每一款產品都符合最嚴格的品質標準， 並能有效促進身心健康。
                </p>
              </div>
            </div>

            {/* 按鈕區 */}
            <div className="flex w-full md:w-auto justify-start md:justify-end md:items-end pb-2 md:pb-0">
              <button className="group mt-4 md:mt-5 relative inline-flex h-11 sm:h-[calc(48px+8px)] items-center justify-center rounded-full bg-neutral-950 py-1 pl-6 pr-14 font-medium text-xs sm:text-sm md:text-base text-neutral-50">
                <span className="z-10 pr-2">文章詳情</span>
                <div className="absolute right-1 inline-flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-end rounded-full bg-neutral-700 transition-[width] group-hover:w-[calc(100%-8px)]">
                  <div className="mr-3.5 flex items-center justify-center">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-50"
                    >
                      <path
                        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 下方輪播 */}
          <div className="w-full overflow-hidden mt-4 sm:mt-6">
            <FeatureCarousel />
          </div>
        </section>
      </div>
    </ReactLenis>
  );
}
