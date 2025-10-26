"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

export default function ProductPage() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tab, setTab] = useState("desc");
  const product = {
    name: "SHAKE PACK",
    subname: "產品名稱",
    price: 4210,
    desc: "健康蛋白質 15g / 50次分次包裝",
    images: [
      "https://hfa-mqt-qoqix3fm.landinghub.site/.landinghub/https%3A%2F%2Fd2w53g1q050m78.cloudfront.net%2Fkoredakecojp%2Fuploads%2Fimages%2Fpages%2Fproducts%2Fshakepack-3.jpg",
      "https://hfa-mqt-qoqix3fm.landinghub.site/.landinghub/https%3A%2F%2Fd2w53g1q050m78.cloudfront.net%2Fkoredakecojp%2Fuploads%2Fimages%2Fpages%2Fproducts%2Fshakepack-2.jpg",
      "https://hfa-mqt-qoqix3fm.landinghub.site/.landinghub/https%3A%2F%2Fd2w53g1q050m78.cloudfront.net%2Fkoredakecojp%2Fuploads%2Fimages%2Fpages%2Fproducts%2Fshakepack-4.jpg",
      "https://hfa-mqt-qoqix3fm.landinghub.site/.landinghub/https%3A%2F%2Fd2w53g1q050m78.cloudfront.net%2Fkoredakecojp%2Fuploads%2Fimages%2Fpages%2Fproducts%2Fshakepack-5.jpg",
      "https://ec-force.s3.amazonaws.com/koredakecojp/uploads/images/pages/products/shakepack_8-milktea.jpg?20250401",
    ],
  };

  return (
    <>
      <main className=" bg-[#faf9f8] text-[#2b2b2b]">
        {/* 左：主圖 + 縮圖 */}
        <div className="w-[95%] mx-auto flex flex-col lg:flex-row gap-8 px-4 lg:px-16  py-16">
          <div className="w-full lg:w-1/2">
            {/* 【新增】相對定位容器，用於放置 Swiper 和自訂箭頭 */}
            <div className="relative">
              <Swiper
                loop
                spaceBetween={10}
                // 【修改】將 navigation 指向自訂按鈕的 class
                navigation={{
                  nextEl: ".image-swiper-button-next",
                  prevEl: ".image-swiper-button-prev",
                }}
                thumbs={{
                  swiper:
                    thumbsSwiper && !thumbsSwiper.destroyed
                      ? thumbsSwiper
                      : null,
                }}
                modules={[FreeMode, Navigation, Thumbs]}
                className="h-[700px] overflow-hidden"
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              >
                {product.images.map((src, i) => (
                  <SwiperSlide key={i}>
                    <Image
                      src={src}
                      width={800}
                      height={800}
                      alt={`product-${i}`}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/800";
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* 【新增】左箭頭按鈕 */}
              <button
                aria-label="Previous"
                className="image-swiper-button-prev group absolute top-1/2 left-4 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full text-gray-700 transition-all duration-300 ease-in-out hover:bg-black hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 48 48"
                  className="transform transition-transform duration-300 ease-in-out group-hover:scale-110"
                >
                  <circle
                    cx="24"
                    cy="24"
                    r="22"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M30 24H18M23 18L18 24L23 30"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* 【新增】右箭頭按鈕 */}
              <button
                aria-label="Next"
                className="image-swiper-button-next group absolute top-1/2 right-4 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full text-gray-700 transition-all duration-300 ease-in-out hover:bg-black hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 48 48"
                  className="transform transition-transform duration-300 ease-in-out group-hover:scale-110"
                >
                  <circle
                    cx="24"
                    cy="24"
                    r="22"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M18 24H30M25 18L30 24L25 30"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Thumbs Swiper */}
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={8}
              slidesPerView={6}
              freeMode
              watchSlidesProgress
              modules={[FreeMode, Navigation, Thumbs]}
              className="mt-3"
            >
              {product.images.map((src, i) => (
                <SwiperSlide key={i}>
                  <Image
                    src={src}
                    width={120}
                    height={120}
                    alt={`thumb-${i}`}
                    className={`object-cover rounded-lg cursor-pointer border hover:border-black transition ${
                      i === activeIndex ? "border-black" : "border-transparent"
                    }`}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* 右：商品資訊 */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <span className="text-lg text-gray-600">{product.subname}</span>
            </div>
            <p className="text-gray-500 mt-2">{product.desc}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              {["全面營養", "大豆蛋白", "100%植物性", "碳水化合物3.5%"].map(
                (t, i) => (
                  <span
                    key={i}
                    className="border bg-white px-3 py-1 rounded-full text-sm"
                  >
                    {t}
                  </span>
                )
              )}
            </div>

            <div className="mt-8 border border-gray-200 bg-white rounded-xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">定期購入</h2>
                <span className="text-pink-600 text-sm font-bold">15% OFF</span>
              </div>

              <div className="text-3xl font-bold mt-2">
                ¥{product.price.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500">（含稅）初回限定價格</p>

              <div className="mt-5">
                <label className="block text-sm font-semibold">口味</label>
                <select className="mt-1 w-full border rounded-md p-2">
                  <option>ミルクティー（奶茶）</option>
                  <option>抹茶</option>
                  <option>可可</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold">數量</label>
                <div className="flex gap-2 mt-1">
                  <button className="border rounded-full px-4 py-2 hover:bg-black hover:text-white">
                    8 份
                  </button>
                  <button className="border rounded-full px-4 py-2 hover:bg-black hover:text-white">
                    28 份
                  </button>
                </div>
              </div>

              <ul className="mt-5 text-sm text-gray-600 list-disc list-inside leading-6">
                <li>首次15%OFF，之後每期10%OFF</li>
                <li>隨時可取消，無約束條件</li>
                <li>30日內免費退換</li>
                <li>附吸管、方便攜帶</li>
              </ul>

              <button className="mt-6 w-full py-3 bg-[#f58a9c] text-white rounded-full font-semibold hover:bg-[#f36b82] transition">
                立即購買
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-10 border-t pt-6">
              <div className="flex gap-6 border-b mb-4">
                <button
                  className={`pb-2 border-b-2 transition ${
                    tab === "desc"
                      ? "border-black font-bold"
                      : "border-transparent text-gray-500"
                  }`}
                  onClick={() => setTab("desc")}
                >
                  商品說明
                </button>
                <button
                  className={`pb-2 border-b-2 transition ${
                    tab === "notice"
                      ? "border-black font-bold"
                      : "border-transparent text-gray-500"
                  }`}
                  onClick={() => setTab("notice")}
                >
                  購買須知
                </button>
              </div>

              {tab === "desc" && (
                <div className="text-gray-600 leading-7">
                  <p>
                    本商品為植物蛋白健康飲品，內含 15g 大豆蛋白與 100%
                    植物營養素，適合每日補充。 每包皆獨立封裝，方便攜帶與保存。
                  </p>
                </div>
              )}

              {tab === "notice" && (
                <div className="text-gray-600 leading-7">
                  <p>
                    若商品包裝破損或內容有異，請於收到後 7 日內聯繫客服。
                    若因個人原因退換貨，商品需保持未拆封狀態。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="product-description max-w-[1920px] xl:w-[80%] lg:w-[85%] w-[95%] mx-auto">
          <div className="flex">
            <div className="w-1/2 flex justify-center items-center">
              <div className="text-3xl max-w-[450px]">
                隆重介紹“Shake Pack”， 無需搖晃器即可享用的美味蛋白質飲料！
              </div>
            </div>
            <div className="w-1/2">
              <img
                src="https://hfa-mqt-qoqix3fm.landinghub.site/.landinghub/https%3A%2F%2Fd2w53g1q050m78.cloudfront.net%2Fkoredakecojp%2Fuploads%2Fimages%2Fpages%2Fsets%2Fimage03.jpg"
                className="w-full"
                alt=""
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
