// src/app/api/account/coupons/available/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";

// 強制宣告為動態路由，因為使用了 headers() 獲取 Cookie
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE = process.env.WC_API_BASE!;
const CK = process.env.WC_CONSUMER_KEY!;
const CS = process.env.WC_CONSUMER_SECRET!;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

function basicAuth() {
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

async function fetchProfileWithSameCookies() {
  const cookie = headers().get("cookie") || "";
  const r = await fetch(`${NEXTAUTH_URL}/api/account/profile`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!r.ok) throw new Error("取得會員資料失敗");
  return r.json();
}

function isExpired(coupon: any) {
  const expiresStr: string | null =
    coupon?.date_expires || coupon?.date_expires_gmt || null;
  if (!expiresStr) return false;
  const exp = new Date(expiresStr);
  if (Number.isNaN(exp.getTime())) return false;
  return exp.getTime() < Date.now();
}

/** ✅ 用量是否已用完（usage_limit / usage_count） */
function isDepleted(coupon: any) {
  const usageCount = Number(coupon?.usage_count ?? 0) || 0;

  // usage_limit 可能是 0/null/undefined = 不限次
  const usageLimit = coupon?.usage_limit;
  if (usageLimit === null || usageLimit === undefined || usageLimit === 0) {
    return false;
  }
  const limitNum = Number(usageLimit) || 0;
  if (limitNum <= 0) return false;

  return usageCount >= limitNum;
}

function pickKind(codeRaw: string, coupon: any) {
  const code = String(codeRaw || "").toUpperCase();

  if (code.startsWith("UFUP-")) return "upgrade";
  if (code.startsWith("UFBD-")) return "birthday";
  if (code.startsWith("UFFRD-")) return "ref_friend_50";
  if (code.startsWith("UFAMB-")) return "ref_ambassador_200";

  const meta: any[] = Array.isArray(coupon?.meta_data) ? coupon.meta_data : [];

  if (
    meta.some(
      (m) => m.key === "uf_ref_friend_coupon" && String(m.value) === "1"
    )
  ) {
    return "ref_friend_50";
  }
  if (
    meta.some(
      (m) => m.key === "uf_ref_ambassador_coupon" && String(m.value) === "1"
    )
  ) {
    return "ref_ambassador_200";
  }

  return "other";
}

export async function GET() {
  try {
    const profile = await fetchProfileWithSameCookies();
    if (!profile?.loggedIn || !profile?.customer?.id) {
      return NextResponse.json({ ok: true, available: [] });
    }

    const customerEmail: string = String(profile.customer.email || "")
      .trim()
      .toLowerCase();

    if (!customerEmail) {
      return NextResponse.json({ ok: true, available: [] });
    }

    const authHeader = { Authorization: basicAuth() };

    const res = await fetch(
      `${BASE}/wp-json/wc/v3/coupons?per_page=100&orderby=date&order=desc`,
      { headers: authHeader, cache: "no-store" }
    );

    if (!res.ok) return NextResponse.json({ ok: true, available: [] });

    const arr = await res.json();
    if (!Array.isArray(arr)) return NextResponse.json({ ok: true, available: [] });

    /**
     * ✅ 重要修正：
     * 只回傳「明確限制到這個 email」的券（個人券 / 推薦券 / 生日券 / 升等券）
     * 避免把全站通用 coupon（email_restrictions = []）也算進來。
     */
    const mine = arr.filter((c) => {
      if (!c) return false;
      if (isExpired(c)) return false;
      if (isDepleted(c)) return false;

      const emails: string[] = Array.isArray(c.email_restrictions)
        ? c.email_restrictions.map((e: any) => String(e).trim().toLowerCase())
        : [];

      // ✅ 沒有限制 email 的券，一律不算「會員可用購物金」這種個人券
      if (emails.length === 0) return false;

      return emails.includes(customerEmail);
    });

    const available = mine.map((coupon) => {
      const code = String(coupon.code || "");
      return {
        kind: pickKind(code, coupon),
        code,
        amount: Number(coupon.amount) || 0,
        description: coupon.description || "",
        expires: coupon.date_expires || null,
        coupon,
      };
    });

    return NextResponse.json({ ok: true, available });
  } catch (e) {
    console.error("available coupon error:", e);
    return NextResponse.json({ ok: true, available: [] });
  }
}
