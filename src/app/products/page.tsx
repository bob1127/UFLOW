// app/products/page.tsx
import Image from "next/image";
import Link from "next/link";
import { fetchProducts } from "@/lib/woo";

export const revalidate = 60; // ISR：60 秒後可被再生

export const metadata = {
  title: "商品一覽｜寬越設計商店",
  description: "瀏覽所有商品與設計選品。支援 SSG + ISR，內容穩定、SEO 友善。",
  alternates: { canonical: "https://www.kuankoshi.com/products" },
  openGraph: {
    type: "website",
    title: "商品一覽｜寬越設計商店",
    url: "https://www.kuankoshi.com/products",
  },
};

// 只保留卡片米色
const COLORS = {
  cardBg: "#f7f3ef", // 卡片底色（米色）
  buyText: "#111111",
  buyBorder: "#111111",
  newBg: "#f6b595",
  newText: "#ffffff",
  nameText: "#111111",
  metaText: "#6b7280",
};

export default async function ProductsPage() {
  let items: Awaited<ReturnType<typeof fetchProducts>> = [];
  try {
    items = await fetchProducts({ page: 1, perPage: 24 });
  } catch {
    items = [];
  }

  const firstImg = (p: any) => p.images?.[0]?.src || "/placeholder.png";
  const isNew = (p: any) => !!p.sale_price; // 可改成你的自訂條件

  return (
    <div className="bg-slate-50">
      {/* HERO 橫幅 */}
      <div
        className="w-full aspect-[1920/700] bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage:
            "url('/images/hero-banner/72de3bfc-c053-4ae8-87bd-89ad2257ded3.png')",
        }}
      />

      {/* 整頁背景 = 白色 */}
      <main className="mx-auto max-w-6xl px-4 py-16 ">
        {/* 標題 + 說明 */}
        <h1
          className="text-5xl font-semibold tracking-wide text-[#111]"
          style={{ letterSpacing: ".02em" }}
        >
          熱銷產品
        </h1>
        <p className="mt-4 leading-relaxed tracking-widest text-[15px] text-[#2b2b2b]/80">
          作為美味基礎的重要原材料是「大豆」。 <br></br>為了能夠享受到大豆本來的
          甜味和美味，<br></br>我們努力製作簡單的味道
        </p>

        {/* 商品格狀卡片 */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group block"
            >
              {/* 卡片：只有卡片是米色，白底頁面上更突出 */}
              <div
                className="relative rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-lg border border-black/5"
                style={{ backgroundColor: COLORS.cardBg }}
              >
                {/* 左上 BUY 膠囊 */}
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

                {/* 右上 NEW 圓徽（條件顯示） */}
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
                    priority={false}
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
