// src/app/api/account/coupons/available/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";

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

function pickKind(codeRaw: string, coupon: any) {
  const code = codeRaw.toUpperCase();
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

function isSharedCoupon(coupon: any) {
  const meta: any[] = Array.isArray(coupon?.meta_data) ? coupon.meta_data : [];
  return meta.some((m) => m.key === "uflow_is_shared" && String(m.value) === "1");
}

function normalizeEmailRestrictions(coupon: any) {
  const emails: string[] = Array.isArray(coupon?.email_restrictions)
    ? coupon.email_restrictions.map((e: any) => String(e).toLowerCase().trim()).filter(Boolean)
    : [];
  return emails;
}

export async function GET() {
  try {
    const profile = await fetchProfileWithSameCookies();
    if (!profile?.loggedIn || !profile?.customer?.id) {
      return NextResponse.json({ ok: true, available: [] });
    }

    const customerEmail: string = String(profile.customer.email || "")
      .toLowerCase()
      .trim();

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

    const mine = arr.filter((c) => {
      if (isExpired(c)) return false;

      const code = String(c.code || "");
      const kind = pickKind(code, c);

      const emails = normalizeEmailRestrictions(c);
      const shared = isSharedCoupon(c);

      // ✅ 1) 推薦券：一定要 email_restrictions 命中本人，不然不顯示（避免發錯人/被盜用）
      if (kind === "ref_friend_50" || kind === "ref_ambassador_200") {
        if (emails.length === 0) return false;
        return emails.includes(customerEmail);
      }

      // ✅ 2) 共享券（升等/生日）：允許 emails 空，但必須標記 shared
      if ((kind === "upgrade" || kind === "birthday") && shared) {
        return true;
      }

      // ✅ 3) 其他券：保守處理
      // - 有 email_restrictions：要命中本人
      // - 沒有 email_restrictions：不顯示（避免任何人都看到可用購物金）
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
