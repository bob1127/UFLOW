import "server-only";

import { toOriginMediaUrl, toSiteMediaPath } from "@/lib/mediaUrl";
import { buildImageAlt } from "@/lib/imageAlt";

const IMG_TAG_RE = /<img\b[^>]*>/gi;
const SRC_ATTR_RE = /\bsrc=["']([^"']+)["']/i;
const ALT_ATTR_RE = /\balt=["']([^"']*)["']/i;
/** WordPress 尺寸後綴：file-225x300.png → file.png（保留 -e1234567890 編輯裁切後綴） */
const WP_SIZE_SUFFIX_RE = /-\d+x\d+(?=\.(?:webp|jpe?g|png|gif|avif)$)/i;

async function isImageUrlValid(url: string): Promise<boolean> {
  if (!url?.trim()) return false;
  const checkUrl = toOriginMediaUrl(url);
  try {
    const res = await fetch(checkUrl, {
      method: "HEAD",
      next: { revalidate: 3600 },
    });
    if (!res.ok) return false;
    const type = res.headers.get("content-type") || "";
    return type.startsWith("image/");
  } catch {
    return false;
  }
}

/** 去掉 WP 縮圖後綴與壓縮 query，改回原圖 URL */
export function toFullSizeImageUrl(url: string): string {
  if (!url?.trim()) return url;
  // 站內相對路徑：只清尺寸後綴
  if (url.startsWith("/wp-content/uploads/")) {
    return url.split("?")[0].replace(WP_SIZE_SUFFIX_RE, "");
  }
  try {
    const parsed = new URL(url);
    // Jetpack / Photon 常見壓縮參數
    ["w", "h", "quality", "q", "resize", "fit", "strip", "zoom"].forEach((k) =>
      parsed.searchParams.delete(k),
    );
    parsed.pathname = parsed.pathname.replace(WP_SIZE_SUFFIX_RE, "");
    return parsed.toString();
  } catch {
    return url.replace(WP_SIZE_SUFFIX_RE, "").split("?")[0];
  }
}

export async function filterValidImageUrls(urls: string[]): Promise<string[]> {
  const unique = Array.from(new Set(urls.filter(Boolean)));
  if (unique.length === 0) return [];

  const results = await Promise.all(
    unique.map(async (url) => ((await isImageUrlValid(url)) ? url : null)),
  );

  const valid = new Set(results.filter(Boolean) as string[]);
  return urls.filter((url) => valid.has(url));
}

/**
 * 清理商品／文章 HTML 內圖片：
 * 1. 無效圖移除
 * 2. WP medium/thumbnail URL 升級為原圖
 * 3. 去掉固定 width/height/srcset，避免前端被鎖成小圖
 * 4. 自動補齊 / 強化 alt（SEO）
 */
export async function sanitizeHtmlImages(
  html: string,
  productName?: string,
): Promise<string> {
  if (!html?.trim()) return html;

  const tags = Array.from(html.matchAll(IMG_TAG_RE)).map((m) => m[0]);
  if (tags.length === 0) return html;

  const srcPairs = tags.map((tag, index) => {
    const src = tag.match(SRC_ATTR_RE)?.[1] || "";
    const full = src ? toFullSizeImageUrl(src) : "";
    const existingAlt = tag.match(ALT_ATTR_RE)?.[1] ?? "";
    return { tag, src, full, existingAlt, index };
  });

  const candidates = Array.from(
    new Set(
      srcPairs.flatMap(({ src, full }) => [full, src].filter(Boolean)),
    ),
  );
  const valid = new Set(await filterValidImageUrls(candidates));

  let result = html;
  for (const { tag, src, full, existingAlt, index } of srcPairs) {
    // 優先原圖；驗證失敗也保留 URL，避免誤刪後台已上傳的圖
    const bestRaw =
      (full && valid.has(full) && full) ||
      (src && valid.has(src) && src) ||
      full ||
      src;
    if (!bestRaw) {
      result = result.replace(tag, "");
      continue;
    }
    // 對外改寫為 /wp-content/uploads/*（由 Next rewrite 代理）
    const best = toSiteMediaPath(bestRaw);
    const autoAlt = buildImageAlt({
      name: productName,
      src: best,
      index: index + 1,
      role: "content",
      existingAlt,
    });

    let next = tag
      .replace(/\sstyle=["'][^"']*["']/gi, "")
      .replace(/\s(?:width|height|srcset|sizes|data-src|data-lazy-src)=["'][^"']*["']/gi, "")
      .replace(/\s(?:width|height|srcset|sizes)=[^\s>]+/gi, "")
      .replace(SRC_ATTR_RE, `src="${best}"`)
      .replace(
        /\bclass=(["'])([^"']*)\1/i,
        (_m, q: string, cls: string) =>
          `class=${q}${cls
            .replace(/\bsize-(?:thumbnail|medium|medium_large|large|full)\b/gi, "")
            .replace(/\balign(?:left|right|center)\b/gi, "")
            .replace(/\s+/g, " ")
            .trim()}${q}`,
      );

    // 寫入 / 覆寫 alt
    if (ALT_ATTR_RE.test(next)) {
      next = next.replace(ALT_ATTR_RE, `alt="${autoAlt.replace(/"/g, "&quot;")}"`);
    } else {
      next = next.replace(/<img\b/i, `<img alt="${autoAlt.replace(/"/g, "&quot;")}"`);
    }

    // 一律覆寫 style，避免 WP 內嵌 width:150px 等小圖鎖定
    next = next.replace(
      /<img\b/i,
      '<img style="max-width:100%;width:100%;height:auto;display:block;margin:0 auto"',
    );

    result = result.replace(tag, next);
  }

  // figure / 外層容器也解除寬度鎖定
  result = result.replace(/<figure\b[^>]*>/gi, () =>
    '<figure style="max-width:100%;width:100%;margin:1.5rem auto">',
  );

  return result;
}
