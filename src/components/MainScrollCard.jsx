"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { ReactLenis } from "lenis/react";
import { Link } from "next-view-transitions";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import TextParallaxContentExample03 from "../components/TextParallaxContent03/page";
import HomeBrandSections from "../components/HomeBrandSections";

const Slider = dynamic(
  () => import("../components/SwiperCarousel/SwiperCardAbout"),
  { ssr: false },
);

const SLANT_HEIGHT = 120;

const CardWrapper = ({ children, index, totalCards }) => {
  const isFirst = index === 0;
  const isLast = index === totalCards - 1;
  const hasSlant = !isFirst && !isLast;

  let cardStyle = {};
  let innerPadding = "pt-16 md:pt-24";

  if (hasSlant) {
    cardStyle = {
      clipPath: `polygon(0 ${SLANT_HEIGHT}px, 100% 0, 100% 100%, 0 100%)`,
      marginTop: `-${SLANT_HEIGHT}px`,
    };
    innerPadding = "pt-[140px] md:pt-[180px]";
  } else if (isLast) {
    cardStyle = { clipPath: "none", marginTop: "0px" };
    innerPadding = "pt-16 md:pt-24";
  }

  return (
    <div
      className="card sticky top-0 flex h-screen w-full flex-col"
      id={`card-${index + 1}`}
      style={cardStyle}
    >
      <div
        className={`card-inner group/card relative h-full w-full overflow-hidden ${innerPadding}`}
      >
        {children}
      </div>
    </div>
  );
};

