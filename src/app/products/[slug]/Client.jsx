"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { useCartStore } from "@/lib/cartStore";

export default function ProductClient({ product }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tab, setTab] = useState("desc");
  const [flavor, setFlavor] = useState("ミルクティー（奶茶）");
  const [pkg, setPkg] = useState("8 份");

  const [showAdded, setShowAdded] = useState(false); // ✅ 顯示「已加入購物車」提示
  const router = useRouter();

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);

  // ✅ 提示 2.5 秒後自動消失
  useEffect(() => {
    if (!showAdded) return;
    const t = setTimeout(() => setShowAdded(false), 2500);
    return () => clearTimeout(t);
  }, [showAdded]);

  function handleBuyNow() {
    // 1) 先把商品丟進 Zustand 的 cartStore（給側邊購物車用）
    const optionVariant = `${flavor} / ${pkg}`;
    addItem({
      id: product.id,
      name: `${product.name}｜${product.subname || ""}`,
      price: product.price,
      image: product.images?.[0],
      options: { 口味: flavor, 規格: pkg },
      qty: 1,
      variant: optionVariant, // 方便之後在全站都用同一個欄位名稱
    });

    // 2) 同步寫入 sessionStorage 的 cart_items（給 /cart 頁面用）
    //    CartIntegratedPage 期待的 shape：{ id, title, variant, img, price, list, compareAt, qty }
    const cartItem = {
      id: product.id,
      title: `${product.name}｜${product.subname || ""}`,
      variant: optionVariant,
      img: product.images?.[0],
      price: product.price,
      // 這兩個看你 product 裡有沒有原價／比較價，沒有就先用同一個
      list: product.listPrice || product.price,
      compareAt: product.compareAtPrice || product.price,
      qty: 1,
    };

    try {
      let current = [];
      const raw = sessionStorage.getItem("cart_items");
      if (raw) {
        current = JSON.parse(raw) || [];
      }

      // 同商品 + 同規格就疊加數量
      const idx = current.findIndex(
        (it) => it.id === cartItem.id && it.variant === cartItem.variant
      );
      if (idx >= 0) {
        current[idx].qty += 1;
      } else {
        current.push(cartItem);
      }

      sessionStorage.setItem("cart_items", JSON.stringify(current));
    } catch (err) {
      console.error("寫入 cart_items 失敗：", err);
    }

    // 3) 開啟側邊購物車（你原來的行為）
    openCart();

    // 4) 顯示「已加入購物車」提示
    setShowAdded(true);
  }

  return (
    <main className="bg-[#faf9f8] py-20 text-[#2b2b2b]">
      <div className="w-[95%] mx-auto flex flex-col lg:flex-row gap-8 px-4 lg:px-16 py-3 md:py-16">
        {/* 左：主圖 + 縮圖 */}
        <div className="w-full lg:w-1/2">
          <div className="relative">
            <Swiper
              loop
              spaceBetween={10}
              navigation={{
                nextEl: ".image-swiper-button-next",
                prevEl: ".image-swiper-button-prev",
              }}
              thumbs={{
                swiper:
                  thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
              }}
              modules={[FreeMode, Navigation, Thumbs]}
              className=" aspect-square overflow-hidden rounded-xl bg-white"
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            >
              {(product.images || []).map((src, i) => (
                <SwiperSlide key={i}>
                  <Image
                    src={src}
                    width={1200}
                    height={1200}
                    alt={`product-${i}`}
                    className="object-cover w-full h-full"
                    priority={i === 0}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* 自訂箭頭 */}
            <button
              aria-label="Previous"
              className="image-swiper-button-prev group absolute top-1/2 left-4 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full text-gray-700 backdrop-blur bg-white/70 shadow hover:bg-black hover:text-white transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 48 48"
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
            <button
              aria-label="Next"
              className="image-swiper-button-next group absolute top-1/2 right-4 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full text-gray-700 backdrop-blur bg-white/70 shadow hover:bg-black hover:text-white transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 48 48"
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

          {/* 縮圖 */}
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            slidesPerView={6}
            freeMode
            watchSlidesProgress
            modules={[FreeMode, Navigation, Thumbs]}
            className="mt-3"
          >
            {(product.images || []).map((src, i) => (
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
            {product.subname ? (
              <span className="text-lg text-gray-600">{product.subname}</span>
            ) : null}
          </div>
          {product.desc ? (
            <p className="text-gray-500 mt-2">{product.desc}</p>
          ) : null}

          <div className="flex flex-wrap gap-2 mt-4">
            {["全面營養", "大豆蛋白", "100%植物性", "碳水化合物3.5%"].map(
              (t) => (
                <span
                  key={t}
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
              ¥{Number(product.price || 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">（含稅）初回限定價格</p>

            <div className="mt-5">
              <label className="block text-sm font-semibold">口味</label>
              <select
                className="mt-1 w-full border rounded-md p-2"
                value={flavor}
                onChange={(e) => setFlavor(e.target.value)}
              >
                <option>ミルクティー（奶茶）</option>
                <option>抹茶</option>
                <option>可可</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold">數量 / 規格</label>
              <div className="flex gap-2 mt-1">
                {["8 份", "28 份"].map((g) => (
                  <button
                    key={g}
                    className={`border rounded-full px-4 py-2 transition ${
                      pkg === g
                        ? "bg-black text-white"
                        : "hover:bg-black hover:text-white"
                    }`}
                    onClick={() => setPkg(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <ul className="mt-5 text-sm text-gray-600 list-disc list-inside leading-6">
              <li>首次15%OFF，之後每期10%OFF</li>
              <li>隨時可取消，無約束條件</li>
              <li>30日內免費退換</li>
              <li>附吸管、方便攜帶</li>
            </ul>

            <button
              onClick={handleBuyNow}
              className="mt-6 w-full py-3 bg-[#f58a9c] text-white rounded-full font-semibold hover:bg-[#f36b82] transition"
            >
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
                  植物營養素，適合每日補充。每包皆獨立封裝，方便攜帶與保存。
                </p>
              </div>
            )}
            {tab === "notice" && (
              <div className="text-gray-600 leading-7">
                <p>
                  若商品包裝破損或內容有異，請於收到後 7
                  日內聯繫客服。若因個人原因退換貨，商品需保持未拆封狀態。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ 已加入購物車提示 / Toast */}
      {showAdded && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-black text-white px-4 py-3 rounded-full shadow-lg text-sm flex items-center gap-3">
            <span className="inline-flex h-6 w-6 rounded-full bg-white/10 items-center justify-center text-xs">
              ✓
            </span>
            <span>已將此商品加入購物車</span>
            <button
              onClick={() => router.push("/cart")}
              className="underline underline-offset-4 text-xs"
            >
              查看購物車
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
