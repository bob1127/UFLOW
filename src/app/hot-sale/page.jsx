"use client";

import { useEffect, useRef } from "react";
import { useScroll } from "framer-motion";
import dynamic from "next/dynamic";
import Lenis from "@studio-freight/lenis";

// ✅ 動態載入，避免 Swiper 在 SSR 階段報錯或不渲染
const Slider = dynamic(
  () => import("../../components/EmblaCarouselTravel/index"),
  {
    ssr: false,
  }
);

export default function Home() {
  const container = useRef(null);
  useScroll({ target: container, offset: ["start start", "end end"] });

  // ✅ Lenis：加上清理，避免重複 raf
  useEffect(() => {
    const lenis = new Lenis();
    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // ✅ 實際 banners（可以換成你的資料）
  const banners = [
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
        "https://coralclub.ru/upload/iblock/7b7/x6c6j3dyu69ud3j02yov2bc0sa21nm5d.webp",
      href: "/KuankoshiProjectInner",
      title: "Project-03",
      subtitle: "View More",
      overlay: true,
    },
  ];

  return (
    <div ref={container}>
      <div className="pt-6">
        <Slider />
      </div>

      {/* 若你想改用固定高度 + 斷點高度，示範（取消上面 Slider、改用這段）
      <div className="w-[98%] mx-auto">
        <Slider
          height={420}
          heights={{ md: 520, lg: 620, xl: 680 }} // 依斷點覆蓋高度
          autoplayDelay={4500}
          speed={1200}
          loop
          centeredSlides
          slidesPerView={1}
          paginationColor="#fff"
          banners={banners}
        />
      </div>
      */}
    </div>
  );
}
