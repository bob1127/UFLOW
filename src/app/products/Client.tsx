"use client";

import Image from "next/image";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { buildImageAlt } from "@/lib/imageAlt";

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
  categories?: Array<{ id?: number; name?: string; slug?: string }>;
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

const TABS = [
  { label: "熱門產品", href: "/products" },
  { label: "優惠活動", href: "/products/promotions" },
] as const;

export default function Client({
  items,
  title = "熱門產品",
}: {
  items: Product[];
  title?: string;
}) {
  const pathname = usePathname();
  const firstImg = (p: Product) =>
    p.images?.[0]?.src || "/images/logo/uflow.png";

  return (
    <div className="bg-white min-h-screen text-[#111] font-sans selection:bg-gray-200">
      <main className="mx-auto max-w-[1400px] px-4 md:px-12 py-16 md:py-24">
        <h1 className="text-lg md:text-2xl font-normal tracking-widest text-[#111] mb-8 mt-20 uppercase">
          {title}
        </h1>

        {/* 熱門產品 / 優惠活動 tab */}
        <div className="mb-12 flex items-center gap-2 border-b border-gray-200">
          {TABS.map((tab) => {
            const active =
              tab.href === "/products"
                ? pathname === "/products"
                : pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative -mb-px px-4 py-3 text-[14px] font-bold tracking-wider transition ${
                  active
                    ? "text-[#111] border-b-2 border-[#111]"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {items.length === 0 ? (
          <p className="py-20 text-center text-gray-400 tracking-wider">
            目前尚無商品
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-20">
            {items.map((p, idx) => {
              const sale = Number(p.price || 0);
              const regular = Number(p.regular_price || p.price || 0);
              const hasSale = Number.isFinite(regular) && regular > sale;

              return (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group block"
                >
                  <div className="relative w-full aspect-square bg-[#f7f7f7] mb-4 md:mb-6 overflow-hidden flex items-center justify-center">
                    <div className="relative w-[70%] h-[70%]">
                      <Image
                        src={firstImg(p)}
                        alt={buildImageAlt({
                          name: p.name,
                          src: firstImg(p),
                          role: "list",
                          index: 1,
                          existingAlt: p.images?.[0]?.alt,
                        })}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-contain transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-start px-1">
                    <div className="flex-1 pr-2 md:pr-4">
                      <h2 className="text-[14px] md:text-[15px] font-bold uppercase tracking-wider mb-3 md:mb-4 text-[#111] line-clamp-2">
                        {p.name}
                      </h2>

                      <div className="text-[13px] md:text-[14px] text-[#666] leading-relaxed tracking-wide space-y-1">
                        <p className="text-[#333] font-medium mb-1 md:mb-2 line-clamp-2">
                          {p.meta_desc || "維持日常健康機能，打造純淨好體質"}
                        </p>
                        <p className="line-clamp-1">
                          主成分：{p.meta_ingredients || "專利植萃配方"}
                        </p>
                        <p>規　格：{p.meta_spec || "30包 / 盒"}</p>
                      </div>

                      <div className="mt-4 md:mt-6 text-right">
                        {hasSale && (
                          <div className="text-[10px] md:text-[11px] text-[#999] line-through tracking-wider">
                            NT$ {regular.toLocaleString("en-US")}
                          </div>
                        )}
                        <div className="text-[12px] md:text-[13px] font-bold tracking-wider text-[#111]">
                          NT$ {(Number.isFinite(sale) ? sale : 0).toLocaleString("en-US")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-[2px] text-[#111]">
                      <AudioGuideIcon />
                      <span className="text-[12px] md:text-[15px] font-medium leading-none">
                        {idx + 1}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
