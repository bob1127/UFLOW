"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import dynamic from "next/dynamic";
import { ReactLenis } from "lenis/react";
import { Link } from "next-view-transitions";
import { ArrowRight } from "lucide-react";
import ShowCase from "../components/FeatureShowcase";
import Image from "next/image";

const Slider = dynamic(
  () => import("../components/SwiperCarousel/SwiperCardAbout"),
  { ssr: false },
);

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SLANT_HEIGHT = 120;

const CardWrapper = ({ children, index, totalCards }) => {
  const isFirst = index === 0;
  const isLast = index === totalCards - 1;
  const hasSlant = !isFirst && !isLast;

  let cardStyle = {};
  let innerPadding = "pt-16 md:pt-24";

  if (hasSlant) {
    cardStyle = {
      clipPath: `polygon(0 ${SLANT_HEIGHT}px, 100% 0, 100% 100%, 0 100%)`,
      marginTop: `-${SLANT_HEIGHT}px`,
    };
    innerPadding = "pt-[140px] md:pt-[180px]";
  } else if (isLast) {
    cardStyle = { clipPath: "none", marginTop: "0px" };
    innerPadding = "pt-16 md:pt-24";
  }

  return (
    <div
      className="card sticky top-0 flex h-screen w-full flex-col"
      id={`card-${index + 1}`}
      style={cardStyle}
    >
      <div
        className={`card-inner group/card relative h-full w-full overflow-hidden ${innerPadding}`}
      >
        {children}
      </div>
    </div>
  );
};

