"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import dynamic from "next/dynamic";
import { ReactLenis } from "lenis/react";
import { Link } from "next-view-transitions";
import ShowCase from "../components/FeatureShowcase";

import Image from "next/image";
const Slider = dynamic(
  () => import("../components/SwiperCarousel/SwiperCardAbout"),
  { ssr: false },
);

gsap.registerPlugin(useGSAP, ScrollTrigger);

// === 設定斜角參數 ===
const SLANT_HEIGHT = 150;

const CardWrapper = ({ children, index, totalCards, className = "" }) => {
  const isFirst = index === 0;
  const isLast = index === totalCards - 1;
  const hasSlant = !isFirst && !isLast;

  let cardStyle = {};
  let innerPadding = "pt-20 md:pt-32";

  if (hasSlant) {
    cardStyle = {
      clipPath: `polygon(0 ${SLANT_HEIGHT}px, 100% 0, 100% 100%, 0 100%)`,
      marginTop: `-${SLANT_HEIGHT}px`,
    };
    innerPadding = "pt-[200px] md:pt-[220px]";
  } else if (isLast) {
    cardStyle = {
      clipPath: "none",
      marginTop: "0px",
    };
    innerPadding = "pt-20 md:pt-32";
  }

  return (
    <div
      className={`card sticky top-0 flex w-full  h-screen flex-col ${className}`}
      id={`card-${index + 1}`}
      style={cardStyle}
    >
      {/* ✨ 關鍵修正：在這裡加上 overflow-hidden，裁切掉超出卡片的裝飾元素，且不影響 sticky */}
      <div
        className={`card-inner relative overflow-hidden h-full w-full px-6 pb-20 md:px-12 ${innerPadding}`}
      >
        {children}
      </div>
    </div>
  );
};

