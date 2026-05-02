// app/products/[slug]/Client.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Pagination, Thumbs, FreeMode } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

import { useCartStore } from "@/lib/cartStore";

// ===================== 🌟 圖片 SEO 自動萃取工具 (強化版) =====================
const getAltTextFromUrl = (url: string, fallbackName: string) => {
  if (!url) return fallbackName;
  try {
    const filename = url.split("/").pop()?.split(".")[0] || "";
    const decoded = decodeURIComponent(filename).replace(/[-_]/g, " ");
    // 將檔名與備用商品名稱結合，創造更豐富的長尾關鍵字
    return decoded ? `${fallbackName} | ${decoded}` : fallbackName;
  } catch (e) {
    return fallbackName;
  }
};
// ====================================================================

// ===================== 型別宣告區 =====================
interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ProductProps {
  product: any; // WooCommerce 商品物件
  faqs?: FAQ[];
}
// =======================================================

function AccordionItem({
  title,
  children,
  isOpen,
  onClick,
}: AccordionItemProps) {
  return (
    <div className="border-t border-gray-200">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between py-4 text-left font-medium text-gray-900 transition hover:text-gray-600"
      >
        <span>{title}</span>
        <span className="ml-6 flex items-center">
          {isOpen ? (
            <span className="text-xl leading-none">-</span>
          ) : (
            <span className="text-xl leading-none">+</span>
          )}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[1200px] opacity-100 mb-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="text-sm text-gray-500 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

const FLAVOR_COLORS = [
  "bg-yellow-200",
  "bg-purple-200",
  "bg-green-200",
  "bg-blue-200",
  "bg-red-200",
  "bg-orange-200",
];

export default function ProductClient({ product, faqs = [] }: ProductProps) {
  const router = useRouter();

  const addItem = useCartStore((s: any) => s.addItem);
  const openCart = useCartStore((s: any) => s.open);

  const safeProduct = product || {};

  const [flavor, setFlavor] = useState<string>("");
  const [pkg, setPkg] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [showAdded, setShowAdded] = useState<boolean>(false);
  const [tab, setTab] = useState<string>("desc");

  const [displayPrice, setDisplayPrice] = useState<number>(
    Number(safeProduct.price || 0),
  );
  const [displayRegularPrice, setDisplayRegularPrice] = useState<number>(
    Number(safeProduct.regularPrice || safeProduct.price || 0),
  );

  const [openAccordion, setOpenAccordion] = useState<string>("desc");
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [initialSlide, setInitialSlide] = useState<number>(0);

  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  // 🌟 綁定 WordPress 文章區塊的 Ref
  const contentRef = useRef<HTMLElement>(null);

  const flavorOptions = useMemo(() => {
    if (!safeProduct.attributes) return [];
    const attr = safeProduct.attributes.find((a: any) =>
      ["口味", "Flavor", "Flavors"].includes(a.name),
    );
    return attr?.options || [];
  }, [safeProduct]);

  const pkgOptions = useMemo(() => {
    if (!safeProduct.attributes) return [];
    const attr = safeProduct.attributes.find((a: any) =>
      ["優惠方案", "規格", "Size", "Package"].includes(a.name),
    );
    return attr?.options || [];
  }, [safeProduct]);

  useEffect(() => {
    if (flavorOptions.length > 0 && !flavor) {
      setFlavor(flavorOptions[0]);
    }
    if (!pkg) {
      setPkg(pkgOptions.length > 0 ? pkgOptions[0] : "1盒 (單件組)");
    }
  }, [flavorOptions, pkgOptions, flavor, pkg]);

  useEffect(() => {
    setDisplayPrice(Number(safeProduct.price || 0));
    setDisplayRegularPrice(
      Number(safeProduct.regularPrice || safeProduct.price || 0),
    );
  }, [safeProduct]);

  const currentDiscount =
    displayRegularPrice > displayPrice
      ? Math.round((1 - displayPrice / displayRegularPrice) * 100)
      : 0;

  const canBuy = (flavorOptions.length === 0 || flavor) && pkg !== "";

  useEffect(() => {
    if (!showAdded) return;
    const t = setTimeout(() => setShowAdded(false), 2500);
    return () => clearTimeout(t);
  }, [showAdded]);

  // ===================== 🌟 終極攔截：處理 WordPress 圖片 =====================
  useEffect(() => {
    // 給予 150ms 延遲，確保 React dangerouslySetInnerHTML 完全將 DOM 掛載完畢
    const timer = setTimeout(() => {
      if (tab === "desc" && contentRef.current) {
        const images = contentRef.current.querySelectorAll("img");

        images.forEach((img, index) => {
          // 取得原本的 alt，有時候 WordPress 給的是純粹的 alt="" (沒有內容)
          const currentAlt = img.getAttribute("alt");

          // 只要 alt 是空的或 null，我們就強制複寫！
          if (!currentAlt || currentAlt.trim() === "") {
            const autoAlt = getAltTextFromUrl(
              img.src,
              `${safeProduct.name || "商品"} - 功效與詳細說明圖 ${index + 1}`,
            );

            // 雙管齊下：同時設定 Attribute 與 DOM Property，確保爬蟲絕對抓得到
            img.setAttribute("alt", autoAlt);
            img.alt = autoAlt;
          }

          // 效能優化：強制加上原生 Lazy Loading
          if (!img.getAttribute("loading")) {
            img.setAttribute("loading", "lazy");
            img.loading = "lazy";
          }

          // 防破版機制
          img.style.maxWidth = "100%";
          img.style.height = "auto";
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [tab, safeProduct.name, safeProduct.description, safeProduct.acf]);
  // ===========================================================================

  function handleBuyNow() {
    const optionVariant = [flavor, pkg].filter(Boolean).join(" / ");
    const cartItem = {
      id: safeProduct.id,
      wcProductId: safeProduct.id,
      name: `${safeProduct.name}｜${safeProduct.subname || ""}`,
      price: displayPrice,
      image: safeProduct.images?.[0],
      options: { 口味: flavor, 規格: pkg },
      qty: qty,
      variant: optionVariant,
    };
    addItem(cartItem);
    openCart();
    setShowAdded(true);
  }

  const openImage = (index: number) => {
    setInitialSlide(index);
    setLightboxOpen(true);
  };

  const images: string[] = safeProduct.images || [];

  if (!safeProduct.name) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-slate-50">
        商品資料載入中...
      </div>
    );
  }

  return (
    <main className="bg-white pt-10 pb-20 text-[#2b2b2b] mt-[60px] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
          {/* 左側：商品大圖與小圖輪播 */}
          <div className="w-full lg:w-[40%] select-none sm:p-6 p-3 lg:p-10 lg:sticky lg:top-24 lg:self-start h-fit">
            <Swiper
              spaceBetween={10}
              navigation={true}
              thumbs={{
                swiper:
                  thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
              }}
              modules={[FreeMode, Navigation, Thumbs]}
              className="w-full mb-4 group main-image-swiper"
            >
              {images.map((src: string, i: number) => (
                <SwiperSlide key={i}>
                  <div
                    className="relative w-full aspect-[3/4] bg-gray-50 cursor-zoom-in overflow-hidden"
                    onClick={() => openImage(i)}
                  >
                    <Image
                      src={src}
                      alt={getAltTextFromUrl(
                        src,
                        `${safeProduct.name} - 官方正品商品圖 ${i + 1}`,
                      )}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={85}
                      priority={i === 0}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition backdrop-blur-sm z-10 pointer-events-none">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m21 21-4.3-4.3" />
                        <path d="M11 11h0" />
                        <circle cx="11" cy="11" r="8" />
                      </svg>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={12}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              className="w-full thumbs-slider px-1"
              breakpoints={{
                480: { slidesPerView: 5 },
                768: { slidesPerView: 6 },
                1024: { slidesPerView: 5 },
                1280: { slidesPerView: 6 },
              }}
            >
              {images.map((src: string, i: number) => (
                <SwiperSlide
                  key={i}
                  className="cursor-pointer rounded-lg overflow-hidden border-2 border-transparent transition-all opacity-50 hover:opacity-100 [&.swiper-slide-thumb-active]:opacity-100 [&.swiper-slide-thumb-active]:border-[#f56060]"
                >
                  <div className="relative w-full aspect-square bg-gray-50">
                    <Image
                      src={src}
                      alt={`${getAltTextFromUrl(src, safeProduct.name)} 預覽縮圖`}
                      fill
                      sizes="(max-width: 1024px) 20vw, 10vw"
                      quality={60}
                      loading="lazy"
                      className="object-cover object-center"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* 右側：商品資訊 & 購買區 */}
          <div className="w-full lg:w-2/5 flex flex-col p-4 sm:p-8 lg:sticky lg:top-24 lg:self-start h-fit">
            {/* 🌟 SEO 標題優化：視覺可見的主標題 */}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              {safeProduct.name}
            </h1>

            {/* 🌟 SEO 標題優化：隱藏的 H2，用來塞滿相關的長尾關鍵字，且不會破壞畫面設計 */}
            <h2 className="sr-only">
              {safeProduct.name} - UFLOW
              專業科學實證保健食品、天然植萃配方推薦、健康維持、日常調理
            </h2>

            <p className="text-gray-500 text-lg mb-4">{safeProduct.subname}</p>

            <div className="flex items-end gap-3 mb-6">
              <div className="text-3xl font-bold text-gray-900 leading-none">
                NT$ {displayPrice.toLocaleString()}
              </div>
              {currentDiscount > 0 && (
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-lg line-through text-gray-400 font-medium">
                    NT$ {displayRegularPrice.toLocaleString()}
                  </span>
                  <span className="bg-rose-100 text-rose-600 text-xs px-2 py-1 rounded-md font-bold tracking-wider">
                    {currentDiscount}% OFF
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 bg-gray-50 w-fit px-3 py-1.5 rounded-md">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              全館滿 NT$ 2,000 免運費
            </div>

            {/* 規格選擇 */}
            <div className="mb-8 rounded-xl border border-rose-100 bg-rose-500 p-4">
              <div className="mb-3 flex items-center justify-between border-b border-rose-100 pb-2">
                <span className="text-sm font-bold text-slate-50">
                  商品規格
                </span>
                <span className="text-xs font-medium bg-rose-100 text-rose-500 px-2 py-0.5 rounded-full">
                  期間限定折扣
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="relative flex items-center justify-between p-3 rounded-lg border bg-white border-rose-500 shadow-md ring-1 ring-rose-500 z-10 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-rose-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {pkg}
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      {currentDiscount > 0 && (
                        <span className="bg-rose-50 text-rose-600 text-[10px] px-1.5 py-0.5 rounded font-bold">
                          {currentDiscount}% OFF
                        </span>
                      )}
                      <span className="text-sm font-bold text-gray-900">
                        NT$ {displayPrice.toLocaleString()}
                      </span>
                    </div>
                    {currentDiscount > 0 && (
                      <span className="text-[11px] line-through text-gray-400 mt-0.5">
                        NT$ {displayRegularPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 口味選擇 */}
            {flavorOptions.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    選擇口味
                  </label>
                  <span className="text-xs text-gray-500">{flavor}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {flavorOptions.map((opt: string, idx: number) => (
                    <button
                      key={opt}
                      onClick={() => setFlavor(opt)}
                      title={opt}
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        flavor === opt
                          ? "ring-2 ring-offset-2 ring-black scale-110"
                          : "hover:scale-105 ring-1 ring-transparent hover:ring-gray-300"
                      } ${FLAVOR_COLORS[idx % FLAVOR_COLORS.length]}`}
                    >
                      <span className="sr-only">{opt}</span>
                      <span className="text-[10px] font-bold text-gray-700/50">
                        {opt.charAt(0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 數量與購買按鈕 */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-full px-4 py-3 h-[52px]">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="text-gray-500 hover:text-black disabled:opacity-30"
                  disabled={qty <= 1}
                >
                  <svg
                    width="16"
                    height="2"
                    viewBox="0 0 16 2"
                    fill="currentColor"
                  >
                    <rect width="16" height="2" rx="1" />
                  </svg>
                </button>
                <span className="w-10 text-center font-semibold text-lg">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="text-gray-500 hover:text-black"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M7 7V1H9V7H15V9H9V15H7V9H1V7H7Z" />
                  </svg>
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={!canBuy}
                className={`flex-1 h-[52px] rounded-full text-white font-bold text-lg shadow-lg shadow-purple-200 transition-all active:scale-95 ${
                  !canBuy
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#f56060] to-[#fc2a2a] hover:brightness-110"
                }`}
              >
                {pkg
                  ? `以 NT$ ${(displayPrice * qty).toLocaleString()} 購買`
                  : "請選擇優惠方案"}
              </button>
            </div>

            {/* 折疊資訊區 (Accordion) */}
            <div className="border-b border-gray-200 mt-4">
              <AccordionItem
                title="商品簡介"
                isOpen={openAccordion === "desc"}
                onClick={() =>
                  setOpenAccordion(openAccordion === "desc" ? "" : "desc")
                }
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: safeProduct.shortDescription,
                  }}
                />
              </AccordionItem>

              {faqs && faqs.length > 0 && (
                <AccordionItem
                  title="常見問題 (FAQ)"
                  isOpen={openAccordion === "faq"}
                  onClick={() =>
                    setOpenAccordion(openAccordion === "faq" ? "" : "faq")
                  }
                >
                  <div className="space-y-4">
                    {faqs.map((faq: FAQ, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-bold text-gray-900 mb-1 flex gap-2 items-start">
                          <span className="text-rose-500">Q:</span>
                          {faq.question}
                        </p>
                        <p className="text-gray-600 flex gap-2 items-start">
                          <span className="text-emerald-600 font-bold">A:</span>
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              )}

              <AccordionItem
                title="運送與退換貨"
                isOpen={openAccordion === "shipping"}
                onClick={() =>
                  setOpenAccordion(
                    openAccordion === "shipping" ? "" : "shipping",
                  )
                }
              >
                全館滿 NT$ 2,000 免運費。若商品包裝破損或內容有異，請於收到後 7
                日內聯繫客服。
              </AccordionItem>
              <AccordionItem
                title="用戶評價"
                isOpen={openAccordion === "reviews"}
                onClick={() =>
                  setOpenAccordion(openAccordion === "reviews" ? "" : "reviews")
                }
              >
                目前尚無文字評價，但有 114 位用戶給予了 5 星好評。
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>

      {/* 下方詳細說明區 */}
      <div className="w-full bg-white mt-16 pt-10 pb-20 border-t border-gray-200">
        <div className="w-[100%] mx-auto px-4 lg:px-16">
          <div className="flex gap-8 border-b border-gray-200 mb-8 justify-center">
            <button
              className={`pb-4 text-lg font-medium transition border-b-2 px-2 ${tab === "desc" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"}`}
              onClick={() => setTab("desc")}
            >
              商品詳細說明
            </button>
            <button
              className={`pb-4 text-lg font-medium transition border-b-2 px-2 ${tab === "notice" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"}`}
              onClick={() => setTab("notice")}
            >
              購買須知
            </button>
          </div>

          <div className="max-w-4xl w-full mx-auto">
            {tab === "desc" && (
              <article
                ref={contentRef} // 🌟 3. 將 Ref 綁定到這裡，確保 useEffect 能抓到內部的 HTML！
                className="prose prose-lg prose-stone max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-headings:mt-12 prose-headings:mb-6 prose-p:leading-relaxed prose-p:text-slate-600 prose-p:mb-6 prose-img:shadow-md prose-img:mx-auto prose-img:my-10 prose-video:aspect-video prose-video:w-full prose-video:my-10 prose-a:text-rose-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-rose-500 prose-li:text-slate-600"
                dangerouslySetInnerHTML={{
                  __html:
                    safeProduct.acf?.detailed_content ||
                    safeProduct.description ||
                    "<p class='text-center text-gray-400'>目前尚無詳細商品說明。</p>",
                }}
              />
            )}

            {tab === "notice" && (
              <div className="text-gray-600 leading-7 text-center max-w-2xl mx-auto py-10">
                <p>
                  全館滿 NT$ 2,000 免運費。若商品包裝破損或內容有異，請於收到後
                  7 日內聯繫客服。若因個人原因退換貨，商品需保持未拆封狀態。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 全螢幕 Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[999999999999999999] bg-black/80 flex items-center justify-center animate-fade-in">
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            className="fixed top-6 right-6 z-[1001] text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="w-full h-full max-w-6xl px-4 py-10">
            <Swiper
              initialSlide={initialSlide}
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="w-full h-full lightbox-swiper"
              spaceBetween={30}
            >
              {images.map((src: string, i: number) => (
                <SwiperSlide
                  key={i}
                  className="flex items-center justify-center"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={src}
                      alt={`放大檢視 - ${getAltTextFromUrl(src, safeProduct.name)}`}
                      width={1200}
                      height={1200}
                      quality={90}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      {/* 成功加入購物車提示 */}
      {showAdded && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div className="bg-[#2b2b2b] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-4">
            <span className="bg-green-500 rounded-full p-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="4"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <span className="font-medium">已加入購物車</span>
            <button
              onClick={() => router.push("/cart")}
              className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition"
            >
              結帳
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .main-image-swiper .swiper-button-next,
        .main-image-swiper .swiper-button-prev {
          color: #333;
          background: rgba(255, 255, 255, 0.8);
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
        .main-image-swiper .swiper-button-next::after,
        .main-image-swiper .swiper-button-prev::after {
          font-size: 16px;
          font-weight: bold;
        }
        .main-image-swiper .swiper-button-next:hover,
        .main-image-swiper .swiper-button-prev:hover {
          background: rgba(255, 255, 255, 1);
        }
        .lightbox-swiper .swiper-button-next,
        .lightbox-swiper .swiper-button-prev {
          color: white;
          width: 3rem;
          height: 3rem;
        }
        .lightbox-swiper .swiper-button-next::after,
        .lightbox-swiper .swiper-button-prev::after {
          font-size: 2rem;
        }
        .lightbox-swiper .swiper-pagination-bullet {
          background: white;
          opacity: 0.5;
          width: 10px;
          height: 10px;
        }
        .lightbox-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: white;
        }
      `}</style>
    </main>
  );
}
