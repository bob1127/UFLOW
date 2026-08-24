/**
 * 自動化圖片 alt：品牌 + 商品名 + 檔名語意 + 角色
 * 供商品畫廊、列表、說明 HTML、og:image 共用
 */

const BRAND = "UFLOW";

/** 明顯無意義／佔位 alt，應自動覆寫 */
const BAD_ALT_RE =
  /^(image|img|photo|picture|untitled|圖片|影像|照片|null|undefined|\d+)$/i;

function decodeSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** 從 URL 抽出可讀檔名關鍵字（去掉副檔名、尺寸後綴、雜湊） */
export function filenameKeywordsFromUrl(src?: string): string {
  if (!src?.trim()) return "";
  try {
    const path = src.split("?")[0];
    let name = path.split("/").pop() || "";
    name = decodeSafe(name);
    name = name.replace(/\.(?:webp|jpe?g|png|gif|avif|svg)$/i, "");
    name = name.replace(/-\d+x\d+$/i, "");
    // WordPress 編輯裁切後綴 -e1234567890
    name = name.replace(/-e\d{8,}$/i, "");
    name = name.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
    // 純雜湊／過短無語意
    if (!name || /^[a-f0-9]{8,}$/i.test(name) || name.length < 2) return "";
    return name;
  } catch {
    return "";
  }
}

function normalizeAlt(alt?: string | null): string {
  return String(alt || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isUsefulAlt(alt?: string | null): boolean {
  const cleaned = normalizeAlt(alt);
  if (!cleaned || cleaned.length < 2) return false;
  if (BAD_ALT_RE.test(cleaned)) return false;
  // 只有副檔名或路徑殘渣
  if (/\.(webp|jpe?g|png|gif|avif)$/i.test(cleaned)) return false;
  return true;
}

function includesIgnoreCase(haystack: string, needle: string): boolean {
  if (!needle) return true;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export type ImageAltRole =
  | "gallery"
  | "thumb"
  | "content"
  | "cover"
  | "og"
  | "list"
  | "zoom";

export type BuildImageAltOptions = {
  /** 商品／文章名稱 */
  name?: string;
  brand?: string;
  role?: ImageAltRole;
  /** 1-based 序號 */
  index?: number;
  src?: string;
  /** WordPress / 後台既有 alt，品質夠就沿用並補強 */
  existingAlt?: string | null;
};

/**
 * 產生 SEO／無障礙友善的 alt 文字
 *
 * 範例：
 * - UFLOW GABA鎂鎂香蜂草｜官方商品包裝圖
 * - UFLOW GABA鎂鎂香蜂草｜商品圖 2
 * - UFLOW GABA鎂鎂香蜂草｜成分說明 - 說明圖 1
 */
export function buildImageAlt(opts: BuildImageAltOptions = {}): string {
  const brand = (opts.brand || BRAND).trim() || BRAND;
  const product = normalizeAlt(opts.name);
  const role = opts.role || "gallery";
  const index = opts.index && opts.index > 0 ? opts.index : undefined;
  const fromFile = filenameKeywordsFromUrl(opts.src);
  const existing = normalizeAlt(opts.existingAlt);

  // 既有 alt 夠好：補上品牌／商品名（避免重複堆疊）
  if (isUsefulAlt(existing)) {
    let out = existing;
    if (product && !includesIgnoreCase(out, product)) {
      out = `${product}｜${out}`;
    }
    if (!includesIgnoreCase(out, brand)) {
      out = `${brand} ${out}`;
    }
    return out.replace(/\s+/g, " ").trim();
  }

  const roleLabel = (() => {
    switch (role) {
      case "thumb":
        return index ? `預覽縮圖 ${index}` : "預覽縮圖";
      case "content":
        return index ? `說明圖 ${index}` : "說明圖";
      case "cover":
        return "封面圖";
      case "og":
        return "社群分享商品圖";
      case "list":
        return "保健食品商品圖";
      case "zoom":
        return index ? `放大檢視 ${index}` : "放大檢視";
      case "gallery":
      default:
        if (index === 1) return "官方商品包裝圖";
        return index ? `商品圖 ${index}` : "官方商品圖";
    }
  })();

  // 檔名與商品名重複時不重複寫
  const filePart =
    fromFile && product && !includesIgnoreCase(product, fromFile) && !includesIgnoreCase(fromFile, product)
      ? fromFile
      : fromFile && !product
        ? fromFile
        : "";

  const parts: string[] = [brand];
  if (product) parts.push(product);

  const detail = [filePart, roleLabel].filter(Boolean).join(" - ");
  const core = parts.join(" ");
  return (detail ? `${core}｜${detail}` : core).replace(/\s+/g, " ").trim();
}

/** 批次：為畫廊 URL 陣列產生 alt */
export function buildGalleryAlts(
  urls: string[],
  productName: string,
  existingAlts?: Array<string | undefined | null>,
): string[] {
  return urls.map((src, i) =>
    buildImageAlt({
      name: productName,
      src,
      index: i + 1,
      role: "gallery",
      existingAlt: existingAlts?.[i],
    }),
  );
}
