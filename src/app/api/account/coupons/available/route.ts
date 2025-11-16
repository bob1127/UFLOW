import { NextResponse } from "next/server";
import { headers } from "next/headers";

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

const COUPON_PREFIX_UPGRADE = "ufxup";
const COUPON_PREFIX_BIRTHDAY = "ufxbd";

export async function GET() {
  try {
    const profile = await fetchProfileWithSameCookies();
    if (!profile?.loggedIn || !profile?.customer?.id) {
      // 未登入就沒有可用禮券
      return NextResponse.json({ ok: true, available: [] });
    }

    const year = new Date().getFullYear();

    // 當年度可能存在的兩種券碼（升等 + 生日）
    const possibleCodes = [
      { kind: "upgrade", code: `${COUPON_PREFIX_UPGRADE}-${year}` },
      { kind: "birthday", code: `${COUPON_PREFIX_BIRTHDAY}-${year}` },
    ];

    const authHeader = { Authorization: basicAuth() };
    const result: any[] = [];

    for (const { kind, code } of possibleCodes) {
      const res = await fetch(
        `${BASE}/wp-json/wc/v3/coupons?code=${encodeURIComponent(code)}`,
        { headers: authHeader, cache: "no-store" }
      );
      if (!res.ok) continue;

      const arr = await res.json();
      if (!Array.isArray(arr) || arr.length === 0) continue;

      const coupon = arr[0];

      const expiresStr: string | null =
        coupon.date_expires || coupon.date_expires_gmt || null;

      if (expiresStr) {
        const exp = new Date(expiresStr);
        if (!Number.isNaN(exp.getTime()) && exp.getTime() < Date.now()) {
          continue; // 已過期
        }
      }

      result.push({
        kind,
        code: coupon.code,
        amount: Number(coupon.amount) || 0,
        coupon,
      });
    }

    return NextResponse.json({ ok: true, available: result });
  } catch (e) {
    console.error("available coupon error:", e);
    return NextResponse.json({ ok: true, available: [] });
  }
}
