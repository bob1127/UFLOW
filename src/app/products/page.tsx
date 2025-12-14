// app/products/page.tsx
import { fetchAllProducts } from "@/lib/woo"; // 使用我們剛定義好的抓全部商品的函式
import Client from "./Client";

export const revalidate = 60; // ISR 60 秒更新一次

export const metadata = {
  title: "所有商品一覽｜UFLOW 保健食品",
  description:
    "瀏覽 UFLOW 熱銷保健食品與植物營養飲品，完整商品資訊、價格、規格與購買服務。",
  alternates: { canonical: "https://www.kuankoshi.com/products" },
  openGraph: {
    type: "website",
    title: "所有商品一覽｜UFLOW 保健食品",
    url: "https://www.kuankoshi.com/products",
    images: [
      {
        url: "https://www.kuankoshi.com/images/og/products-cover.jpg",
        width: 1200,
        height: 630,
        alt: "UFLOW 商品一覽",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "所有商品一覽｜UFLOW 保健食品",
    description:
      "瀏覽 UFLOW 熱銷保健食品與植物營養飲品，完整商品資訊、價格、規格與購買服務。",
    images: ["https://www.kuankoshi.com/images/og/products-cover.jpg"],
  },
};

export default async function ProductsPage() {
  let items: any[] = [];

  try {
    // 這裡改用 fetchAllProducts 一次抓多一點，或者用 fetchProducts({ page: 1, perPage: 24 })
    items = await fetchAllProducts();
  } catch (error) {
    console.error("Failed to load products:", error);
    items = [];
  }

  // 將資料傳給 Client Component
  return <Client items={items} />;
}
