/**
 * Blog 封面圖解析：優先可用的 gcm.org.tw，避開已失效的 mybluehost 路徑
 */

const FALLBACK = "/images/logo/uflow.png";

const PREFERRED_HOSTS = [
  "gcm.org.tw",
  "i0.wp.com",
  "i1.wp.com",
  "i2.wp.com",
  "d2w53g1q050m78.cloudfront.net",
];

const BROKEN_HOST = "inf.fjg.mybluehost.me";

function cleanUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("data:")) return null;
  return trimmed.split("?")[0];
}

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/** 把失效的 bluehost 路徑改寫成 gcm.org.tw/wp-content/uploads/{檔名} */
export function rewriteBluehostToGcm(url) {
  if (!url || !url.includes(BROKEN_HOST)) return null;
  const match = url.match(/\/([^/?#]+\.(?:webp|jpe?g|png|gif))$/i);
  if (!match) return null;
  // 去掉 WordPress 尺寸後綴：xxx-845x1024.webp → xxx.webp
  const filename = match[1].replace(
    /-\d+x\d+(?=\.(?:webp|jpe?g|png|gif)$)/i,
    "",
  );
  return `https://gcm.org.tw/wp-content/uploads/${filename}`;
}

/** 把文章 HTML 內失效的 bluehost 圖檔改寫為 gcm.org.tw */
export function rewritePostContentImages(html) {
  if (!html || typeof html !== "string") return html || "";
  return html.replace(
    /https?:\/\/inf\.fjg\.mybluehost\.me\/[^"'\s>]+\.(?:webp|jpe?g|png|gif)/gi,
    (url) => rewriteBluehostToGcm(url) || url,
  );
}

function collectCandidates(post) {
  const list = [];
  const push = (u) => {
    const cleaned = cleanUrl(u);
    if (cleaned && !list.includes(cleaned)) list.push(cleaned);
  };

  const featured = post?._embedded?.["wp:featuredmedia"]?.[0];
  if (featured) {
    const sizes = featured.media_details?.sizes || {};
    push(sizes.large?.source_url);
    push(sizes.full?.source_url);
    push(sizes.medium_large?.source_url);
    push(featured.source_url);
  }

  push(post?.jetpack_featured_media_url);

  const html = `${post?.content?.rendered || ""}${post?.excerpt?.rendered || ""}`;
  const imgSrcs = html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
  for (const m of imgSrcs) push(m[1]);

  return list;
}

/**
 * 從 WordPress post 抽出最適合當封面的圖片 URL
 * @param {object} post
 * @param {string} [fallback]
 */
export function getPostImageUrl(post, fallback = FALLBACK) {
  const candidates = collectCandidates(post);
  if (candidates.length === 0) return fallback;

  const pickPreferred = (url) => {
    const host = hostOf(url);
    if (PREFERRED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
      return url;
    }
    if (url.includes(BROKEN_HOST)) {
      return rewriteBluehostToGcm(url);
    }
    return null;
  };

  // 1) 依出現順序取第一張「可用或可改寫」的圖（封面通常是第一張）
  for (const url of candidates) {
    const picked = pickPreferred(url);
    if (picked) return picked;
  }

  // 2) 其餘可用相對路徑 / 其他 https（排除失效 bluehost）
  for (const url of candidates) {
    if (
      (url.startsWith("/") || url.startsWith("https://")) &&
      !url.includes(BROKEN_HOST)
    ) {
      return url;
    }
  }

  return fallback;
}
