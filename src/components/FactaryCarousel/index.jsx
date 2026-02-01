import React from "react";
import EmblaCarousel from "./EmblaCarousel";

// Carousel options remain the same
const OPTIONS = { dragFree: true, loop: true };

// UFLOW 產品輪播資料
const SLIDES = [
  // --- 1. GABA 鎂鎂香蜂草 ---
  {
    image: "/images/GABA鎂鎂香蜂草.png",
    title: "GABA 鎂鎂香蜂草",
    shortDescription: "舒緩放鬆，重拾夜間寧靜。",
    description:
      "結合韓國 GABA、義大利 SideMag® 鎂與法國香蜂草萃取。科學調配，幫助入睡，讓您重返 17 歲的元氣。",
    tags: ["睡眠支援", "放鬆", "鎂"],
    publishDate: "Hot Sale",
    region: "Global Patents",
  },
  // --- 2. 維他菌合生元 ---
  {
    image: "/images/維他菌-合生元.png",
    title: "次世代維他菌合生元",
    shortDescription: "4大益生菌 + 益生質 + 後生元，全方位保養。",
    description:
      "打造消化道健康生態圈。添加專利配方，維持各年齡層的順暢與保護力，每日一包，健康輕鬆補給。",
    tags: ["消化道健康", "益生菌", "合生元"],
    publishDate: "New Arrival",
    region: "Synbiotics",
  },
  // --- 3. 冰晶芙蓉 ---
  {
    image: "/images/00912.png",
    title: "肽晶芙蓉",
    shortDescription: "煥發光采，由內而外的透亮自信。",
    description:
      "專為美麗設計的植萃配方，滋補養顏，維持青春美麗。讓每一天都像盛開的芙蓉般耀眼迷人。",
    tags: ["養顏美容", "青春光采", "植萃"],
    publishDate: "Best Seller",
    region: "Beauty",
  },
 {
    image: "/images/GABA鎂鎂香蜂草.png",
    title: "GABA 鎂鎂香蜂草",
    shortDescription: "舒緩放鬆，重拾夜間寧靜。",
    description:
      "結合韓國 GABA、義大利 SideMag® 鎂與法國香蜂草萃取。科學調配，幫助入睡，讓您重返 17 歲的元氣。",
    tags: ["睡眠支援", "放鬆", "鎂"],
    publishDate: "Hot Sale",
    region: "Global Patents",
  },
  // --- 2. 維他菌合生元 ---
  {
    image: "/images/維他菌-合生元.png",
    title: "次世代維他菌合生元",
    shortDescription: "4大益生菌 + 益生質 + 後生元，全方位保養。",
    description:
      "打造消化道健康生態圈。添加專利配方，維持各年齡層的順暢與保護力，每日一包，健康輕鬆補給。",
    tags: ["消化道健康", "益生菌", "合生元"],
    publishDate: "New Arrival",
    region: "Synbiotics",
  },
  // --- 3. 冰晶芙蓉 ---
  {
    image: "/images/00912.png",
    title: "肽晶芙蓉",
    shortDescription: "煥發光采，由內而外的透亮自信。",
    description:
      "專為美麗設計的植萃配方，滋補養顏，維持青春美麗。讓每一天都像盛開的芙蓉般耀眼迷人。",
    tags: ["養顏美容", "青春光采", "植萃"],
    publishDate: "Best Seller",
    region: "Beauty",
  },
];

const App = () => (
  <>
    {/* ▼▼▼ 修改重點 ▼▼▼ 
       1. 加入 'py-20' (上下 padding) 確保陰影或放大效果不會被切到
       2. 加入 'overflow-hidden' 在最外層，避免左右捲軸出現
    */}
    <main className="w-full min-h-screen flex items-center justify-center py-20 overflow-hidden  ">
      <div className="w-full max-w-[1600px] mx-auto">
        <EmblaCarousel slides={SLIDES} options={OPTIONS} />
      </div>
    </main>
  </>
);

export default App;
