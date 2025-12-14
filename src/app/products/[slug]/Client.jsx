"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useCartStore } from "@/lib/cartStore";

// ─────────────────────────────────────────────────────────────
// 1. Accordion (折疊選單) 元件
// ─────────────────────────────────────────────────────────────
function AccordionItem({ title, children, isOpen, onClick }) {
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
          isOpen ? "max-h-96 opacity-100 mb-4" : "max-h-0 opacity-0"
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

export default function ProductClient({ product }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);

  // 狀態管理
  const [flavor, setFlavor] = useState("");
  const [pkg, setPkg] = useState("");
  const [qty, setQty] = useState(1);
  const [showAdded, setShowAdded] = useState(false);
  const [tab, setTab] = useState("desc");

  // ─────────────────────────────────────────────────────────────
  // 修改處：將初始值從 "" 改為 "desc"，預設展開商品簡介
  // ─────────────────────────────────────────────────────────────
  const [openAccordion, setOpenAccordion] = useState("desc");

  // Lightbox 相關狀態
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);

  // 資料解析
  const flavorOptions = useMemo(() => {
    if (!product.attributes) return [];
    const attr = product.attributes.find((a) =>
      ["口味", "Flavor", "Flavors"].includes(a.name)
    );
    return attr?.options || [];
  }, [product]);

  const pkgOptions = useMemo(() => {
    if (!product.attributes) return [];
    const attr = product.attributes.find((a) =>
      ["規格", "Size", "Package"].includes(a.name)
    );
    return attr?.options || [];
  }, [product]);

  useEffect(() => {
    if (flavorOptions.length > 0 && !flavor) setFlavor(flavorOptions[0]);
    if (pkgOptions.length > 0 && !pkg) setPkg(pkgOptions[0]);
  }, [flavorOptions, pkgOptions, flavor, pkg]);

  const originalPrice = Number(product.price || 0);
  const subscriptionPrice = Math.floor(originalPrice * 0.85);

  const canBuy =
    (flavorOptions.length === 0 || flavor) && (pkgOptions.length === 0 || pkg);

  useEffect(() => {
    if (!showAdded) return;
    const t = setTimeout(() => setShowAdded(false), 2500);
    return () => clearTimeout(t);
  }, [showAdded]);

  function handleBuyNow() {
    const optionVariant = [flavor, pkg].filter(Boolean).join(" / ");
    addItem({
      id: product.id,
      wcProductId: product.id,
      name: `${product.name}｜${product.subname || ""}`,
      price: subscriptionPrice,
      image: product.images?.[0],
      options: { 口味: flavor, 規格: pkg },
      qty: qty,
      variant: optionVariant,
    });
    openCart();
    setShowAdded(true);
  }

  const openImage = (index) => {
    setInitialSlide(index);
    setLightboxOpen(true);
  };

  const images = product.images || [];

  return (
    <main className="bg-white pt-10 pb-20 text-[#2b2b2b] mt-[60px] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
          {/* ──────────────────────────────────────────────────
              左側：圖片 Grid
             ────────────────────────────────────────────────── */}
          <div className="w-full lg:w-3/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((src, i) => (
                <div
                  key={i}
                  className={`relative cursor-pointer overflow-hidden bg-gray-50 hover:opacity-95 transition group ${
                    i === 0 && images.length % 2 !== 0
                      ? "md:col-span-2 aspect-square"
                      : "aspect-[4/5]"
                  }`}
                  onClick={() => openImage(i)}
                >
                  <Image
                    src={src}
                    alt={`${product.name} - ${i}`}
                    width={800}
                    height={1000}
                    className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                    priority={i < 2}
                  />
                  <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
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
              ))}
            </div>
          </div>

          {/* ──────────────────────────────────────────────────
              右側：商品資訊 & 購買區
             ────────────────────────────────────────────────── */}
          <div className="w-full lg:w-2/5 flex flex-col p-4 sm:p-8 lg:sticky lg:top-24 lg:self-start h-fit">
            {/* 評價星星 */}
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  className="w-4 h-4 text-black fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs text-gray-500 ml-1">(114 評論)</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-gray-500 text-lg mb-4">{product.subname}</p>

            <div className="text-2xl font-medium text-gray-900 mb-6 flex items-center gap-3">
              NT$ {subscriptionPrice.toLocaleString()}
              {subscriptionPrice < originalPrice && (
                <span className="text-base text-gray-400 line-through">
                  NT$ {originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-8 text-sm font-medium text-gray-600 bg-gray-50 w-fit px-3 py-1.5 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
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

            {/* 1. 規格選擇 */}
            {pkgOptions.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    選擇規格
                  </label>
                  <span className="text-xs text-gray-500">{pkg}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {pkgOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPkg(opt)}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium border transition-all ${
                        pkg === opt
                          ? "bg-purple-100 border-purple-300 text-purple-900 shadow-sm"
                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. 口味選擇 */}
            {flavorOptions.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    選擇口味
                  </label>
                  <span className="text-xs text-gray-500">{flavor}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {flavorOptions.map((opt, idx) => (
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

            {/* 3. 數量與購買按鈕區 */}
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
                    : "bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:brightness-110"
                }`}
              >
                加入購物車 - NT$ {(subscriptionPrice * qty).toLocaleString()}
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
                <p className="mt-2 text-xs text-gray-400">
                  更詳細的圖文介紹請見下方。
                </p>
              </AccordionItem>

              <AccordionItem
                title="運送與退換貨"
                isOpen={openAccordion === "shipping"}
                onClick={() =>
                  setOpenAccordion(
                    openAccordion === "shipping" ? "" : "shipping"
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
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            className="fixed top-6 right-6 z-[1001] text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
              {images.map((src, i) => (
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
          <style jsx global>{`
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
    </main>
  );
}
