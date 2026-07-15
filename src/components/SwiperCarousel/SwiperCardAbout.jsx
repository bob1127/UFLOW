"use client";

import { useEffect, useRef, useState } from "react";
import { Scrollbar, A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "next-view-transitions";
import { ArrowRight } from "lucide-react";
import "swiper/css";
import "swiper/css/scrollbar";

/**
 * 響應式圖：
 * - mobile  600x600
 * - tablet  1024x576
 * - desktop 1920x850
 */
const SLIDES = [
  {
    id: "gaba",
    href: "/products/gaba鎂鎂香蜂草",
    eyebrow: "GABA鎂鎂香蜂草｜科學調配",
    title: "節奏管理",
    description: "足量攝取 能量循環新配方。日間補充穩定精神，夜間補充助眠。",
    cta: "GABA鎂鎂香蜂草",
    imgMobile: "/images/index/slider/600x600/節奏管理_不必等臨界線失控.webp",
    imgTablet: "/images/index/slider/1024x576/節奏管理_不必等臨界線失控.webp",
    imgDesktop:
      "/images/index/slider/1920x850/節奏管理_不必等臨界線失控_GABA鎂鎂香蜂草_uflow-慶安有福保健食品.webp",
  },
  {
    id: "peptides",
    href: "/products/肽晶芙蓉",
    eyebrow: "肽晶芙蓉｜國際原廠．專利足量",
    title: "重返17歲の元氣",
    description: "科學調配 足量攝取，喚回芙蓉貴婦肌，找回自然澎潤感。",
    cta: "肽晶芙蓉",
    imgMobile: "/images/index/slider/600x600/重建17歲的元氣.webp",
    imgTablet: "/images/index/slider/1024x576/重建17歲的元氣.webp",
    imgDesktop:
      "/images/index/slider/1920x850/重返17歲の元氣_主打微脂體肽晶芙蓉_uflow-慶安有福保健食品.webp",
  },
  {
    id: "synbiotics",
    href: "/products/synbiotics",
    eyebrow: "維他菌合生元｜Synbiotics",
    title: "輕得自在",
    description: "台灣專利功能菌種配方保衛健康，將益生菌與益生元結合。",
    cta: "維他菌合生元",
    imgMobile: "/images/index/slider/600x600/維他菌合生元.webp",
    imgTablet: "/images/index/slider/1024x576/維他菌合生元.webp",
    imgDesktop:
      "/images/index/slider/1920x850/輕得自在_好菌留得住_維他菌合生元-uflow-慶安有福保健食品.webp",
  },
];

/** 只有 3 張時 loop + 左右 peek 容易空白，複製成足夠數量 */
const LOOP_COPIES = 3;
const LOOP_SLIDES = Array.from({ length: LOOP_COPIES }, (_, copy) =>
  SLIDES.map((slide) => ({ ...slide, _key: `${slide.id}-${copy}` })),
).flat();

function pickSrc(slide, width) {
  if (width < 640) return slide.imgMobile;
  if (width < 1024) return slide.imgTablet;
  return slide.imgDesktop;
}

/**
 * 首頁 Hero 輪播 — 無限循環 + 左右 peek（避免空白）
 */
export default function SwiperCardAbout({
  autoplayDelay = 4500,
  speed = 900,
}) {
  const mainRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [srcMap, setSrcMap] = useState(() =>
    Object.fromEntries(SLIDES.map((s) => [s.id, s.imgDesktop])),
  );

  // 依視窗選擇圖檔，並預載（單一 <img src>，loop 複製節點較穩定）
  useEffect(() => {
    let cancelled = false;

    const applyWidth = (width) => {
      const next = {};
      SLIDES.forEach((slide) => {
        next[slide.id] = pickSrc(slide, width);
      });
      setSrcMap(next);
      return Object.values(next);
    };

    const urls = applyWidth(window.innerWidth);

    Promise.all(
      urls.map(
        (src) =>
          new Promise((resolve) => {
            const img = new window.Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = src;
          }),
      ),
    ).then(() => {
      if (!cancelled) setReady(true);
    });

    const onResize = () => applyWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // 圖片就緒後再強制更新 loop，避免克隆 slide 空白
  useEffect(() => {
    if (!ready || !mainRef.current) return;
    const swiper = mainRef.current;
    requestAnimationFrame(() => {
      swiper.update();
      swiper.slideToLoop(0, 0);
      if (swiper.autoplay?.start) swiper.autoplay.start();
    });
  }, [ready, srcMap]);

  const goTo = (index) => {
    const swiper = mainRef.current;
    if (!swiper) return;
    swiper.slideToLoop(index);
  };

  const realCount = SLIDES.length;

  return (
    <div className="uflow-hero-carousel relative w-full bg-white pt-[80px] sm:pt-[110px]">
      <style jsx global>{`
        .uflow-hero-carousel .swiper {
          overflow: visible;
        }
        .uflow-hero-carousel .swiper-wrapper {
          align-items: stretch;
        }
        .uflow-hero-carousel .swiper-slide {
          height: auto;
          backface-visibility: hidden;
          transform: translateZ(0);
        }
        .uflow-hero-carousel .swiper-slide .slide-card {
          opacity: 0.55;
          transition: opacity 0.45s ease;
        }
        .uflow-hero-carousel .swiper-slide-active .slide-card,
        .uflow-hero-carousel .swiper-slide-duplicate-active .slide-card {
          opacity: 1;
        }
        .uflow-hero-carousel .swiper-scrollbar {
          position: relative !important;
          left: 0 !important;
          bottom: 0 !important;
          height: 1px !important;
          background: rgba(0, 0, 0, 0.15) !important;
        }
        .uflow-hero-carousel .swiper-scrollbar-drag {
          background: #1a1a1a !important;
          height: 1px !important;
        }
      `}</style>

      <div className="relative mx-auto w-full max-w-[1760px] px-3 pb-3 sm:px-5 sm:pb-4 md:px-8">
        <div className="relative">
          {ready ? (
            <Swiper
              modules={[Scrollbar, A11y, Autoplay]}
              onSwiper={(swiper) => {
                mainRef.current = swiper;
              }}
              onSlideChange={(swiper) => {
                setActiveIndex(swiper.realIndex % realCount);
              }}
              autoplay={{
                delay: autoplayDelay,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop
              loopAdditionalSlides={realCount}
              loopPreventsSliding={false}
              watchSlidesProgress
              watchOverflow={false}
              observer
              observeParents
              speed={speed}
              grabCursor
              centeredSlides
              slidesPerView={1.08}
              spaceBetween={8}
              breakpoints={{
                640: { slidesPerView: 1.18, spaceBetween: 10 },
                1024: { slidesPerView: 1.32, spaceBetween: 12 },
                1440: { slidesPerView: 1.42, spaceBetween: 14 },
              }}
              scrollbar={{
                el: ".uflow-hero-scrollbar",
                draggable: true,
                hide: false,
              }}
              className="!overflow-visible"
            >
              {LOOP_SLIDES.map((slide) => (
                <SwiperSlide key={slide._key}>
                  <article className="slide-card group relative aspect-square w-full overflow-hidden bg-stone-200 sm:aspect-[16/9] lg:aspect-[1920/850]">
                    <img
                      src={srcMap[slide.id]}
                      alt={slide.title}
                      draggable={false}
                      decoding="async"
                      loading="eager"
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7 md:p-9 lg:p-10">
                      <div className="max-w-[min(88%,32rem)] text-white">
                        <p className="text-[11px] font-medium tracking-[0.08em] text-white/85 sm:text-xs">
                          {slide.eyebrow}
                        </p>
                        <h2 className="mt-2 text-[clamp(1.6rem,3.6vw,3.25rem)] font-bold leading-[1.08] tracking-tight">
                          {slide.title}
                        </h2>
                        <p className="mt-3 max-w-md text-[12px] leading-relaxed text-white/85 sm:text-sm">
                          {slide.description}
                        </p>
                        <Link
                          href={slide.href}
                          className="mt-4 inline-flex items-center gap-3 text-[13px] font-medium tracking-wide text-white transition-opacity hover:opacity-80 md:mt-5 md:text-sm"
                        >
                          {slide.cta}
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/80 transition-transform group-hover:translate-x-0.5">
                            <ArrowRight size={14} strokeWidth={1.6} />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="aspect-square w-full animate-pulse bg-stone-200 sm:aspect-[16/9] lg:aspect-[1920/850]" />
          )}
        </div>

        <div className="relative z-40 mx-auto -mt-4 flex w-[94.3%] items-end justify-between gap-6 sm:-mt-5 sm:w-[87%] md:-mt-6 lg:-mt-8 lg:w-[74.1%] xl:w-[66.7%]">
          <div className="mb-3 min-w-0 flex-1 sm:mb-4">
            <div className="uflow-hero-scrollbar relative h-[1px] w-full max-w-[280px] md:max-w-[360px]" />
          </div>

          <div className="relative z-50 flex shrink-0 items-center gap-0">
            {SLIDES.map((thumb, thumbIndex) => {
              const isActive = thumbIndex === activeIndex;
              return (
                <button
                  key={thumb.id}
                  type="button"
                  onClick={() => goTo(thumbIndex)}
                  aria-label={`切換至 ${thumb.title}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative z-50 box-border h-14 w-[4.75rem] shrink-0 overflow-hidden border-[3px] border-white bg-stone-200 transition-opacity duration-300 sm:h-16 sm:w-[5.5rem] md:h-[4.5rem] md:w-28 lg:h-20 lg:w-[7.5rem] ${
                    isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={thumb.imgMobile}
                    alt=""
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
