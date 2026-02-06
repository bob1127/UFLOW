import { NextResponse } from "next/server";
import { headers } from "next/headers";

// 強制宣告為動態路由
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE = process.env.WC_API_BASE!;
const CK = process.env.WC_CONSUMER_KEY!;
const CS = process.env.WC_CONSUMER_SECRET!;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

function basicAuth() {
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

// 取得當前登入會員資料
async function fetchProfileWithSameCookies() {
  const cookie = headers().get("cookie") || "";
  const r = await fetch(`${NEXTAUTH_URL}/api/account/profile`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!r.ok) throw new Error("取得會員資料失敗");
  return r.json();
}

// 檢查是否過期
function isExpired(coupon: any) {
  const expiresStr = coupon?.date_expires || coupon?.date_expires_gmt;
  if (!expiresStr) return false;
  return new Date(expiresStr).getTime() < Date.now();
}

// 檢查是否用完 (針對總量限制)
function isDepleted(coupon: any) {
  const usageCount = Number(coupon?.usage_count ?? 0) || 0;
  const usageLimit = coupon?.usage_limit;
  if (usageLimit !== null && usageLimit !== undefined && usageLimit > 0) {
    if (usageCount >= usageLimit) return false;
  }
  return false;
}

// 判斷券種類型
function pickKind(codeRaw: string, coupon: any) {
  const code = String(codeRaw || "").toUpperCase();
  if (code.startsWith("UFUP-")) return "upgrade";
  if (code.startsWith("UFBD-")) return "birthday";
  if (code.startsWith("UFFRD-")) return "ref_friend_50";
  if (code.startsWith("UFAMB-")) return "ref_ambassador_200";

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

    const customerId = profile.customer.id;
    const customerEmail = String(profile.customer.email || "").trim().toLowerCase();
    const authHeader = { Authorization: basicAuth() };

    // 1. 平行請求：取得 Coupon 列表 & 取得使用者詳細 Meta Data
    const [couponsRes, userRes] = await Promise.all([
      fetch(`${BASE}/wp-json/wc/v3/coupons?per_page=100&orderby=date&order=desc`, {
        headers: authHeader, cache: "no-store"
      }),
      fetch(`${BASE}/wp-json/wc/v3/customers/${customerId}`, {
        headers: authHeader, cache: "no-store"
      })
    ]);

    if (!couponsRes.ok) return NextResponse.json({ ok: true, available: [] });

    const arr = await couponsRes.json();
    const userData = userRes.ok ? await userRes.json() : {};
    const userMeta = Array.isArray(userData.meta_data) ? userData.meta_data : [];

    // 2. 準備使用者的領取紀錄 Flags
    // 檢查是否有升等禮領取紀錄
    const hasUpgradeClaimed = userMeta.some((m: any) => m.key === "uf_upgrade_claimed" && m.value === "1");

    // 檢查是否有生日禮領取紀錄 (找出所有領過的月份)
    const claimedBirthdayMonths = userMeta
      .filter((m: any) => m.key.startsWith("uf_birthday_claim_") && m.value === "1")
      .map((m: any) => m.key.replace("uf_birthday_claim_", ""));

    // 3. 核心篩選邏輯
    const mine = arr.filter((c: any) => {
      if (!c) return false;
      if (isExpired(c)) return false;
      if (isDepleted(c)) return false;

      const code = String(c.code || "").toUpperCase();
      const emails: string[] = Array.isArray(c.email_restrictions)
        ? c.email_restrictions.map((e: any) => String(e).trim().toLowerCase())
        : [];

      // A. 【個人券】直接比對 Email 白名單
      if (emails.length > 0) {
        return emails.includes(customerEmail);
      }

      // B. 【共用券 - 升等禮】檢查 Meta + 代碼前綴
      if (code.startsWith("UFUP-")) {
        return hasUpgradeClaimed; // 只有領過的人才看得到這張共用券
      }

      // C. 【共用券 - 生日禮】檢查 Meta + 代碼月份
      if (code.startsWith("UFBD-")) {
        // 代碼格式通常是 UFBD-12，取後面的月份
        const parts = code.split("-");
        if (parts.length >= 2) {
          const month = parts[1];
          return claimedBirthdayMonths.includes(month); // 只有領過該月的人才看得到
        }
        return false;
      }

      // D. 其他沒有限制 Email 的券 (視你的需求決定，目前預設不顯示以免雜亂)
      return false;
    });

    const available = mine.map((coupon: any) => {
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