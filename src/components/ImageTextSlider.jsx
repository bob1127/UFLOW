"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ImageReveal from "./ImageReveal";

// ✅ Demo 資料（雙主圖）
const data = [
  {
    title: "肽晶芙蓉",
    subtitle: "營養",
    price: "KOREDAKE是能夠輕鬆攝取1餐所需的營養",
    description: "理想的營養平衡，支援容易偏頗的飲食生活。",
    detail:
      "打造健康的身體，營養均衡的飲食是必不可少的。 但是，在忙碌的每一天裡好好攝取營養是一件非常困難的事情。 既費力又費時。",
    mainImages: [
      "https://hfa-mqt-qoqix3fm.landinghub.site/.landinghub/https%3A%2F%2Fd2w53g1q050m78.cloudfront.net%2Fkoredakecojp%2Fuploads%2Fimages%2Fpages%2Fproducts%2Fcollections-shakepack.jpg",
      "https://hfa-mqt-qoqix3fm.landinghub.site/.landinghub/https%3A%2F%2Fd2w53g1q050m78.cloudfront.net%2Fkoredakecojp%2Fuploads%2Fimages%2Fpages%2Fproducts%2Fcollections-powder.jpg",
    ],
    subImages: [
      "https://d2w53g1q050m78.cloudfront.net/koredakecojp/uploads/images/bnr-line.png",
      "https://hfa-mqt-qoqix3fm.landinghub.site/.landinghub/https%3A%2F%2Fd2w53g1q050m78.cloudfront.net%2Fkoredakecojp%2Fuploads%2Fimages%2Fpages%2Fingredients%2Fingredients-selected_pc.jpg",
    ],
  },
  {
    title: "SHAKE PACK",
    subtitle: "講究的風味",
    price: "第一次15%OFF・第二次以後最多10%OFF",
    description:
      "「我，像我一樣。」以這個為概念，「不用搖杯」就能喝到美味的單獨包裝型蛋白質「奶昔包含有大量女性1餐所需的33種營養素的大豆植物性健康蛋白，無論何時何地都可以輕鬆飲用 ",
    detail: "「奶昔包」誕生了！",
    mainImages: [
      "https://hfa-mqt-qoqix3fm.landinghub.site/.landinghub/https%3A%2F%2Fd2w53g1q050m78.cloudfront.net%2Fkoredakecojp%2Fuploads%2Fimages%2Fpages%2Fproducts%2Fshakepack-4.jpg",
      "https://hfa-mqt-qoqix3fm.landinghub.site/.landinghub/https%3A%2F%2Fd2w53g1q050m78.cloudfront.net%2Fkoredakecojp%2Fuploads%2Fimages%2Fpages%2Fproducts%2Fshakepack-3.jpg",
    ],
    subImages: [
      "https://hfa-mqt-qoqix3fm.landinghub.site/.landinghub/https%3A%2F%2Fd2w53g1q050m78.cloudfront.net%2Fkoredakecojp%2Fuploads%2Fimages%2Fpages%2Fproducts%2Fshakepack-2.jpg",
      "https://d2w53g1q050m78.cloudfront.net/koredakecojp/uploads/images/pages/products/howtodrink.jpg",
    ],
  },
];

export default function ImageTextSlider({
  autoplay = true,
  interval = 5000, // 自動輪播間隔(ms)
  pauseOnHover = true,
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const isHoveringRef = useRef(false);

  const total = data.length;

  const go = useCallback(
    (dir = 1) => {
      setIndex((p) => {
        const next = (p + dir + total) % total;
        return next;
      });
    },
    [total]
  );

  const next = useCallback(() => {
    go(1);
    restartTimer(); // 手動點擊也重置計時
  }, [go]);

  const prev = useCallback(() => {
    go(-1);
    restartTimer();
  }, [go]);

  // 啟動 / 停止 / 重啟 計時器
  const startTimer = useCallback(() => {
    if (!autoplay || interval <= 0) return;
    clearTimer();
    timerRef.current = setInterval(() => {
      if (pauseOnHover && isHoveringRef.current) return; // 滑入暫停（可選）
      go(1);
    }, interval);
  }, [autoplay, interval, pauseOnHover, go]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const restartTimer = useCallback(() => {
    clearTimer();
    startTimer();
  }, [clearTimer, startTimer]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  // hover 暫停（可開關）
  const onMouseEnter = () => {
    if (!pauseOnHover) return;
    isHoveringRef.current = true;
  };
  const onMouseLeave = () => {
    if (!pauseOnHover) return;
    isHoveringRef.current = false;
  };

  const item = data[index];
  const [leftSrc, rightSrc] = item.mainImages;

  return (
    <div
      className="relative w-[95%] mx-auto lg:flex-row flex-col flex section-part gap-6"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 左側：兩張並排（每次切換都讓左右圖各自跑動畫） */}
      <div className=" w-full lg:w-[65%] grid py-3 grid-cols-2 gap-4">
        {/* 左圖 */}
        <div className="relative aspect-[3/3.5] overflow-hidden">
          <ImageReveal
            key={`slide-${index}-left`} // 以索引+位置作為 key，強制 remount
            src={leftSrc}
            alt={`${item.title}-left`}
            className="h-full"
            delay={0}
            duration={2.2}
            fromScale={1.28}
            toScale={1}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        {/* 右圖 */}
        <div className="relative aspect-[3/3.5] overflow-hidden">
          <ImageReveal
            key={`slide-${index}-right`}
            src={rightSrc}
            alt={`${item.title}-right`}
            className="h-full"
            delay={0.12}
            duration={2.2}
            fromScale={1.28}
            toScale={1}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </div>

      {/* 右側：文字 + 縮圖 + 導覽 */}
      <div className=" w-full lg:w-[35%] py-3 px-10 flex flex-col items-start justify-end relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="w-full"
          >
            <div className="title flex justify-between w-full">
              <div>
                <h3 className="font-bold text-[1.8rem]">{item.title}</h3>
                <p className="text-[.85rem] text-gray-600">{item.subtitle}</p>
              </div>
              <div className="text-[.8rem] text-gray-600">{item.price}</div>
            </div>

            <div className="content mt-8">
              <h4 className="font-bold text-[1.4rem]">{item.description}</h4>
              <p className="tracking-wider text-[.9rem] my-3 leading-loose">
                {item.detail}
              </p>
            </div>

            <div className="img-wrap flex flex-row">
              {item.subImages.filter(Boolean).map((img, i) => (
                <div key={i} className="w-1/2 px-1">
                  <Image
                    src={img}
                    alt={`sub-${i + 1}`}
                    width={400}
                    height={300}
                    className="w-full object-cover aspect-[4/3]"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 導覽按鈕 */}
        <div className="absolute top-0 right-0 flex gap-2">
          <button
            onClick={prev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
            aria-label="上一個"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
            aria-label="下一個"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
