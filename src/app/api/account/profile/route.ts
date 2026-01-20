// src/app/api/account/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken"; // ✅ 新增：用來解密 auth_token
import { authOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE =
  process.env.WC_API_BASE || "https://inf.fjg.mybluehost.me/website_4ad5d5f2";
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;
// ✅ 新增：必須跟登入/註冊時用的加密鑰匙一樣
const JWT_SECRET = process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET || "secret";

function basicAuth() {
  if (!CK || !CS) return undefined;
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

function parseAdminEmails() {
  return String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/* ========= 會員分級邏輯 (保持不變) ========= */
function calcTier(totalSpent: number) {
  if (totalSpent >= 35000) return "VVIP 貴賓";
  if (totalSpent >= 10000) return "VIP 貴賓";
  if (totalSpent >= 6000) return "金貴賓";
  if (totalSpent >= 2000) return "銀貴賓";
  if (totalSpent > 0) return "銅貴賓";
  return "尚未消費";
}

function buildMembershipPayload(totalSpent12m: number) {
  const tierName = calcTier(totalSpent12m);
  let discountLabel = "依活動公告";
  let upgradeGift = 0;
  let birthdayCredit = 0;
  let nextTierName: string | null = null;
  let nextNeedAmount: number | null = null;

  if (tierName === "尚未消費") {
    nextTierName = "U 銅貴賓";
    nextNeedAmount = 1;
  } else if (tierName === "銅貴賓") {
    nextTierName = "U 銀貴賓";
    nextNeedAmount = Math.max(0, 2000 - totalSpent12m);
  } else if (tierName === "銀貴賓") {
    nextTierName = "U 金貴賓";
    nextNeedAmount = Math.max(0, 6000 - totalSpent12m);
  } else if (tierName === "金貴賓") {
    nextTierName = "UVIP 貴賓";
    nextNeedAmount = Math.max(0, 10000 - totalSpent12m);
  } else if (tierName === "VIP 貴賓") {
    nextTierName = "VVIP 貴賓";
    nextNeedAmount = Math.max(0, 35000 - totalSpent12m);
  }

  switch (tierName) {
    case "銅貴賓":
      discountLabel = "消費享 95 折";
      birthdayCredit = 50;
      break;
    case "銀貴賓":
      discountLabel = "消費享 9 折";
      birthdayCredit = 80;
      break;
    case "金貴賓":
      discountLabel = "消費享 88 折";
      birthdayCredit = 100;
      upgradeGift = 50;
      break;
    case "VIP 貴賓":
      discountLabel = "消費享 85 折";
      birthdayCredit = 150;
      upgradeGift = 100;
      break;
    case "VVIP 貴賓":
      discountLabel = "專屬 VIP 優惠";
      birthdayCredit = 200;
      upgradeGift = 150;
      break;
  }

  return {
    tierName,
    totalSpent12m,
    discountLabel,
    upgradeGift,
    birthdayCredit,
    nextTierName,
    nextNeedAmount,
  };
}

export async function GET() {
  const noCache = { "Cache-Control": "no-store, no-cache, must-revalidate" };

  try {
    const auth = basicAuth();
    if (!auth) {
      // 容錯：如果沒設 WC KEY，還是回傳未登入狀態，不要直接 500
      console.error("WooCommerce API keys missing");
      return NextResponse.json(
        { loggedIn: false, customer: null, membership: null },
        { headers: noCache }
      );
    }

    const session = await getServerSession(authOptions);
    const cookieStore = cookies();

    let email: string | null = session?.user?.email || null;

    // 1. 檢查舊的 user_email cookie
    if (!email) {
      const emailCookie = cookieStore.get("user_email");
      if (emailCookie?.value) email = emailCookie.value;
    }

    // 2. ✅ 新增：檢查 auth_token (LINE/一般登入用的)
    if (!email) {
      const authToken = cookieStore.get("auth_token")?.value;
      if (authToken) {
        try {
          // 解密 Token 取得 email
          const decoded = jwt.verify(authToken, JWT_SECRET) as any;
          if (decoded?.email) {
            email = decoded.email;
          }
        } catch (e) {
          console.error("auth_token verify failed:", e);
        }
      }
    }

    // 3. 檢查舊的 jwt cookie (WordPress User)
    if (!email) {
      const jwtVal = cookieStore.get("jwt")?.value;
      if (jwtVal) {
        try {
          const meRes = await fetch(`${BASE}/wp-json/wp/v2/users/me`, {
            headers: { Authorization: `Bearer ${jwtVal}` },
            cache: "no-store",
          });
          if (meRes.ok) {
            const me = await meRes.json();
            if (me?.email) email = me.email;
          }
        } catch (e) {
          console.error("users/me error", e);
        }
      }
    }

    // 如果所有方法都找不到 email，就是未登入
    if (!email) {
      return NextResponse.json(
        { loggedIn: false, customer: null, membership: null, isAdmin: false },
        { headers: noCache }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const adminEmails = parseAdminEmails();
    const isAdmin = adminEmails.includes(normalizedEmail);

    // ===== Fetch WC customer by email
    let customer: any = null;
    const custRes = await fetch(
      `${BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(normalizedEmail)}`,
      {
        headers: { Authorization: auth },
        cache: "no-store",
      }
    );

    if (custRes.ok) {
      const custArr = await custRes.json();
      customer = Array.isArray(custArr) && custArr.length > 0 ? custArr[0] : null;
    }

    // ===== Calculate spent in last 12 months
    let totalSpent12m = 0;
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    const afterIso = twelveMonthsAgo.toISOString();

    let ordersForCalc: any[] = [];

    if (customer?.id) {
      const oRes = await fetch(
        `${BASE}/wp-json/wc/v3/orders?customer=${customer.id}&status=processing,completed&per_page=100&after=${encodeURIComponent(afterIso)}`,
        {
          headers: { Authorization: auth },
          cache: "no-store",
        }
      );
      if (oRes.ok) ordersForCalc = await oRes.json();
    }

    // Fallback: 如果用 ID 查不到，用 Email 搜搜看 (有些 guest checkout 訂單)
    if (ordersForCalc.length === 0 && normalizedEmail) {
      const oRes = await fetch(
        `${BASE}/wp-json/wc/v3/orders?per_page=100&after=${encodeURIComponent(afterIso)}&search=${encodeURIComponent(normalizedEmail)}`,
        {
          headers: { Authorization: auth },
          cache: "no-store",
        }
      );
      if (oRes.ok) {
        const all = await oRes.json();
        ordersForCalc = all.filter(
          (o: any) =>
            o?.billing?.email?.toLowerCase() === normalizedEmail &&
            (o.status === "processing" || o.status === "completed")
        );
      }
    }

    totalSpent12m = ordersForCalc.reduce(
      (sum, o) => sum + (parseFloat(o.total) || 0),
      0
    );

    const membership = buildMembershipPayload(totalSpent12m);

    const customerPayload = customer?.id
      ? {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        username: customer.username,
        avatar_url: customer.avatar_url, // 如果有的話
      }
      : { email: normalizedEmail };

    return NextResponse.json(
      { loggedIn: true, customer: customerPayload, membership, isAdmin },
      { headers: noCache }
    );
  } catch (e) {
    console.error("/api/account/profile error:", e);
    return NextResponse.json(
      { loggedIn: false, message: "系統錯誤", isAdmin: false },
      { status: 500, headers: noCache }
    );
  }
}