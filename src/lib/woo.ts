import "server-only";

import { toSiteMediaPath } from "@/lib/mediaUrl";
import { buildImageAlt } from "@/lib/imageAlt";

export type WooImage = { id: number; src: string; alt?: string };

export type WooVariation = {
  id: number;
  sku?: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description?: string;
  stock_status?: string;
  menu_order?: number;
  /** 顯示用名稱：屬性選項組合，例如「買三贈二」 */
  label: string;
  attributes: Array<{ name: string; option: string }>;
};

export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type?: string;
  sku?: string;
  price: string;
  regular_price?: string;
  sale_price?: string;
  stock_status?: string;
  images: WooImage[];
  short_description?: string;
  description?: string;
  attributes?: Array<{ name: string; options: string[] }>;
  categories?: Array<{ id: number; name: string; slug: string }>;
  variations?: WooVariation[];
  acf?: { detailed_content?: string } | null;
};

const getDetailedContent = (p: any): string => {
  if (typeof p?.acf?.detailed_content === "string") {
    return p.acf.detailed_content;
  }
  const fromMeta = Array.isArray(p?.meta_data)
    ? p.meta_data.find((m: { key?: string }) => m.key === "detailed_content")
        ?.value
    : undefined;
  return typeof fromMeta === "string" ? fromMeta : "";
};

const getEnv = () => {
  const base = process.env.WC_API_BASE || "";
  const key = process.env.WC_CONSUMER_KEY || "";
  const secret = process.env.WC_CONSUMER_SECRET || "";
  if (!base || !key || !secret) {
    throw new Error(
      "WooCommerce 環境變數缺失：請在 .env.local 設定 WC_API_BASE/KEY/SECRET"
    );
  }
  return { base, key, secret };
};

const withAuth = (url: string) => {
  const { key, secret } = getEnv();
  const u = new URL(url);
  u.searchParams.set("consumer_key", key);
  u.searchParams.set("consumer_secret", secret);
  return u.toString();
};

/** WooCommerce REST 有時會被 WordPress PHP 警告污染，需從第一個 JSON 字元開始解析 */
const parseWooJson = async <T>(res: Response): Promise<T> => {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.search(/[\[{]/);
    if (start < 0) {
      throw new Error("WooCommerce API 回傳非 JSON 內容");
    }
    return JSON.parse(text.slice(start)) as T;
  }
};

const mapVariation = (v: any): WooVariation => {
  const attrs = Array.isArray(v?.attributes)
    ? v.attributes.map((a: any) => ({
        name: a.name || "",
        option: a.option || "",
      }))
    : [];
  const label =
    attrs
      .map((a: { option: string }) => a.option)
      .filter(Boolean)
      .join(" / ") ||
    v?.sku ||
    `方案 #${v?.id}`;

  return {
    id: v.id,
    sku: v.sku || "",
    price: String(v.price || v.sale_price || v.regular_price || "0"),
    regular_price: String(v.regular_price || v.price || "0"),
    sale_price: String(v.sale_price || ""),
    description: typeof v.description === "string" ? v.description : "",
    stock_status: v.stock_status || "instock",
    menu_order: Number(v.menu_order ?? 0),
    label,
    attributes: attrs,
  };
};

/** 抓取可變商品的所有變體（含各自原價／特價），依後台拖曳順序排列 */
export async function fetchProductVariations(
  productId: number | string,
): Promise<WooVariation[]> {
  const { base } = getEnv();
  const url = withAuth(
    `${base}/wp-json/wc/v3/products/${productId}/variations?per_page=100&orderby=menu_order&order=asc`,
  );
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = await parseWooJson<any[]>(res);
  if (!Array.isArray(data)) return [];
  return data
    .map(mapVariation)
    .sort(
      (a, b) =>
        (a.menu_order ?? 0) - (b.menu_order ?? 0) || a.id - b.id,
    );
}

const mapWoo = (p: any, variations: WooVariation[] = []): WooProduct => {
  const productName = String(p?.name || "");
  const images: WooImage[] = Array.isArray(p?.images)
    ? p.images.map((im: any, index: number) => {
        const src = im.src ? toSiteMediaPath(String(im.src)) : "";
        return {
          id: im.id,
          src,
          alt: buildImageAlt({
            name: productName,
            src,
            index: index + 1,
            role: index === 0 ? "gallery" : "gallery",
            existingAlt: im.alt || "",
          }),
        };
      })
    : [];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    permalink: p.permalink,
    type: p.type || "simple",
    sku: p.sku || "",
    price: p.price || p.regular_price || "0",
    regular_price: p.regular_price,
    sale_price: p.sale_price,
    stock_status: p.stock_status || "instock",
    images,
    short_description: p.short_description,
    description: p.description,
    attributes: p.attributes || [],
    categories: Array.isArray(p?.categories)
      ? p.categories.map((c: any) => ({
          id: c.id,
          name: c.name || "",
          slug: c.slug || "",
        }))
      : [],
    variations,
    acf: (() => {
      const detailed_content = getDetailedContent(p);
      return detailed_content ? { detailed_content } : null;
    })(),
  } as WooProduct;
};