const ProductScrollCard = ({
  sectionLabel,
  heading,
  subLabel,
  description,
  price,
  slug,
  bgImage,
}) => {
  const [labelMain, labelSub] = sectionLabel.includes(" ")
    ? sectionLabel.split(" ")
    : [sectionLabel, ""];

  return (
    <>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        {bgImage && (
          <img
            src={bgImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-black/70 transition-colors duration-700 group-hover/card:bg-black/60" />
      </div>

      {/* Content — CONTACT 風格三欄 */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 py-16 md:px-12 md:py-20 lg:px-20">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-end gap-10 md:grid-cols-12 md:gap-6 lg:gap-8">
          {/* 左：描邊大標 + 副標 + 說明 */}
          <div className="md:col-span-4 md:self-start md:pt-8 lg:pt-16">
            <div className="pointer-events-none select-none">
              <h2
                className="font-black uppercase leading-[0.9] tracking-tight text-transparent"
                style={{
                  fontSize: "clamp(3rem, 9vw, 6.5rem)",
                  WebkitTextStroke: "1.5px rgba(255,255,255,0.9)",
                  paintOrder: "stroke fill",
                }}
              >
                {labelMain}
              </h2>
              {labelSub && (
                <h2
                  className="-mt-1 font-black uppercase leading-[0.9] tracking-tight text-transparent md:-mt-2"
                  style={{
                    fontSize: "clamp(3rem, 9vw, 6.5rem)",
                    WebkitTextStroke: "1.5px rgba(255,255,255,0.9)",
                    paintOrder: "stroke fill",
                  }}
                >
                  {labelSub}
                </h2>
              )}
            </div>
            <p className="mt-5 text-sm font-bold text-white md:mt-6 md:text-base">
              {subLabel}
            </p>
            <p className="mt-4 max-w-sm text-xs leading-[1.9] text-white/75 md:text-sm">
              {description}
            </p>
            <p className="mt-5 text-base font-bold text-white md:mt-6 md:text-lg">
              優惠價 NT${price}
            </p>
          </div>

          {/* 中：箭頭 */}
          <div className="hidden md:col-span-1 md:flex md:items-end md:justify-center md:pb-[clamp(4rem,12vh,8rem)]">
            <Link
              href={`/products/${slug}`}
              className="group/arrow flex h-16 w-16 items-center justify-center text-white/80 transition-all duration-500 hover:text-white"
              aria-label="查看產品"
            >
              <ArrowRight
                size={40}
                strokeWidth={1.2}
                className="transition-transform duration-500 group-hover/arrow:translate-x-2"
              />
            </Link>
          </div>

          {/* 右：大標主文案 */}
          <div className="md:col-span-7 md:mt-16 lg:col-span-7 lg:mt-24">
            <h3 className="text-3xl font-black leading-[1.05] tracking-tight text-white transition-transform duration-500 group-hover/card:-translate-y-1 sm:text-2xl md:text-ˇxl lg:text-[ˇ.5rem] xl:text-[ˋrem]">
              {heading}
            </h3>
            <Link
              href={`/products/${slug}`}
              className="group/link mt-8 inline-flex items-center gap-3 border-b border-white/40 pb-2 text-sm font-bold tracking-widest text-white transition-colors hover:border-white md:mt-10 md:hidden"
            >
              了解更多
              <ArrowRight
                size={16}
                className="transition-transform group-hover/link:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

// 🌟 關鍵修改：從 props 接收 items (所有商品資料)
export default function HomeClient({ items = [] }) {
  const container = useRef();
  const TOTAL_CARDS = 3;

  // 🚀 智慧配對邏輯：自動從 items 找出對應商品，若找不到則給予預設值防呆
  const gabaData = items.find((p) => p.name.toUpperCase().includes("GABA"));
  const gaba = {
    name: gabaData?.name || "GABA鎂鎂香蜂草",
    slug: gabaData?.slug || "gaba鎂鎂香蜂草",
    price: gabaData?.price || "---",
    regular: gabaData?.regular_price || "---",
    image: "/images/UFLOW GABA鎂鎂香蜂草/001.png",
    cardImage: "/images/70e8daf1-c621-49f1-a08f-54c933c6b82c.png",
    // 滿版情境圖維持不變
  };

  const synbioticsData = items.find(
    (p) =>
      p.name.includes("合生元") || p.name.toUpperCase().includes("SYNBIOTICS"),
  );
  const synbiotics = {
    name: synbioticsData?.name || "維他菌合生元",
    slug: synbioticsData?.slug || "synbiotics",
    price: synbioticsData?.price || "---",
    regular: synbioticsData?.regular_price || "---",
    image: "/images/UFLOW維他菌合生元/001.png",
    cardImage: "/images/6b538aec-f3e9-45c8-aeb4-3b85c814d251.png",
  };

  const peptidesData = items.find(
    (p) => p.name.includes("芙蓉") || p.name.includes("肽晶"),
  );
  const peptides = {
    name: peptidesData?.name || "肽晶芙蓉",
    slug: peptidesData?.slug || "肽晶芙蓉",
    price: peptidesData?.price || "---",
    regular: peptidesData?.regular_price || "---",
    image: "/images/UFLOW肽晶芙蓉/001.png",
    cardImage: "/images/2894d77a-1a15-4b49-b982-8cc7a09e8029.png",
  };

  return (
    <ReactLenis root>
      <div className="app relative w-full bg-white font-sans" ref={container}>
        <section className="hero relative z-0 w-full overflow-x-clip bg-white p-0">
          <Slider autoplayDelay={4500} speed={900} />
        </section>

        {/* Main Products Section — Nature Remo 風格產品網格 */}
        <section className="section-main-products relative z-10 w-full bg-white px-4 pt-16 pb-20 sm:px-6 sm:pt-10 lg:px-12 lg:pt-14 lg:pb-28">
          <div className="mx-auto w-full max-w-[1280px]">
            <div className="mb-12 text-center sm:mb-14 lg:mb-16">
              <h2 className="font-display text-[clamp(1.75rem,4.5vw,3rem)] font-light tracking-[0.18em] text-ink">
                Ranking
              </h2>
              <p className="mt-2 text-[13px] font-light tracking-[0.18em] text-ink-muted sm:text-[14px]">
                熱銷排行
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
              {[
                {
                  ...gaba,
                  en: "GABA Magnesium Lemon Balm",
                  tags: "#科學調配 #足量攝取 #能量循環新配方 #日間穩定 #夜間助眠",
                },
                {
                  ...peptides,
                  en: "Peptide Crystal Hibiscus",
                  tags: "#科學調配 #足量攝取 #喚回芙蓉貴婦肌 #國際原廠 #專利足量",
                },
                {
                  ...synbiotics,
                  en: "Synbiotics",
                  tags: "#專利菌種 #合生元 #幫助消化 #細菌叢健康 #益生菌×益生元",
                },
              ].map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="group flex flex-col text-left"
                >
                  {/* 產品圖 — 無背景色塊，略縮小 */}
                  <div className="relative mx-auto aspect-square w-[78%] overflow-hidden sm:w-[75%]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 280px, (min-width: 640px) 35vw, 78vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  {/* 產品名 — 粗體深色 */}
                  <h3 className="mt-4 text-[16px] font-bold leading-[1.35] tracking-wide text-[#333] sm:mt-5 sm:text-[17px]">
                    {product.name}
                  </h3>

                  {/* 英文副標 — 中灰、較小 */}
                  <p className="mt-1 text-[12px] leading-snug tracking-wide text-[#888] sm:text-[13px]">
                    {product.en}
                  </p>

                  {/* #標籤 — 最淺灰、最小字 */}
                  <p className="mt-2.5 text-[11px] leading-[1.7] tracking-wide text-[#aaa] sm:mt-3 sm:text-[12px]">
                    {product.tags}
                  </p>

                  {/* 價格 — 促銷價 + 原價刪除線 */}
                  {(() => {
                    const sale = Number(product.price);
                    const regular = Number(product.regular);
                    const hasSale =
                      Number.isFinite(sale) &&
                      Number.isFinite(regular) &&
                      regular > sale;

                    return (
                      <div className="mt-3.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 sm:mt-4">
                        {hasSale && (
                          <span className="text-[14px] font-medium tracking-tight text-[#aaa] line-through sm:text-[15px]">
                            NT${regular.toLocaleString("en-US")}
                          </span>
                        )}
                        <p className="text-[19px] font-bold tracking-tight text-[#333] sm:text-[21px]">
                          NT$
                          {(Number.isFinite(sale)
                            ? sale
                            : 0
                          ).toLocaleString("en-US")}
                        </p>
                      </div>
                    );
                  })()}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Story + Movie 兩個新增區塊 */}
        <HomeBrandSections />

        {/* TextParallax 區塊 — 放在三個產品圖下方 */}
        <TextParallaxContentExample03 />

        {/* Cards Section — Sansei-style diagonal scroll cards */}
        <section className="cards relative z-10 w-full">
          <CardWrapper index={0} totalCards={TOTAL_CARDS}>
            <ProductScrollCard
              heading={
                <>
                  科學調配 足量攝取
                  <br />
                  能量循環新配方
                </>
              }
              subLabel={gaba.name}
              sectionLabel="UFLOW 01"
              description={
                <>
                  {gaba.name} — 科學調配 足量攝取 能量循環新配方。
                  日間補充穩定精神 + 夜間補充助眠。
                </>
              }
              price={gaba.price}
              slug={gaba.slug}
              bgImage={gaba.cardImage}
            />
          </CardWrapper>

          <CardWrapper index={1} totalCards={TOTAL_CARDS}>
            <ProductScrollCard
              heading={
                <>
                  台灣專利功能菌種
                  <br />
                  配方保衛健康
                </>
              }
              subLabel="合生元 Synbiotics"
              sectionLabel="UFLOW 02"
              description={
                <>
                  {synbiotics.name} — 科學調配 足量攝取 舒暢滿點。合生元
                  (Synbiotics)
                  將益生菌與益生元結合，提升益生菌存活。添加專利益萃質®
                  維護細菌叢健康。01-幫助消化、02-維持細菌叢健康、03-提升益生菌續航力。
                </>
              }
              price={synbiotics.price}
              slug={synbiotics.slug}
              bgImage={synbiotics.cardImage}
            />
          </CardWrapper>

          <CardWrapper index={2} totalCards={TOTAL_CARDS}></CardWrapper>
        </section>
      </div>
    </ReactLenis>
  );
}
