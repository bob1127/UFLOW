/**
 * 將 WordPress / Bluehost 媒體 URL 改寫為前端正式網域路徑，
 * 搭配 next.config.mjs 的 /wp-content/uploads rewrite 代理。
 */

const WP_HOST = "inf.fjg.mybluehost.me";
const UPLOADS_PATH_RE = /\/wp-content\/uploads\/[^?#]+/i;

function getWpMediaBase(): string {
  return (
    process.env.WC_API_BASE ||
    "https://inf.fjg.mybluehost.me/website_4ad5d5f2"
  ).replace(/\/$/, "");
}

/** 從任意 WP / Jetpack URL 抽出 /wp-content/uploads/... 路徑 */
export function extractUploadsPath(url: string): string | null {
  if (!url?.trim()) return null;
  // 已是站內相對路徑
  if (url.startsWith("/wp-content/uploads/")) {
    return url.split("?")[0].replace(/-\d+x\d+(?=\.(?:webp|jpe?g|png|gif|avif)$)/i, "");
  }
  const match = url.match(UPLOADS_PATH_RE);
  if (!match) return null;
  return match[0].replace(/-\d+x\d+(?=\.(?:webp|jpe?g|png|gif|avif)$)/i, "");
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/** 是否為需代理的 WP 媒體（Bluehost、Jetpack，或已改寫的站內路徑） */
export function isWpHostedMedia(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("/wp-content/uploads/")) return true;
  if (!UPLOADS_PATH_RE.test(url)) return false;
  const host = hostOf(url);
  if (!host) return false;
  if (host === WP_HOST || host.endsWith(`.${WP_HOST}`)) return true;
  if (host.endsWith(".wp.com") && url.includes(WP_HOST)) return true;
  return false;
}

/**
 * HEAD / 驗證用：相對路徑還原成 WordPress 原始網址
 * （建置時公開網域未必可連，直接打 WP 來源較穩）
 */
export function toOriginMediaUrl(url: string): string {
  if (!url?.trim()) return url;
  const path = extractUploadsPath(url);
  if (path && (url.startsWith("/wp-content/") || isWpHostedMedia(url))) {
    // 已是相對路徑 → 拼回 WP
    if (url.startsWith("/")) {
      return `${getWpMediaBase()}${path}`;
    }
  }
  return url;
}

/**
 * 改寫為站內相對路徑，供 <img> / next/image 使用
 * 例：/wp-content/uploads/2024/01/GABA.png
 */
export function toSiteMediaPath(url: string): string {
  if (!url?.trim()) return url;
  if (!isWpHostedMedia(url)) return url;
  return extractUploadsPath(url) || url;
}

/**
 * 改寫為正式網域絕對 URL，供 Product Schema / og:image / 搜尋引擎使用
 * 例：https://www.uflow.space/wp-content/uploads/2024/01/GABA.png
 */
export function toSiteMediaUrl(url: string, siteUrl: string): string {
  if (!url?.trim()) return url;
  const path = extractUploadsPath(url);
  if (path && isWpHostedMedia(url)) {
    return `${String(siteUrl).replace(/\/$/, "")}${path}`;
  }
  // 已是同站絕對 URL
  try {
    const u = new URL(url, siteUrl);
    if (u.pathname.startsWith("/wp-content/uploads/")) {
      return `${String(siteUrl).replace(/\/$/, "")}${u.pathname}`;
    }
  } catch {
    /* ignore */
  }
  return url;
}

/** 批次改寫為正式網域絕對 URL */
export function toSiteMediaUrls(urls: string[], siteUrl: string): string[] {
  return urls.map((u) => toSiteMediaUrl(u, siteUrl));
}

/** 改寫 HTML 內所有 WP 媒體 src 為站內相對路徑 */
export function rewriteHtmlMediaUrls(html: string): string {
  if (!html?.trim()) return html;
  return html.replace(
    /https?:\/\/(?:i\d\.wp\.com\/)?inf\.fjg\.mybluehost\.me[^"'\\\s>]*\/wp-content\/uploads\/[^"'\\\s>?]+/gi,
    (full) => toSiteMediaPath(full.replace(/\\/g, "")),
  );
}
