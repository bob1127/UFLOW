"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import dynamic from "next/dynamic";
import { ReactLenis } from "lenis/react";

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
        <section className="hero relative h-screen w-full p-0 z-0">
          <Slider ratio="16/9" autoplayDelay={4500} speed={1400} />
          <div className="absolute top-0 left-0 w-full p-8 z-20 mix-blend-difference text-white">
            <h1 className="text-2xl font-bold tracking-widest">
              KIYOKA MORIMOTO
            </h1>
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
                    Big
                    <br />
                    Slant
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
                    BIS
                    <br />
                    COTTI
                  </h2>
                </div>
              </div>

              <div className="flex flex-col justify-center p-8 md:p-16">
                <div className="relative">
                  <span className="absolute -top-20 -right-4 text-5xl font-black rotate-12 text-white/40">
                    ザクザク
                  </span>
                  <h2 className="text-4xl md:text-5xl font-bold mb-8 border-b-4 border-white/30 pb-4 inline-block">
                    也是中間卡片
                  </h2>
                  <p className="leading-8 mb-8 text-white/90">
                    因為這也是中間的卡片，所以它保留了斜角效果。
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
