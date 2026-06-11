import "server-only";

const IMG_SRC_RE = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;

async function isImageUrlValid(url: string): Promise<boolean> {
  if (!url?.trim()) return false;
  try {
    const res = await fetch(url, {
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

export async function filterValidImageUrls(urls: string[]): Promise<string[]> {
  const unique = Array.from(new Set(urls.filter(Boolean)));
  if (unique.length === 0) return [];

  const results = await Promise.all(
    unique.map(async (url) => ((await isImageUrlValid(url)) ? url : null)),
  );

  const valid = new Set(results.filter(Boolean) as string[]);
  return urls.filter((url) => valid.has(url));
}

export async function sanitizeHtmlImages(html: string): Promise<string> {
  if (!html?.trim()) return html;

  const srcs = Array.from(html.matchAll(IMG_SRC_RE)).map((m) => m[1]);
  if (srcs.length === 0) return html;

  const valid = new Set(await filterValidImageUrls(Array.from(new Set(srcs))));

  return html.replace(IMG_SRC_RE, (tag, src: string) =>
    valid.has(src) ? tag : "",
  );
}
