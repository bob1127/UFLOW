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

function isExpired(coupon: any) {
  const expiresStr: string | null =
    coupon?.date_expires || coupon?.date_expires_gmt || null;

  if (!expiresStr) return false; // 沒到期日就視為未過期
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

  // 也可用 meta 判斷（更準）
  const meta: any[] = Array.isArray(coupon?.meta_data) ? coupon.meta_data : [];
  if (meta.some((m) => m.key === "uf_ref_friend_coupon" && String(m.value) === "1")) {
    return "ref_friend_50";
  }
  if (meta.some((m) => m.key === "uf_ref_ambassador_coupon" && String(m.value) === "1")) {
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

    const customerEmail: string = String(profile.customer.email || "").toLowerCase();
    if (!customerEmail) {
      return NextResponse.json({ ok: true, available: [] });
    }

    const authHeader = { Authorization: basicAuth() };

    // ✅ 1) 拉一批 coupons 回來（店小的話 per_page=100 很安全）
    // 若未來 coupons 很多，再改成分頁 + search 篩
    const res = await fetch(
      `${BASE}/wp-json/wc/v3/coupons?per_page=100&orderby=date&order=desc`,
      { headers: authHeader, cache: "no-store" }
    );

    if (!res.ok) return NextResponse.json({ ok: true, available: [] });

    const arr = await res.json();
    if (!Array.isArray(arr)) return NextResponse.json({ ok: true, available: [] });

    // ✅ 2) 只保留「符合 email_restrictions」或「共用券」的
    const mine = arr.filter((c) => {
      if (isExpired(c)) return false;

      const emails: string[] = Array.isArray(c.email_restrictions)
        ? c.email_restrictions.map((e: any) => String(e).toLowerCase())
        : [];

      // email_restrictions 空 => 共用券（升等/生日）
      if (emails.length === 0) return true;

      return emails.includes(customerEmail);
    });

    // ✅ 3) 整理輸出格式
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