const ProductScrollCard = ({
  sectionLabel,
  heading,
  subLabel,
  description,
  price,
  slug,
  bgImage,
}) => {
  const [labelMain, labelSub] = sectionLabel.includes(" ")
    ? sectionLabel.split(" ")
    : [sectionLabel, ""];

  return (
    <>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        {bgImage && (
          <img
            src={bgImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-black/70 transition-colors duration-700 group-hover/card:bg-black/60" />
      </div>

      {/* Content — CONTACT 風格三欄 */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 py-16 md:px-12 md:py-20 lg:px-20">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-end gap-10 md:grid-cols-12 md:gap-6 lg:gap-8">
          {/* 左：描邊大標 + 副標 + 說明 */}
          <div className="md:col-span-4 md:self-start md:pt-8 lg:pt-16">
            <div className="pointer-events-none select-none">
              <h2
                className="font-black uppercase leading-[0.9] tracking-tight text-transparent"
                style={{
                  fontSize: "clamp(3rem, 9vw, 6.5rem)",
                  WebkitTextStroke: "1.5px rgba(255,255,255,0.9)",
                  paintOrder: "stroke fill",
                }}
              >
                {labelMain}
              </h2>
              {labelSub && (
                <h2
                  className="-mt-1 font-black uppercase leading-[0.9] tracking-tight text-transparent md:-mt-2"
                  style={{
                    fontSize: "clamp(3rem, 9vw, 6.5rem)",
                    WebkitTextStroke: "1.5px rgba(255,255,255,0.9)",
                    paintOrder: "stroke fill",
                  }}
                >
                  {labelSub}
                </h2>
              )}
            </div>
            <p className="mt-5 text-sm font-bold text-white md:mt-6 md:text-base">
              {subLabel}
            </p>
            <p className="mt-4 max-w-sm text-xs leading-[1.9] text-white/75 md:text-sm">
              {description}
            </p>
            <p className="mt-5 text-base font-bold text-white md:mt-6 md:text-lg">
              優惠價 NT${price}
            </p>
          </div>

          {/* 中：箭頭 */}
          <div className="hidden md:col-span-1 md:flex md:items-end md:justify-center md:pb-[clamp(4rem,12vh,8rem)]">
            <Link
              href={`/products/${slug}`}
              className="group/arrow flex h-16 w-16 items-center justify-center text-white/80 transition-all duration-500 hover:text-white"
              aria-label="查看產品"
            >
              <ArrowRight
                size={40}
                strokeWidth={1.2}
                className="transition-transform duration-500 group-hover/arrow:translate-x-2"
              />
            </Link>
          </div>

          {/* 右：大標主文案 */}
          <div className="md:col-span-7 md:mt-16 lg:col-span-7 lg:mt-24">
            <h3 className="text-3xl font-black leading-[1.05] tracking-tight text-white transition-transform duration-500 group-hover/card:-translate-y-1 sm:text-2xl md:text-ˇxl lg:text-[ˇ.5rem] xl:text-[ˋrem]">
              {heading}
            </h3>
            <Link
              href={`/products/${slug}`}
              className="group/link mt-8 inline-flex items-center gap-3 border-b border-white/40 pb-2 text-sm font-bold tracking-widest text-white transition-colors hover:border-white md:mt-10 md:hidden"
            >
              了解更多
              <ArrowRight
                size={16}
                className="transition-transform group-hover/link:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

// 🌟 關鍵修改：從 props 接收 items (所有商品資料)
export default function HomeClient({ items = [] }) {
  const container = useRef();
  const TOTAL_CARDS = 3;

  // 🚀 智慧配對邏輯：自動從 items 找出對應商品，若找不到則給予預設值防呆
  const gabaData = items.find((p) => p.name.toUpperCase().includes("GABA"));
  const gaba = {
    name: gabaData?.name || "GABA鎂鎂香蜂草",
    slug: gabaData?.slug || "gaba鎂鎂香蜂草",
    price: gabaData?.price || "---",
    regular: gabaData?.regular_price || "---",
    image: gabaData?.images?.[0]?.src || "/images/GABA鎂鎂香蜂草.png",
    cardImage: "/images/70e8daf1-c621-49f1-a08f-54c933c6b82c.png",
    // 滿版情境圖維持不變
  };

  const synbioticsData = items.find(
    (p) =>
      p.name.includes("合生元") || p.name.toUpperCase().includes("SYNBIOTICS"),
  );
  const synbiotics = {
    name: synbioticsData?.name || "維他菌合生元",
    slug: synbioticsData?.slug || "synbiotics",
    price: synbioticsData?.price || "---",
    regular: synbioticsData?.regular_price || "---",
    image: synbioticsData?.images?.[0]?.src || "/images/維他菌-合生元.png",
    cardImage: "/images/6b538aec-f3e9-45c8-aeb4-3b85c814d251.png",
  };

  const peptidesData = items.find(
    (p) => p.name.includes("芙蓉") || p.name.includes("肽晶"),
  );
  const peptides = {
    name: peptidesData?.name || "肽晶芙蓉",
    slug: peptidesData?.slug || "肽晶芙蓉",
    price: peptidesData?.price || "---",
    regular: peptidesData?.regular_price || "---",
    image: peptidesData?.images?.[0]?.src || "/images/00912.png",
    cardImage: "/images/2894d77a-1a15-4b49-b982-8cc7a09e8029.png",
  };

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        endTrigger: ".outro",
        end: "top top",
        pin: true,
        pinSpacing: false,
      });
    },
    { scope: container },
  );

  return (
    <ReactLenis root>
      <div className="app relative w-full font-sans" ref={container}>
        <section className="hero relative aspect-[500/500] sm:aspect-[1024/576] lg:aspect-[1920/850] w-full p-0 z-0">
          <Slider ratio="16/9" autoplayDelay={4500} speed={1400} />
        </section>
        <ShowCase />

        {/* Main Products Section */}
        <section className="section-main-products overflow-hidden w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 pt-20">
          <div className="flex flex-col lg:flex-row">
            {/* 左側文字區 */}
            <div className="text w-full lg:w-[30%] p-2 sm:p-6 lg:p-10 flex flex-col justify-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                UFLOW
              </h1>
              <h2 className="text-xl text-stone-700 font-bold sm:text-2xl mt-4">
                UFLOW是一家以提供高品質健康產品為核心的品牌
              </h2>
              <div className="mt-4">
                <p className="tracking-wider leading-relaxed">
                  研發的精神在以科學方法應用於天然原料科技養護身心。。
                </p>
                <p className="tracking-wider leading-relaxed mt-2">
                  我們相信，健康是一種生活方式，也是一種簡單、自然且富有活力的人生。
                </p>
                <Link href="/products">
                  <button className="group mt-5 relative inline-flex h-[calc(48px+8px)] items-center justify-center rounded-full bg-[#f58a9c] py-1 pl-6 pr-14 font-medium text-neutral-50">
                    <span className="z-10 pr-2">更多產品</span>
                    <div className="absolute right-1 inline-flex h-12 w-12 items-center justify-end rounded-full bg-[#e6657b] transition-[width] group-hover:w-[calc(100%-8px)]">
                      <div className="mr-3.5 flex items-center justify-center">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
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

            {/* 右側產品區 */}
            <div className="product w-full lg:w-[70%] mt-10 lg:mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4">
                {/* 🚀 Card 1: GABA */}
                <div className="group p-4 lg:p-8">
                  <Link href={`/products/${gaba.slug}`}>
                    <div className="relative aspect-[4/4] w-full overflow-hidden">
                      <Image
                        src={gaba.image}
                        alt={gaba.name}
                        className="object-cover group-hover:scale-90 duration-200"
                        fill
                        sizes="(min-width: 1024px) 800px, 100vw"
                      />
                    </div>
                  </Link>
                  <div className="info mt-3 p-2">
                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-2">
                      <span className="rounded-[20px] border border-gray-500 text-gray-500 px-4 text-[13px] py-1 whitespace-nowrap">
                        熱銷產品
                      </span>
                      <div className="flex flex-col text-[14px]">
                        <span className="line-through text-gray-400">
                          原價 ${gaba.regular}/盒
                        </span>
                        <span className="text-red-500 font-bold">
                          優惠價 NT${gaba.price}/盒
                        </span>
                      </div>
                    </div>
                    <b className="block mt-4 text-lg sm:text-xl tracking-widest">
                      {gaba.name}
                    </b>
                    <div className="mt-2">
                      <b>科學調配 </b>
                      <p className="text-[14px] tracking-wider mt-1 leading-relaxed">
                        足量攝取 能量循環新配方
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🚀 Card 2: 肽晶芙蓉 */}
                <div className="group p-4 lg:p-8">
                  <Link href={`/products/${peptides.slug}`}>
                    <div className="relative aspect-[4/4] w-full overflow-hidden">
                      <Image
                        src={peptides.image}
                        alt={peptides.name}
                        className="object-cover group-hover:scale-90 duration-200"
                        fill
                        sizes="(min-width: 1024px) 800px, 100vw"
                      />
                    </div>
                  </Link>
                  <div className="info mt-3 p-2">
                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-2">
                      <span className="rounded-[20px] border border-gray-500 text-gray-500 px-4 text-[13px] py-1 whitespace-nowrap">
                        熱銷產品
                      </span>
                      <div className="flex flex-col text-[14px]">
                        <span className="line-through text-gray-400">
                          原價 ${peptides.regular}/盒
                        </span>
                        <span className="text-red-500 font-bold">
                          優惠價 NT${peptides.price}/盒
                        </span>
                      </div>
                    </div>
                    <b className="block mt-4 text-lg sm:text-xl tracking-widest">
                      {peptides.name}
                    </b>
                    <div className="mt-2">
                      <b>科學調配 </b>
                      <p className="text-[14px] tracking-wider mt-1 leading-relaxed">
                        足量攝取 喚回芙蓉貴婦肌
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🚀 Card 3: 維他菌 */}
                <div className="group p-4 lg:p-8">
                  <Link href={`/products/${synbiotics.slug}`}>
                    <div className="relative aspect-[4/4] w-full overflow-hidden">
                      <Image
                        src={synbiotics.image}
                        alt={synbiotics.name}
                        className="object-cover group-hover:scale-90 duration-200"
                        fill
                        sizes="(min-width: 1024px) 800px, 100vw"
                      />
                    </div>
                  </Link>
                  <div className="info mt-3 p-2">
                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-2">
                      <span className="rounded-[20px] border border-gray-500 text-gray-500 px-4 text-[13px] py-1 whitespace-nowrap">
                        熱銷產品
                      </span>
                      <div className="flex flex-col text-[14px]">
                        <span className="line-through text-gray-400">
                          原價 ${synbiotics.regular}/盒
                        </span>
                        <span className="text-red-500 font-bold">
                          優惠價 NT${synbiotics.price}/盒
                        </span>
                      </div>
                    </div>
                    <b className="block mt-4 text-lg sm:text-xl tracking-widest">
                      {synbiotics.name}
                    </b>
                    <div className="mt-2">
                      <b>台灣專利功能菌種配方保衛健康</b>
                      <p className="text-[14px] tracking-wider mt-1 leading-relaxed">
                        合生元 (Synbiotics) 將益生菌與益生元結合，提升益生菌存活
                        添加專利益萃質®維護細菌叢健康幫助消化
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section — Sansei-style diagonal scroll cards */}
        <section className="cards relative z-10 w-full">
          <CardWrapper index={0} totalCards={TOTAL_CARDS}>
            <ProductScrollCard
              heading={
                <>
                  科學調配 足量攝取
                  <br />
                  能量循環新配方
                </>
              }
              subLabel={gaba.name}
              sectionLabel="UFLOW 01"
              description={
                <>
                  {gaba.name} — 科學調配 足量攝取 能量循環新配方。
                  日間補充穩定精神 + 夜間補充助眠。
                </>
              }
              price={gaba.price}
              slug={gaba.slug}
              bgImage={gaba.cardImage}
            />
          </CardWrapper>

          <CardWrapper index={1} totalCards={TOTAL_CARDS}>
            <ProductScrollCard
              heading={
                <>
                  台灣專利功能菌種
                  <br />
                  配方保衛健康
                </>
              }
              subLabel="合生元 Synbiotics"
              sectionLabel="UFLOW 02"
              description={
                <>
                  {synbiotics.name} — 科學調配 足量攝取 舒暢滿點。合生元
                  (Synbiotics)
                  將益生菌與益生元結合，提升益生菌存活。添加專利益萃質®
                  維護細菌叢健康。01-幫助消化、02-維持細菌叢健康、03-提升益生菌續航力。
                </>
              }
              price={synbiotics.price}
              slug={synbiotics.slug}
              bgImage={synbiotics.cardImage}
            />
          </CardWrapper>

          <CardWrapper index={2} totalCards={TOTAL_CARDS}>
            <ProductScrollCard
              heading={
                <>
                  重建 17 歲素顏元氣
                  <br />
                  醫美族的透亮保養
                </>
              }
              subLabel={peptides.name}
              sectionLabel="UFLOW 03"
              description={
                <>
                  不用打光，也能自帶澎潤感！UFLOW
                  肽晶芙蓉專為對美極度要求的妳設計。嚴選四大國際專利原料：美國微脂體穀胱甘肽提升
                  200% 吸收率，高效抗氧化；日本冰晶番茄抵禦傷害，搭配維生素 C
                  與比利時美適矽（正矽酸復合物），由內而外撐起神級美。
                </>
              }
              price={peptides.price}
              slug={peptides.slug}
              bgImage={peptides.cardImage}
            />
          </CardWrapper>
        </section>
      </div>
    </ReactLenis>
  );
}
