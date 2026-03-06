"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
// 🌟 新增：引入 Swiper 的型別，解決 thumbsSwiper 的紅底線報錯
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Pagination, Thumbs, FreeMode } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

import { useCartStore } from "@/lib/cartStore";

// ===================== 型別宣告區 (解決所有 Props 的紅底線) =====================
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
// ==============================================================================

function AccordionItem({ title, children, isOpen, onClick }: AccordionItemProps) {
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

// 🌟 加上 ProductProps 型別
export default function ProductClient({ product, faqs = [] }: ProductProps) {
  const router = useRouter();
  
  // 🌟 加上 Zustand state 型別 (s: any)
  const addItem = useCartStore((s: any) => s.addItem);
  const openCart = useCartStore((s: any) => s.open);

  const [flavor, setFlavor] = useState<string>("");
  const [pkg, setPkg] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [showAdded, setShowAdded] = useState<boolean>(false);
  const [tab, setTab] = useState<string>("desc");
  const [displayPrice, setDisplayPrice] = useState<number>(Number(product.price || 0));

  const [openAccordion, setOpenAccordion] = useState<string>("desc");

  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [initialSlide, setInitialSlide] = useState<number>(0);
  
  // 🌟 給予正確的 Swiper 型別
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  const flavorOptions = useMemo(() => {
    if (!product.attributes) return [];
    // 🌟 加上 a: any
    const attr = product.attributes.find((a: any) =>
      ["口味", "Flavor", "Flavors"].includes(a.name),
    );
    return attr?.options || [];
  }, [product]);

  const pkgOptions = useMemo(() => {
    if (!product.attributes) return [];
    // 🌟 加上 a: any
    const attr = product.attributes.find((a: any) =>
      ["優惠方案", "規格", "Size", "Package"].includes(a.name),
    );
    return attr?.options || [];
  }, [product]);

  useEffect(() => {
    if (flavorOptions.length > 0 && !flavor) {
      setFlavor(flavorOptions[0]);
    }
    if (pkgOptions.length > 0 && !pkg) {
      setPkg(pkgOptions[0]);
    }
  }, [flavorOptions, pkgOptions, flavor, pkg]);

  useEffect(() => {
    if (!pkg) {
      setDisplayPrice(Number(product.price || 0));
      return;
    }

    let newPrice = Number(product.price || 0);
    if (pkg.includes("1盒") || pkg.includes("新品")) {
      newPrice = 1380;
    } else if (pkg.includes("買三送一") || pkg.includes("4盒")) {
      newPrice = 4140;
    } else if (pkg.includes("6盒")) {
      newPrice = 5940;
    } else if (pkg.includes("12盒")) {
      newPrice = 9600;
    }
    setDisplayPrice(newPrice);
  }, [pkg, product.price]);

  const canBuy =
    (flavorOptions.length === 0 || flavor) && (pkgOptions.length === 0 || pkg);

  useEffect(() => {
    if (!showAdded) return;
    const t = setTimeout(() => setShowAdded(false), 2500);
    return () => clearTimeout(t);
  }, [showAdded]);

  function handleBuyNow() {
    const optionVariant = [flavor, pkg].filter(Boolean).join(" / ");
    const cartItem = {
      id: product.id,
      wcProductId: product.id,
      name: `${product.name}｜${product.subname || ""}`,
      price: displayPrice,
      image: product.images?.[0],
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

  const images: string[] = product.images || [];

  return (
    <main className="bg-white pt-10 pb-20 text-[#2b2b2b] mt-[60px] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
          {/* 左側：商品大圖與小圖輪播 */}
          <div className="w-full lg:w-1/2 select-none sm:p-6 p-3 lg:p-10 lg:sticky lg:top-24 lg:self-start h-fit">
            <Swiper
              spaceBetween={10}
              navigation={true}
              thumbs={{
                swiper:
                  thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
              }}
              modules={[FreeMode, Navigation, Thumbs]}
              className="w-full mb-4 rounded-xl overflow-hidden group main-image-swiper"
            >
              {images.map((src: string, i: number) => (
                <SwiperSlide key={i}>
                  <div
                    className="relative w-full aspect-square bg-gray-50 cursor-zoom-in overflow-hidden"
                    onClick={() => openImage(i)}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} - ${i}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      priority={i === 0}
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
                      alt={`Thumb ${i}`}
                      fill
                      sizes="(max-width: 1024px) 20vw, 10vw"
                      className="object-cover object-center"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* 右側：商品資訊 & 購買區 */}
          <div className="w-full lg:w-2/5 flex flex-col p-4 sm:p-8 lg:sticky lg:top-24 lg:self-start h-fit">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-gray-500 text-lg mb-4">{product.subname}</p>

            <div className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              NT$ {displayPrice.toLocaleString()}
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
            {pkgOptions.length > 0 ? (
              <div className="mb-8 rounded-xl border border-rose-100 bg-rose-500 p-4">
                <div className="mb-3 flex items-center justify-between border-b border-rose-100 pb-2">
                  <span className="text-sm font-bold text-slate-50">
                    選擇優惠方案
                  </span>
                  <span className="text-xs font-medium bg-rose-100 text-rose-500 px-2 py-0.5 rounded-full">
                    2026 新春限定
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {pkgOptions.map((opt: string) => {
                    const isSelected = pkg === opt;
                    const isHot = opt.includes("買三送一");
                    return (
                      <button
                        key={opt}
                        onClick={() => setPkg(opt)}
                        className={`relative flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                          isSelected
                            ? "bg-white border-rose-500 shadow-md ring-1 ring-rose-500 z-10"
                            : "bg-white/60 border-rose-100 hover:border-rose-300 hover:bg-white text-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-rose-500" : "border-gray-300"}`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-rose-500" />
                            )}
                          </div>
                          <span
                            className={`text-sm ${isSelected ? "font-bold text-gray-900" : ""}`}
                          >
                            {opt}
                          </span>
                          {isHot && (
                            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                              熱銷
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          {opt.includes("1盒") && (
                            <span className="text-sm font-medium">
                              NT$ 1,380
                            </span>
                          )}
                          {opt.includes("買三送一") && (
                            <span className="text-sm font-bold text-rose-600">
                              NT$ 4,140
                            </span>
                          )}
                          {opt.includes("6盒") && (
                            <span className="text-sm font-medium">
                              NT$ 5,940
                            </span>
                          )}
                          {opt.includes("12盒") && (
                            <span className="text-sm font-medium">
                              NT$ 9,600
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 text-gray-400 text-sm mb-6 rounded border border-gray-100">
                載入規格中...
              </div>
            )}

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

            {/* 4. 折疊資訊區 (Accordion) */}
            <div className="border-b border-gray-200 mt-4">
              <AccordionItem
                title="商品簡介"
                isOpen={openAccordion === "desc"}
                onClick={() =>
                  setOpenAccordion(openAccordion === "desc" ? "" : "desc")
                }
              >
                <div
                  dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                />
              </AccordionItem>

              {/* 🌟 渲染外部傳入的 FAQ */}
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

      {/* ──────────────────────────────────────────────────
          下方詳細說明區
         ────────────────────────────────────────────────── */}
      <div className="w-full bg-white mt-16 pt-10 pb-20 border-t border-gray-200">
        <div className="w-[95%] mx-auto px-4 lg:px-16">
          <div className="flex gap-8 border-b border-gray-200 mb-8 justify-center">
            <button
              className={`pb-4 text-lg font-medium transition border-b-2 px-2 ${
                tab === "desc"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
              onClick={() => setTab("desc")}
            >
              商品詳細說明
            </button>
            <button
              className={`pb-4 text-lg font-medium transition border-b-2 px-2 ${
                tab === "notice"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
              onClick={() => setTab("notice")}
            >
              購買須知
            </button>
          </div>
          <div className="mx-auto max-w-[1300px]">
            <div className="flex ">
              <Image
                src="/images/維他菌合生元/001.png"
                className="max-w-[350px] w-full"
                alt=""
                width={1500}
                height={800}
              />
              <div>
                <h3 className="font-extrabold text-stone-800 text-[50px]">
                  維他菌合生元
                </h3>
                <Image
                  src="/images/維他菌合生元/維他菌合生元-01.png"
                  className="max-w-[250px] w-full"
                  alt=""
                  width={1500}
                  height={800}
                />
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-[1300px] my-10">
            <div className="flex flex-col justify-center items-center">
              <p className="text-[22px]">
                不是吃下一堆菌，而是要會{" "}
                <span className="font-bold text-rose-500">選</span> 菌
              </p>
              <p className="text-[22px]">
                真正對你影響的不是數量，而是{" "}
                <span className="font-bold text-rose-500">
                  菌株是否有目的性
                </span>
              </p>
              <p className="text-[22px]">
                <span className="font-bold text-[32px] text-stone-800">
                  UFLOW
                </span>{" "}
                嚴格挑選{" "}
                <span className="font-bold text-rose-500">
                  4 株有功能分工的原廠菌株
                </span>
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-[1300px] my-10">
            <h3 className=" lg:text-[32px] text-[24px] 2xl:text-[45px] font-bold text-stone-800">
              【菌株】才是真正幫助保養的關鍵
            </h3>
            <ul className="pl-6">
              <li className="text-stone-800 text-[20px] mt-3">
                {" "}
                <span className="font-bold ">
                  Lactobacillus plantarum LPL28：
                </span>{" "}
                調整蠕動節奏，調節氣脹感
              </li>
              <li className="text-stone-800 text-[20px] mt-3">
                {" "}
                <span className="font-bold ">
                  Lactobacillus salivarius AP-32：
                </span>{" "}
                協助抑制不良菌生長，支持消化道的菌相平衡
              </li>
              <li className="text-stone-800 text-[20px] mt-3">
                {" "}
                <span className="font-bold ">
                  Lactobacillus rhamnosus F-1
                </span>{" "}
                協助消化道防護機制與平衡
              </li>
              <li className="text-stone-800 text-[20px] mt-3">
                {" "}
                <span className="font-bold ">
                  Bifidobacterium animalis subsp. Lactis CP-9:
                </span>{" "}
                支持菌種經過消化道的耐受性與菌相穩定
              </li>
            </ul>
            <div className="flex mt-5">
              <div className="mx-3">
                <Image
                  src="/images/維他菌合生元/002.png"
                  className="max-w-[350px] w-full"
                  alt=""
                  width={1500}
                  height={800}
                />
              </div>
              <div className="mx-3">
                <Image
                  src="/images/維他菌合生元/005.png"
                  className="max-w-[250px] w-full"
                  alt=""
                  width={1500}
                  height={800}
                />
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-[1300px] my-10">
            <h3 className=" lg:text-[32px] text-[24px] 2xl:text-[45px] font-bold text-stone-800">
              單補益生菌，很多人吃了「沒感覺」， <br></br>原因不是菌不好，而是
              <span className="text-rose-500"> 消化道環境不適合它留下來</span>
            </h3>
            <div className="mx-3">
              <Image
                src="/images/維他菌合生元/006.png"
                className="max-w-[850px] w-full"
                alt=""
                width={1500}
                height={800}
              />
            </div>
          </div>
          <div className="mx-auto max-w-[1300px] my-10">
            <h3 className=" lg:text-[32px] text-[24px] 2xl:text-[45px] font-bold text-stone-800">
              合生元 (Synbiotics) 是{" "}
              <span className="text-rose-500"> 益生菌</span>與
              <span className="text-rose-500"> 益生元</span>、
              <span className="text-rose-500"> 後生元</span>結合，
              <br></br> 並添加提升益生菌存活
              <span className="text-rose-500"> 專利益萃質®</span>
              <br></br>
              <span className="text-rose-500"> 維持</span>細菌叢停留體內的{" "}
              <span className="text-rose-500">續航力</span>
            </h3>
            <div className="mx-3">
              <Image
                src="/images/維他菌合生元/006.png"
                className="max-w-[850px] w-full"
                alt=""
                width={1500}
                height={800}
              />
            </div>
          </div>
          <div className="mx-auto max-w-[1300px] my-10">
            <div className="mx-3">
              <Image
                src="/images/維他菌合生元/text.png"
                className="max-w-[200px] w-full"
                alt=""
                width={1500}
                height={800}
              />
            </div>
            <div className="flex mt-5">
              <div className="mx-3">
                <Image
                  src="/images/維他菌合生元/007.png"
                  className="max-w-[550px] w-full"
                  alt=""
                  width={1500}
                  height={800}
                />
              </div>
              <div className="mx-3">
                <Image
                  src="/images/維他菌合生元/008.png"
                  className="max-w-[550px] w-full"
                  alt=""
                  width={1500}
                  height={800}
                />
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-[1300px] my-10">
            <h3 className=" lg:text-[32px] text-[24px] 2xl:text-[45px] font-bold text-stone-800">
              漢方調理
            </h3>
            <h4 className=" lg:text-[24px] text-[20px] 2xl:text-[32px] font-bold text-stone-800">
              UFLOW 維他菌合生元 於益生菌配方中搭配漢方提供<br></br>
              更完整的營養補充設計，作為日常規律調理的輔助元素。
            </h4>
            <div className="mx-3">
              <Image
                src="/images/維他菌合生元/漢方溫和調理.png"
                className="max-w-[850px] w-full"
                alt=""
                width={1500}
                height={800}
              />
            </div>
          </div>
          <div className="mx-auto max-w-[1300px] my-10">
            <h3 className=" lg:text-[32px] text-[24px] 2xl:text-[45px] font-bold text-stone-800">
              採用專利三層包埋凍晶技術，
            </h3>
            <h4 className=" lg:text-[24px] text-[20px] 2xl:text-[32px] font-bold text-stone-800">
              提升益生菌在儲存與消化道環境中的穩定與存活率。
            </h4>
            <div className="mx-3">
              <Image
                src="/images/維他菌合生元/專利技術.png"
                className="max-w-[850px] w-full"
                alt=""
                width={1500}
                height={800}
              />
            </div>
            <div className="mx-3">
              <Image
                src="/images/維他菌合生元/維他菌合生元.png"
                className="max-w-[850px] w-full"
                alt=""
                width={1500}
                height={800}
              />
            </div>
            <div className="mx-3">
              <Image
                src="/images/維他菌合生元/專利技術.png"
                className="max-w-[850px] w-full"
                alt=""
                width={1500}
                height={800}
              />
            </div>
          </div>
          <div className="max-w-7xl w-full mx-auto">
            {tab === "desc" && (
              <div className="flex flex-col justify-center items-center gap-0">
                <Image
                  src="/images/products/鎂鎂香蜂草.png"
                  className="max-w-[950px] w-full"
                  alt=""
                  width={1500}
                  height={800}
                />
                <div className="max-w-[950px] w-full py-8">
                  <h3 className="text-3xl font-bold mb-4">適用族群：</h3>
                  <p className="text-lg">
                    生活步調緊湊、壓力大、飲食不均衡、飲酒、翻來覆去難入眠、運動健身族群
                  </p>
                </div>
                <Image
                  src="/images/products/香蜂草萃取物.png"
                  className="max-w-[950px] w-full"
                  alt=""
                  width={1500}
                  height={800}
                />
                <Image
                  src="/images/products/GABA-(γ-胺基丁酸).png"
                  className="max-w-[950px] w-full"
                  alt=""
                  width={1500}
                  height={800}
                />
                <Image
                  src="/images/products/配方.png"
                  className="max-w-[950px] w-full"
                  alt=""
                  width={1500}
                  height={800}
                />
                <Image
                  src="/images/products/Gemini_Generated_Image_q7zfzxq7zfzxq7zf.png"
                  className="max-w-[950px] w-full mt-8"
                  alt=""
                  width={1500}
                  height={800}
                />
                <Image
                  src="/images/products/鎂（Magnesium）是人體必需的重要礦物質.png"
                  className="max-w-[950px] w-full mt-8"
                  alt=""
                  width={1500}
                  height={800}
                />
              </div>
            )}
            {tab === "notice" && (
              <div className="text-gray-600 leading-7 text-center max-w-2xl mx-auto">
                <p>
                  若商品包裝破損或內容有異，請於收到後 7
                  日內聯繫客服。若因個人原因退換貨，商品需保持未拆封狀態。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────
          全螢幕 Lightbox
         ────────────────────────────────────────────────── */}
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
                      alt={`Detail ${i}`}
                      width={1200}
                      height={1200}
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