// 1. 基礎列表抓取 (支援分頁)
export async function fetchProducts({
  page = 1,
  perPage = 24,
}: { page?: number; perPage?: number } = {}) {
  const { base } = getEnv();
  const url = withAuth(
    `${base}/wp-json/wc/v3/products?page=${page}&per_page=${perPage}&status=publish`
  );
  
  // 使用 no-store 或 revalidate 確保資料新鮮度，這裡沿用原本的 revalidate: 60
  const res = await fetch(url, { next: { revalidate: 60 } });
  
  if (!res.ok) throw new Error("取得商品列表失敗");
  const data = await parseWooJson<any[]>(res);
  return (data as any[]).map((p) => mapWoo(p)) as WooProduct[];
}

// 2. [新增] 抓取所有產品 (用於列表頁)
// 這裡預設抓取 100 筆，直接複用 fetchProducts 的邏輯
export async function fetchAllProducts() {
  return fetchProducts({ page: 1, perPage: 100 });
}

// 3. 單一產品抓取 (透過 Slug) — 可變商品一併抓變體
export async function fetchProductBySlug(slug: string) {
  const { base } = getEnv();
  const url = withAuth(
    `${base}/wp-json/wc/v3/products?slug=${encodeURIComponent(
      slug,
    )}&status=publish`,
  );
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const arr = await parseWooJson<any[]>(res);
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const raw = arr[0];
  const shouldFetchVariations =
    raw?.type === "variable" ||
    (Array.isArray(raw?.variations) && raw.variations.length > 0);
  const variations = shouldFetchVariations
    ? await fetchProductVariations(raw.id)
    : [];
  return mapWoo(raw, variations) as WooProduct;
}

// 4. 抓取所有 Slugs (用於 generateStaticParams)
export async function fetchAllProductSlugs({
  perPage = 100,
}: { perPage?: number } = {}) {
  const { base } = getEnv();
  const url = withAuth(
    `${base}/wp-json/wc/v3/products?per_page=${perPage}&status=publish`
  );
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [] as string[];
  const data = await parseWooJson<any[]>(res);
  return (data || []).map((p: any) => p.slug as string).filter(Boolean);
}

/** 是否屬於「促銷」分類（名稱含促銷，或 slug 含 discount） */
export function isPromoProduct(product: {
  categories?: Array<{ name?: string; slug?: string }>;
}): boolean {
  const cats = product?.categories || [];
  return cats.some((c) => {
    const name = String(c.name || "");
    const slug = String(c.slug || "").toLowerCase();
    return name.includes("促銷") || slug.includes("discount");
  });
}

export function filterHotProducts<T extends { categories?: Array<{ name?: string; slug?: string }> }>(
  products: T[],
): T[] {
  return products.filter((p) => !isPromoProduct(p));
}

export function filterPromoProducts<T extends { categories?: Array<{ name?: string; slug?: string }> }>(
  products: T[],
): T[] {
  return products.filter((p) => isPromoProduct(p));
}