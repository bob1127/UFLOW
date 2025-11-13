// app/products/page.tsx
import { fetchProducts } from "@/lib/woo";
import Client from "./Client";

export const revalidate = 60; // ISR 60 秒

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
    items = await fetchProducts({ page: 1, perPage: 24 });
  } catch {
    items = [];
  }

  return <Client items={items} />;
}