export default function Home() {
  const container = useRef();
  const TOTAL_CARDS = 4;

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
      {/* ✨ 關鍵修正：這裡拿掉 overflow-x-hidden，讓 Sticky 復活 */}
      <div className="app relative w-full font-sans" ref={container}>
        {/* Hero Section */}
        <section className="hero relative aspect-[500/500] sm:aspect-[1024/576] lg:aspect-[1920/850] w-full p-0 z-0">
          <Slider ratio="16/9" autoplayDelay={4500} speed={1400} />
        </section>
        <ShowCase />

        {/* Main Products Section */}
        {/* 在這個區塊加上 overflow-hidden 確保文字與區塊不會在手機板橫向超出版面 */}
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

                <button className="group mt-5 relative inline-flex h-[calc(48px+8px)] items-center justify-center rounded-full bg-[#f58a9c] py-1 pl-6 pr-14 font-medium text-neutral-50">
                  <span className="z-10 pr-2">更多產品</span>
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
              </div>
            </div>

            {/* 右側產品區 */}
            <div className="product w-full lg:w-[70%] mt-10 lg:mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4">
                {/* Card 1 */}
                <div className="group p-4 lg:p-8">
                  <Link href="/products/gaba鎂鎂香蜂草">
                    <div className="relative aspect-[4/4] w-full overflow-hidden">
                      <Image
                        src="/images/GABA鎂鎂香蜂草.png"
                        alt="img"
                        placeholder="empty"
                        className="object-cover group-hover:scale-90 duration-200"
                        loading="lazy"
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
                          原價 $1620/盒
                        </span>
                        <span className="text-red-500 font-bold">
                          優惠價 NT$1050/盒
                        </span>
                      </div>
                    </div>
                    <b className="block mt-4 text-lg sm:text-xl tracking-widest">
                      GABA鎂鎂香蜂草
                    </b>
                    <div className="mt-2">
                      <b>科學調配 </b>
                      <p className="text-[14px] tracking-wider mt-1 leading-relaxed">
                        足量攝取 能量循環新配方
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="group p-4 lg:p-8">
                  <Link href="/products/肽晶芙蓉">
                    <div className="relative aspect-[4/4] w-full overflow-hidden">
                      <Image
                        src="/images/00912.png"
                        alt="img"
                        placeholder="empty"
                        className="object-cover group-hover:scale-90 duration-200"
                        loading="lazy"
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
                          原價 $2280/盒
                        </span>
                        <span className="text-red-500 font-bold">
                          優惠價 NT$1480/盒
                        </span>
                      </div>
                    </div>
                    <b className="block mt-4 text-lg sm:text-xl tracking-widest">
                      肽晶芙蓉
                    </b>
                    <div className="mt-2">
                      <b>科學調配 </b>
                      <p className="text-[14px] tracking-wider mt-1 leading-relaxed">
                        足量攝取 喚回芙蓉貴婦肌
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="group p-4 lg:p-8">
                  <Link href="/products/synbiotics">
                    <div className="relative aspect-[4/4] w-full overflow-hidden">
                      <Image
                        src="/images/維他菌-合生元.png"
                        alt="img"
                        placeholder="empty"
                        className="object-cover group-hover:scale-90 duration-200"
                        loading="lazy"
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
                          原價 $2280/盒
                        </span>
                        <span className="text-red-500 font-bold">
                          優惠價 NT$1380/盒
                        </span>
                      </div>
                    </div>
                    <b className="block mt-4 text-lg sm:text-xl tracking-widest">
                      維他菌-合生元
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

        {/* Cards Section */}
        <section className="cards relative z-10 w-full">
          {/* === CARD 1 === */}
          <CardWrapper
            index={0}
            totalCards={TOTAL_CARDS}
            className="bg-gradient-to-b from-[#233DCC] via-[#4492E3] to-[#E0BBE1] text-white"
          >
            <div className="absolute right-10 top-40 opacity-10 font-black text-9xl rotate-90 hidden md:block pointer-events-none">
              UFLOW
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full items-center">
              <div className="md:col-span-7 relative min-h-[350px] md:min-h-[500px] flex items-center justify-center w-full">
                <div className="absolute top-0 md:top-10 left-4 md:left-10 w-32 h-32 md:w-48 md:h-48 bg-white/30 rotate-[-12deg] shadow-lg rounded-lg overflow-hidden border-4 border-white">
                  <img
                    src="/images/難以入眠.jpg"
                    className="w-full h-full object-cover"
                    alt="Rusk"
                  />
                </div>
                <div className="absolute bottom-10 md:top-40 right-4 md:left-60 w-32 h-32 md:w-48 md:h-48 bg-white/30 rotate-[-12deg] shadow-lg rounded-lg overflow-hidden border-4 border-white">
                  <img
                    src="/images/難以入眠.jpg"
                    className="w-full h-full object-cover"
                    alt="Rusk"
                  />
                </div>
                <div className="relative md:absolute md:bottom-[-50%] left-[-45%] xl:left-[-10%] z-10 w-[400px] md:w-[750px]">
                  <img
                    src="/images/DSCF7664.png"
                    className="w-full h-auto object-contain"
                    alt="Rusk"
                  />
                </div>
                <div className="absolute top-20 right-0 text-3xl md:text-4xl font-bold text-white -rotate-6 hidden sm:block">
                  能量循環！
                </div>
                <div className="absolute -top-6 md:-top-12 w-[180px] md:w-[260px] md:left-[43%] z-20">
                  <img
                    src="/images/新配方.png"
                    className="w-full h-auto object-contain"
                    alt="Rusk"
                  />
                </div>
              </div>
              <div className="md:col-span-5 flex flex-col justify-center relative z-20 px-4 md:px-0 mt-8 md:mt-0">
                <div className="max-w-md mx-auto md:mx-0">
                  <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-[#f2f2f2] drop-shadow-sm">
                    GABA鎂鎂香蜂草
                  </h2>
                  <p className="font-normal text-lg md:text-xl mb-4 text-[#f2f2f2] leading-relaxed drop-shadow-sm">
                    科學調配 足量攝取 能量循環新配方
                    <br />
                    日間補充提振精神 +夜間補充助眠
                  </p>
                  <Link href="http://localhost:3000/products/gaba%e9%8e%82%e9%8e%82%e9%a6%99%e8%9c%82%e8%8d%89">
                    <button className="mt-6 border-2 border-[#f7f7f7] text-[#f5f5f5] px-6 py-2 rounded-full font-bold hover:bg-[#efefef] hover:text-[#4492E3] transition duration-300 shadow-md">
                      MORE
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </CardWrapper>

          {/* === CARD 2 === */}
          <CardWrapper
            index={1}
            totalCards={TOTAL_CARDS}
            className="bg-[#EAEAEA] text-gray-900 relative overflow-hidden"
          >
            {/*背景漸層 */}
            <div className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] bg-[#bfff00] rounded-full mix-blend-multiply filter blur-[150px] opacity-70 pointer-events-none"></div>
            <div className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] bg-[#00ffff] rounded-full mix-blend-multiply filter blur-[150px] opacity-50 pointer-events-none"></div>

            {/* ✨ 修改：調整圓形邊框樣式，使其更細緻，並調整到右下角，呼應線條引導的終點 */}
            <div className="absolute bottom-[35%] right-[10%] w-[40px] h-[40px] border-[0.5px] border-gray-900/40 rounded-full pointer-events-none hidden md:block"></div>

            {/* ✨ 關鍵修改：重寫 SVG 弧線路徑，使其更圓滑地從右上角彎曲並指向新的列表區域，模擬圖片的優雅線條感 */}
            <svg
              className="absolute top-0 right-0 w-[400px] h-full pointer-events-none stroke-gray-900/20 fill-none hidden md:block"
              strokeWidth="0.5"
            >
              <path d="M 400 0 C 300 150, 100 200, 15 350" />
            </svg>

            <div className="flex flex-col md:flex-row-reverse h-full items-center justify-between gap-12 mt-12 md:mt-0 relative z-10 p-10">
              <div className="flex-1 relative w-full flex justify-center">
                {/* 產品圖片區域 */}
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[500px] md:h-[500px] lg:w-[680px] lg:h-[680px]">
                  <div className="absolute inset-0 md:top-[-10%]">
                    <img
                      src="/images/DSCF7622.png"
                      className="w-full h-full object-contain opacity-90 drop-shadow-xl"
                      alt="Cookie"
                    />
                  </div>
                  {/* UFLOW 浮水印 */}
                  <div className="absolute -top-6 -left-4 md:-top-10 md:-left-10 text-4xl md:text-6xl font-black text-gray-900/10 -rotate-12">
                    UFLOW
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full max-w-xl z-10 px-4 md:px-0">
                <div className="md:pl-10 py-4 space-y-6 relative">
                  {/* ✨ 裝飾性線條：在文字區域上方添加圖片中的裝飾細線和特定字體細節 */}
                  <div className="absolute -top-6 -left-4 font-black text-gray-900/5 rotate-[-12deg] text-3xl hidden md:block">
                    e
                  </div>

                  {/* 小標題 (無襯線) */}
                  <h3 className="text-gray-600 font-bold tracking-widest text-sm md:text-base uppercase">
                    合生元 (Synbiotics)
                  </h3>

                  {/* ✨ 主標題：最關鍵的修改 */}
                  {/* 🚨 注意：這裡使用了 font-serif 作為 Didot Fallback，需要配置特定的襯線字體 */}
                  {/* 字號加大（text-5xl md:text-7xl），字重黑色（font-black）， leading-none，特定對齊感（tracking-tight），並添加底部細橫線 */}
                  <h2 className="text-5xl md:text-7xl font-serif font-black leading-none tracking-tight text-gray-900 pb-2 border-b border-gray-900">
                    維他菌合生元
                  </h2>

                  {/* 主要描述 (無襯線) */}
                  <p className="text-base md:text-lg leading-loose text-gray-700 font-medium">
                    科學調配 足量攝取 舒暢滿點
                    <br />
                    台灣專利功能菌種配方保衛健康 合生元 (Synbiotics)
                    將益生菌與益生元結合，提升益生菌存活
                    添加專利益萃質®維護細菌叢健康
                  </p>

                  {/* ✨ 關鍵修改：模擬圖片中的列表和細節 (無襯線) */}
                  {/* 使用無襯線字體，小字號，編號、連接線和文字 */}
                  <div className="flex items-center gap-10">
                    <div className="space-y-1 text-sm text-gray-600 font-medium">
                      <p>01-幫助消化</p>
                      <p>02-維持細菌叢健康</p>
                      <p>03-提升益生菌續航力</p>
                    </div>
                    {/* ✨ 在列表旁邊添加一個空心圓裝飾，呼應線條終點 */}
                    <div className="w-[30px] h-[30px] border-[1px] border-gray-900/40 rounded-full hidden md:block"></div>
                  </div>

                  {/* 按鈕 */}
                  <Link href="https://www.uflow.space/products/synbiotics">
                    <button className="mt-8 border border-gray-900 text-gray-900 px-8 py-2.5 rounded-full font-bold hover:bg-gray-900 hover:text-white transition duration-300">
                      MORE
                    </button>
                  </Link>
                </div>

                {/* ✨ 底部網址 */}
                <p className="absolute bottom-4 left-10 text-xs text-gray-500 font-mono hidden md:block">
                  www.uflow.space
                </p>
              </div>
            </div>
          </CardWrapper>

          {/* === CARD 3 === */}
          <CardWrapper
            index={2}
            totalCards={TOTAL_CARDS}
            className="bg-[#f49898] text-white"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full gap-8">
              <div className="w-full flex justify-center items-center relative min-h-[300px] md:min-h-full">
                <img
                  src="/images/粉紅.png"
                  className="w-3/4 max-w-[400px] md:max-w-full md:w-[80%] lg:w-[550px] object-contain"
                  alt="Biscotti"
                />
              </div>
              <div className="flex flex-col justify-center px-4 py-8 md:p-16">
                <div className="relative">
                  <span className="absolute -top-10 right-0 md:-top-20 md:-right-4 text-3xl md:text-5xl font-black rotate-12 text-white/40">
                    國際原廠，專利足量
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 border-b-4 border-white/30 pb-4 inline-block relative z-10">
                    肽晶芙蓉
                  </h2>
                  <h3 className="text-xl md:text-2xl mb-4 font-medium relative z-10">
                    重建 17 歲素顏元氣，醫美族的透亮保養
                  </h3>
                  <p className="text-sm md:text-base leading-7 md:leading-8 mb-8 text-white/90 relative z-10">
                    不用打光，也能自帶澎潤感！UFLOW
                    肽晶芙蓉專為對美極度要求的妳設計嚴選四大國際專利原料：美國微脂體穀胱甘肽提升
                    200% 吸收率，高效抗氧化 ；日本冰晶番茄抵禦傷害， 搭配維生素
                    C 與比利時美適矽(正矽酸復合物)
                    ，由內而外撐起神級美「彈、緊、嫩」。
                  </p>
                  <Link href="https://www.uflow.space/products/%e8%82%bd%e6%99%b6%e8%8a%99%e8%93%89">
                    <button className="mt-6 border-2 border-[#f7f7f7] text-[#f5f5f5] px-6 py-2 rounded-full font-bold hover:bg-[#efefef] hover:text-stone-800 transition">
                      MORE
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </CardWrapper>
        </section>
      </div>
    </ReactLenis>
  );
}
