/** 商品詳細說明 HTML 內圖片：升級為原圖 URL、滿版顯示、自動 alt（client 端可用） */

import { toSiteMediaPath } from "@/lib/mediaUrl";
import { buildImageAlt } from "@/lib/imageAlt";

const WP_SIZE_SUFFIX_RE = /-\d+x\d+(?=\.(?:webp|jpe?g|png|gif|avif)$)/i;

export function toFullSizeImageUrlClient(url: string): string {
  if (!url?.trim()) return url;
  try {
    const parsed = new URL(url, "https://www.uflow.space");
    ["w", "h", "quality", "q", "resize", "fit", "strip", "zoom"].forEach((k) =>
      parsed.searchParams.delete(k),
    );
    parsed.pathname = parsed.pathname.replace(WP_SIZE_SUFFIX_RE, "");
    return parsed.toString();
  } catch {
    return url.replace(WP_SIZE_SUFFIX_RE, "").split("?")[0];
  }
}

function removeDeadImage(img: HTMLImageElement) {
  img.removeAttribute("src");
  img.removeAttribute("srcset");
  img.alt = "";
  const figure = img.closest("figure");
  if (figure) {
    figure.remove();
    return;
  }
  const parent = img.parentElement;
  img.remove();
  if (parent && parent.tagName === "P" && parent.children.length === 0) {
    parent.remove();
  }
}

/** 解除 figure / 外層容器鎖定的寬度 */
function unlockImageWrappers(container: HTMLElement) {
  container
    .querySelectorAll("figure, .wp-block-image, .wp-caption, p, div, a")
    .forEach((node) => {
      const el = node as HTMLElement;
      if (!el.querySelector("img")) return;
      el.style.maxWidth = "100%";
      el.style.width = "100%";
      el.removeAttribute("width");
      el.removeAttribute("height");
      el.classList.remove(
        "size-thumbnail",
        "size-medium",
        "size-medium_large",
        "alignleft",
        "alignright",
      );
    });
}

/**
 * 將 WordPress 商品說明內的 <img> 改為原圖、滿寬顯示，並自動補齊 / 強化 alt
 */
export function upgradeProductContentImages(
  container: HTMLElement,
  productName: string,
) {
  unlockImageWrappers(container);

  container.querySelectorAll("img").forEach((img, index) => {
    if (img.complete && img.naturalWidth === 0) {
      removeDeadImage(img);
      return;
    }
    img.addEventListener("error", () => removeDeadImage(img), { once: true });

    const rawSrc =
      img.getAttribute("data-src") ||
      img.getAttribute("data-lazy-src") ||
      img.getAttribute("src") ||
      img.src;

    if (rawSrc) {
      const full = toSiteMediaPath(toFullSizeImageUrlClient(rawSrc));
      if (full && full !== img.getAttribute("src")) img.src = full;
    }

    const autoAlt = buildImageAlt({
      name: productName,
      src: img.getAttribute("src") || rawSrc || "",
      index: index + 1,
      role: "content",
      existingAlt: img.getAttribute("alt"),
    });
    img.setAttribute("alt", autoAlt);
    img.alt = autoAlt;

    if (!img.getAttribute("loading")) {
      img.setAttribute("loading", "lazy");
      img.loading = "lazy";
    }

    img.removeAttribute("width");
    img.removeAttribute("height");
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    img.removeAttribute("data-src");
    img.removeAttribute("data-lazy-src");

    img.style.cssText =
      "max-width:100%;width:100%;height:auto;display:block;margin:0 auto";
    img.classList.remove(
      "size-thumbnail",
      "size-medium",
      "size-medium_large",
      "size-large",
      "wp-image",
    );
  });
}
