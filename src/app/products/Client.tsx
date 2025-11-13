// app/products/Client.tsx
"use client";

import Image from "next/image";
import { Link } from "next-view-transitions";

type Product = {
  id: number | string;
  slug: string;
  name: string;
  sale_price?: string;
  images?: { src: string; alt?: string }[];
};

const COLORS = {
  cardBg: "#f7f3ef",
  buyText: "#111111",
  buyBorder: "#111111",
  newBg: "#f6b595",
  newText: "#ffffff",
  nameText: "#111111",
  metaText: "#6b7280",
};

export default function Client({ items }: { items: Product[] }) {
  const firstImg = (p: Product) => p.images?.[0]?.src || "/placeholder.png";
  const isNew = (p: Product) => !!p.sale_price;

  return (
    <div className="bg-slate-50">
      {/* HERO 橫幅 */}
      <div
        className="w-full md:aspect-[1080/576] aspect-square xl:aspect-[1920/700] bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage:
            "url('/images/hero-banner/72de3bfc-c053-4ae8-87bd-89ad2257ded3.png')",
        }}
      />

      <main className="mx-auto max-w-6xl px-4 py-16">
        {/* 標題 + 說明 */}
        <h1
          className=" text-3xl  xl:text-5xl font-semibold tracking-wide text-[#111]"
          style={{ letterSpacing: ".02em" }}
        >
          熱銷產品
        </h1>
        <p className="mt-4 leading-relaxed tracking-widest text-[15px] text-[#2b2b2b]/80">
          作為美味基礎的重要原材料是「大豆」。 <br />
          為了能夠享受到大豆本來的甜味和美味，
          <br />
          我們努力製作簡單的味道
        </p>

        {/* 商品格狀卡片 */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group block"
            >
              {/* 卡片 */}
              <div
                className="relative rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-lg border border-black/5"
                style={{ backgroundColor: COLORS.cardBg }}
              >
                {/* BUY 標籤 */}
                <div
                  className="absolute left-5 top-5 px-3 py-1 rounded-full text-xs tracking-widest"
                  style={{
                    color: COLORS.buyText,
                    border: `1px solid ${COLORS.buyBorder}`,
                    backgroundColor: "transparent",
                  }}
                >
                  BUY
                </div>

                {/* NEW 標籤 */}
                {isNew(p) && (
                  <div
                    className="absolute right-5 top-5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: COLORS.newBg,
                      color: COLORS.newText,
                    }}
                  >
                    NEW
                  </div>
                )}

                {/* 商品主圖 */}
                <div className="relative mx-auto my-6 w-[82%] aspect-[3/4] overflow-hidden">
                  <Image
                    src={firstImg(p)}
                    alt={p.images?.[0]?.alt || p.name}
                    fill
                    sizes="(min-width:1024px) 28vw, (min-width:768px) 30vw, 80vw"
                    className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              </div>

              {/* 名稱 + 規格 */}
              <div className="mt-4">
                <div className="text-[18px] md:text-[20px] leading-7 text-[#111]">
                  “{p.name}”
                </div>
                <div
                  className="mt-1 text-sm"
                  style={{ color: COLORS.metaText }}
                >
                  22oz　/　淨重
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
