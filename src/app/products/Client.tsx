"use client";

import Image from "next/image";
import { Link } from "next-view-transitions";

export type Product = {
  id: number;
  slug: string;
  name: string;
  price: string;
  regular_price?: string;
  sale_price?: string;
  images: { src: string; alt?: string }[];
  meta_desc?: string;
  meta_ingredients?: string;
  meta_spec?: string;
};

const AudioGuideIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mt-[2px] md:w-4 md:h-4"
  >
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
  </svg>
);

export default function Client({ items }: { items: Product[] }) {
  const firstImg = (p: Product) =>
    p.images?.[0]?.src || "/images/logo/uflow.png";

  return (
    <div className="bg-white min-h-screen text-[#111] font-sans selection:bg-gray-200">
      <main className="mx-auto max-w-[1400px] px-4 md:px-12 py-16 md:py-24">
        {/* 標題 */}
        <h1 className="text-lg md:text-2xl font-normal tracking-widest text-[#111] mb-12 mt-20 uppercase">
          Product Gallery
        </h1>

        {/* 🚀 關鍵修改：grid-cols-2 讓手機版強制兩排，並微調 gap 間距 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-20">
          {items.map((p, idx) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group block"
            >
              {/* 圖片容器 */}
              <div className="relative w-full aspect-square bg-[#f7f7f7] mb-4 md:mb-6 overflow-hidden flex items-center justify-center">
                <div className="relative w-[70%] h-[70%]">
                  <Image
                    src={firstImg(p)}
                    alt={p.images?.[0]?.alt || p.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* 資訊區塊 (針對手機版縮小字級，避免擁擠) */}
              <div className="flex justify-between items-start px-1">
                <div className="flex-1 pr-2 md:pr-4">
                  <h2 className="text-[14px] md:text-[15px] font-bold uppercase tracking-wider mb-3 md:mb-4 text-[#111] line-clamp-2">
                    {p.name}
                  </h2>

                  {/* UFLOW 專屬短文案 */}
                  <div className="text-[13px] md:text-[14px] text-[#666] leading-relaxed tracking-wide space-y-1">
                    <p className="text-[#333] font-medium mb-1 md:mb-2 line-clamp-2">
                      {p.meta_desc || "維持日常健康機能，打造純淨好體質"}
                    </p>
                    <p className="line-clamp-1">
                      主成分：{p.meta_ingredients || "專利植萃配方"}
                    </p>
                    <p>規　格：{p.meta_spec || "30包 / 盒"}</p>
                  </div>

                  <div className="mt-4 md:mt-6 text-right text-[10px] md:text-[11px] font-medium tracking-wider text-[#111]">
                    NT$ {p.price}
                    <span className="text-[8px] md:text-[9px] text-[#666] ml-1">
                      (含稅)
                    </span>
                  </div>
                </div>

                {/* 語音導覽編號 */}
                <div className="flex items-start gap-[2px] text-[#111]">
                  <AudioGuideIcon />
                  <span className="text-[12px] md:text-[15px] font-medium leading-none">
                    {idx + 1}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
