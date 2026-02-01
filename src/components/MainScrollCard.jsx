"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import dynamic from "next/dynamic";
import { ReactLenis } from "lenis/react";
import Link from "next/link";
import Image from "next/image";
const Slider = dynamic(
  () => import("../components/SwiperCarousel/SwiperCardAbout"),
  { ssr: false }
);

gsap.registerPlugin(useGSAP, ScrollTrigger);

// === 設定斜角參數 ===
// 這裡控制斜度的大小，數值越大越斜
const SLANT_HEIGHT = 150; // 原本是 80，現在改大到 150

const CardWrapper = ({ children, index, totalCards, className = "" }) => {
  // 判斷是否為第一張或最後一張
  const isFirst = index === 0;
  const isLast = index === totalCards - 1;

  // 只有「不是第一張 且 不是最後一張」的中間卡片，才要有斜角
  const hasSlant = !isFirst && !isLast;

  // 動態計算樣式
  let cardStyle = {};
  let innerPadding = "pt-20 md:pt-32"; // 預設 Padding

  if (hasSlant) {
    cardStyle = {
      // 左邊低(150px)，右邊高(0px) 的斜切
      clipPath: `polygon(0 ${SLANT_HEIGHT}px, 100% 0, 100% 100%, 0 100%)`,
      // 負邊距：讓這張卡片往上蓋，消除縫隙
      marginTop: `-${SLANT_HEIGHT}px`,
    };
    // 因為上面被切掉了 150px，內容要往下推更多，避免被切到
    // padding-top = 斜角高度 + 安全距離
    innerPadding = "pt-[200px] md:pt-[220px]";
  } else if (isLast) {
    // 最後一張卡片：沒有斜角，但為了視覺緊湊，可以選擇是否要稍微往上蓋一點點（這裡設為 0 代表完全平整接續）
    cardStyle = {
      clipPath: "none",
      marginTop: "0px",
    };
    innerPadding = "pt-20 md:pt-32";
  }

  return (
    <div
      className={`card sticky top-0 flex w-full min-h-screen flex-col ${className}`}
      id={`card-${index + 1}`}
      style={cardStyle}
    >
      <div
        className={`card-inner relative h-full w-full px-6 pb-20 md:px-12 ${innerPadding}`}
      >
        {children}
      </div>
    </div>
  );
};

