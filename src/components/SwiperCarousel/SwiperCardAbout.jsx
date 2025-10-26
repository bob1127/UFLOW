"use client";

import { Pagination, Scrollbar, A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import AnimatedLink from "../AnimatedLink";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

/**
 * @param {Object} props
 * @param {Array<{image:string, href?:string, title?:string, subtitle?:string, overlay?:boolean, alt?:string}>} props.banners
 * @param {string} [props.ratio] e.g. "16/9"、"4/3"（有給優先走比例盒）
 * @param {number|string} [props.height=600] 不用比例時的固定高度（px 或 '60vh'）
 * @param {{base?: number|string, md?: number|string, lg?: number|string, xl?: number|string}} [props.heights] 斷點高度覆寫
 * @param {number} [props.autoplayDelay=5000]
 * @param {number} [props.speed=1200]
 * @param {boolean} [props.loop=true]
 * @param {boolean} [props.centeredSlides=true]
 * @param {number} [props.slidesPerView=1]
 * @param {string} [props.paginationColor='#fff']
 */
export default function SwiperCardAbout({
  banners = [
    {
      image:
        "https://coralclub.ru//upload/iblock/7b7/x6c6j3dyu69ud3j02yov2bc0sa21nm5d.webp",
      href: "/KuankoshiProjectInner",
      title: "Project-01",
      subtitle: "View More",
      overlay: true,
    },
    {
      image:
        "https://coralclub.ru//upload/iblock/7b7/x6c6j3dyu69ud3j02yov2bc0sa21nm5d.webp",
      href: "/KuankoshiProjectInner",
      title: "Project-02",
      subtitle: "View More",
      overlay: true,
    },
    {
      image:
        "https://coralclub.ru//upload/iblock/7b7/x6c6j3dyu69ud3j02yov2bc0sa21nm5d.webp",
      href: "/KuankoshiProjectInner",
      title: "Project-03",
      subtitle: "View More",
      overlay: true,
    },
  ],
  ratio, // ex: "16/9"
  height = 600,
  heights, // ex: { base: 420, md: 540, lg: 640 }
  autoplayDelay = 5000,
  speed = 1200,
  loop = true,
  centeredSlides = true,
  slidesPerView = 1,
  paginationColor = "#fff",
}) {
  const swiperVars = {
    ["--swiper-pagination-color"]: paginationColor,
    ["--swiper-navigation-color"]: paginationColor,
    ["--swiper-transition-timing-function"]:
      "cubic-bezier(0.645, 0.045, 0.355, 1)",
  };

  // 比例盒 paddingTop %
  const ratioPadding = (() => {
    if (!ratio) return null;
    const [w, h] = String(ratio).split("/").map(Number);
    if (!w || !h) return null;
    return `${(h / w) * 100}%`;
  })();

  // 斷點高度（無 ratio 時使用）
  const fixedHeightVars = (() => {
    if (ratioPadding) return {};
    const baseH =
      typeof height === "number" ? `${height}px` : String(height || "600px");
    const vars = {
      ["--banner-h-base"]: baseH,
      ["--banner-h-md"]: baseH,
      ["--banner-h-lg"]: baseH,
      ["--banner-h-xl"]: baseH,
    };
    if (heights?.base)
      vars["--banner-h-base"] =
        typeof heights.base === "number"
          ? `${heights.base}px`
          : String(heights.base);
    if (heights?.md)
      vars["--banner-h-md"] =
        typeof heights.md === "number" ? `${heights.md}px` : String(heights.md);
    if (heights?.lg)
      vars["--banner-h-lg"] =
        typeof heights.lg === "number" ? `${heights.lg}px` : String(heights.lg);
    if (heights?.xl)
      vars["--banner-h-xl"] =
        typeof heights.xl === "number" ? `${heights.xl}px` : String(heights.xl);
    return vars;
  })();

  return (
    <div className="w-[98%] mx-auto m-0 p-0">
      {/* 斷點高度輔助（只有沒有 ratio 時才生效） */}
      {!ratioPadding && (
        <style jsx>{`
          .banner-fixed-height {
            height: var(--banner-h-base);
          }
          @media (min-width: 768px) {
            .banner-fixed-height {
              height: var(--banner-h-md);
            }
          }
          @media (min-width: 1024px) {
            .banner-fixed-height {
              height: var(--banner-h-lg);
            }
          }
          @media (min-width: 1280px) {
            .banner-fixed-height {
              height: var(--banner-h-xl);
            }
          }
        `}</style>
      )}

      <Swiper
        modules={[Pagination, Scrollbar, A11y, Autoplay]}
        autoplay={{ delay: autoplayDelay, disableOnInteraction: false }}
        loop={loop}
        speed={speed}
        grabCursor
        centeredSlides={centeredSlides}
        slidesPerView={slidesPerView}
        pagination={{ clickable: true }}
        className=" border h-[90vh] overflow-hidden"
        style={swiperVars}
      >
        <SwiperSlide className="overflow-hidden group relative duration-1000">
          {" "}
          <img
            src="https://coralclub.ru//upload/iblock/7b7/x6c6j3dyu69ud3j02yov2bc0sa21nm5d.webp"
            className="absolute inset-0 h-full w-full object-cover"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </SwiperSlide>
        <SwiperSlide className="overflow-hidden group relative duration-1000">
          {" "}
          <img
            src="https://coralclub.ru/upload/iblock/e85/ameu7xmokj1uukk6tku730wel589vyc5.webp"
            className="absolute inset-0 h-full w-full object-cover"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </SwiperSlide>
        <SwiperSlide className="overflow-hidden group relative duration-1000">
          {" "}
          <img
            src="https://coralclub.ru/upload/iblock/f88/db6jz3es5u618aa7io8loqk0ex87znvw.webp"
            className="absolute inset-0 h-full w-full object-cover"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