export default function Home() {
  const container = useRef();

  // 定義卡片數量，傳入 Wrapper 用於判斷
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
    { scope: container }
  );

  return (
    <ReactLenis root>
      <div className="app relative w-full font-sans" ref={container}>
        {/* Hero Section */}
        <section className="hero   relative aspect-[500/500]  sm:aspect-[1024/576] lg:aspect-[1920/850] w-full p-0 z-0">
          <Slider ratio="16/9" autoplayDelay={4500} speed={1400} />
          {/* <div className="absolute top-0 left-0 w-full p-8 z-20 mix-blend-difference text-white">
            <h1 className="text-2xl font-bold tracking-widest">
              KIYOKA MORIMOTO
            </h1>
          </div> */}
        </section>
  <section className="section-main-products xl:w-[95%]  max-w-[1920px] sm:w-[90%] w-full mx-auto pt-20">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
                {/* Card 1 */}
                <div className="group p-6 lg:p-8">
                  <Link href="/products/14">
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
                      <br></br>
                      <div className="flex text-[15px] justify-center whitespace-nowrap">
                        原價 $1580/盒
                      </div>
                      <div className="flex text-[15px] justify-center whitespace-nowrap">
                        115新春會員價 NT$1230/盒
                      </div>
                    </div>

                    <br />
                    <b className="text-lg sm:text-xl tracking-widest">
                      GABA鎂鎂香蜂草
                    </b>
                    <div className="mt-3">
                      <b>科學調配 </b>
                      <p className="text-[14px] tracking-wider mt-1 leading-relaxed">
                        足量攝取 能量代謝新配方
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="group p-6 lg:p-8">
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
                      <br></br>
                      <div className="flex text-[15px] justify-center whitespace-nowrap">
                        原價 $1880/盒
                      </div>
                      <div className="flex text-[15px] justify-center whitespace-nowrap">
                        115新春會員價 NT$1380/盒
                      </div>
                    </div>

                    <br />
                    <b className="text-lg sm:text-xl tracking-widest">
                      肽晶芙蓉
                    </b>
                    <div className="mt-3">
                      <b>科學調配 </b>
                      <p className="text-[14px] tracking-wider mt-1 leading-relaxed">
                        足量攝取 喚回芙蓉貴婦肌
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="group p-6 lg:p-8">
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
                        原價 $1680/盒
                      </div>
                      <div className="flex text-[15px] justify-center whitespace-nowrap">
                        115新春會員價 NT$1300/盒
                      </div>
                    </div>

                    <br />
                    <b className="text-lg sm:text-xl tracking-widest">
                      維他菌-合生元
                    </b>
                    <div className="mt-3">
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
          {/* === CARD 1 (Index 0): 第一張，平頭 (無斜角) === */}
          <CardWrapper
            index={0}
            totalCards={TOTAL_CARDS}
            className="bg-[#2195e2] overflow-hidden text-[#4b301b]"
          >
            {/* 裝飾字 */}
            <div className="absolute right-10 top-40 opacity-10 font-black text-9xl rotate-90 hidden md:block pointer-events-none">
              UFLOW
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">
              <div className="md:col-span-7 relative min-h-[400px]">
                <div className="absolute top-10 left-10 w-48 h-48 bg-white/30 rotate-[-12deg] shadow-lg rounded-lg overflow-hidden border-4 border-white">
                  <img
                    src="/images/難以入眠.jpg"
                    className="w-full h-full object-cover"
                    alt="Rusk"
                  />
                </div>
                <div className="absolute top-40 left-60 w-48 h-48 bg-white/30 rotate-[-12deg] shadow-lg rounded-lg overflow-hidden border-4 border-white">
                  <img
                    src="/images/難以入眠.jpg"
                    className="w-full h-full object-cover"
                    alt="Rusk"
                  />
                </div>
                <div className="absolute top-8 left-48   z-10">
                  <img
                    src="/images/DSCF7664.png"
                    className="w-full h-full object-cover"
                    alt="Rusk"
                  />
                </div>
                <div className="absolute top-20 right-10 text-4xl font-bold text-white -rotate-6 md:block hidden">
                  能量代謝！{" "}
                </div>
                <div className="absolute top-[-50px] w-[260px]  left-[43%] text-4xl font-bold text-white -rotate-6 md:block hidden">
                  <img
                    src="/images/新配方.png"
                    className="w-full h-full object-cover"
                    alt="Rusk"
                  />
                </div>
              </div>

              <div className="md:col-span-5 flex flex-col justify-center relative z-20">
                <div className="   max-w-md mx-auto">
                  <h2 className="text-5xl font-black mb-6 tracking-tighter text-[#f2f2f2]">
                    GABA鎂鎂香蜂草
                  </h2>
                  <p className="font-normal  text-xl mb-4 text-[#f2f2f2] leading-relaxed">
                    科學調配 足量攝取 能 量代謝新方
                    <br />
                    日間補充提振精神 +夜間補充助眠 +壓力時刻可緩解焦慮。
                  </p>
                  <button className="mt-6 border-2 border-[#f7f7f7] text-[#f5f5f5] px-6 py-2 rounded-full font-bold hover:bg-[#eddf40] hover:text-white transition">
                    VIEW MORE
                  </button>
                </div>
              </div>
            </div>
          </CardWrapper>

          {/* === CARD 2 (Index 1): 中間卡片，有大斜角 === */}
          <CardWrapper
            index={1}
            totalCards={TOTAL_CARDS}
            className="bg-[#6e9051] text-white"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] border-2 border-white/10 rounded-full pointer-events-none"></div>

            <div className="flex flex-col md:flex-row-reverse h-full items-center justify-between gap-12">
              <div className="flex-1 relative w-full flex justify-center">
                <div className="relative w-80 h-80 md:w-[680px] md:h-[680px]">
                  <div className="absolute inset-0  top-[-10%] ">
                    <img
                      src="/images/DSCF7622.png"
                      className="w-full h-full object-cover opacity-90"
                      alt="Cookie"
                    />
                  </div>
                  <div className="absolute -top-10 -left-10 text-6xl font-black text-[#fbbf24] -rotate-12 drop-shadow-md">
                   UFLOW
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-xl">
                <div className="  pl-6 md:pl-10 py-4">
                  <h3 className="text-[#fbbf24] font-bold tracking-widest mb-2">
                    合生元 (Synbiotics)
                  </h3>
                  <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                    維他菌合生元
                  </h2>
                  <p className="text-lg leading-loose text-gray-100">
                    科學調配 足量攝取 舒暢滿點
                    <br />
                    台灣專利功能菌種配方保衛健康 合生元 (Synbiotics)
                    將益生菌與益生元結合，提升益生菌存活
                    添加專利益萃質®維護細菌叢健康幫助消化
                  </p>
                </div>
              </div>
            </div>
          </CardWrapper>

          {/* === CARD 3 (Index 2): 中間卡片，有大斜角 === */}
          <CardWrapper
            index={2}
            totalCards={TOTAL_CARDS}
            className="bg-[#f49898] text-white"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full">
              <div className=" w-[550px]">
                <img
                  src="/images/粉紅.png"
                  className="absolute  w-[550px]"
                  alt="Biscotti"
                />
                <div className="absolute bottom-10 left-10 z-20">
                  <h2 className="text-[80px] font-black leading-none opacity-50">
                    
                  </h2>
                </div>
              </div>

              <div className="flex flex-col justify-center p-8 md:p-16">
                <div className="relative">
                  <span className="absolute -top-20 -right-4 text-5xl font-black rotate-12 text-white/40">
                   國際原廠，專利足量

                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8 border-b-4 border-white/30 pb-4 inline-block">
                 肽晶芙蓉<br></br>
            

                  </h2>
                  <h3 className="text-2xl">     重建 17 歲素顏元氣，醫美級的透亮保養</h3>
                  <p className="leading-8 mb-8 text-white/90">
                 不用打光，肌膚也能自帶澎潤感！UFLOW 肽晶芙蓉專為對美極度要求的妳設計嚴選四大國際專利原料：美國微脂體穀胱甘肽提升 200% 吸收率，高效抗氧化 ；日本冰晶番茄抵禦光傷害，抑制黑色素 ；搭配 24 小時長效維生素 C 與比利時正矽酸 ，由內而外撐起肌膚的「彈、緊、嫩」。
                  </p>
                </div>
              </div>
            </div>
          </CardWrapper>
        </section>
      </div>
    </ReactLenis>
  );
}
