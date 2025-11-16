import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth-options";

export const runtime = "nodejs";

const BASE =
  process.env.WC_API_BASE || "https://inf.fjg.mybluehost.me/website_4ad5d5f2";
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

function basicAuth() {
  if (!CK || !CS) return undefined;
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

/* ========= 會員分級邏輯 ========= */

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
  } else {
    nextTierName = null;
    nextNeedAmount = null;
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

/* ========= API: GET /api/account/profile ========= */

export async function GET() {
  const noCache = { "Cache-Control": "no-store, no-cache, must-revalidate" };

  try {
    const auth = basicAuth();
    if (!auth) {
      return NextResponse.json(
        {
          loggedIn: false,
          customer: null,
          membership: null,
          message: "WooCommerce API 尚未設定",
        },
        { status: 500, headers: noCache }
      );
    }

    const session = await getServerSession(authOptions);
    const cookieStore = cookies();

    // 1) 優先用 NextAuth session 的 email
    let email: string | null = session?.user?.email || null;

    // 2) 再用自訂 cookie（如果你有在登入時寫入 user_email）
    if (!email) {
      const emailCookie = cookieStore.get("user_email");
      if (emailCookie?.value) {
        email = emailCookie.value;
      }
    }

    // 3) 再用 JWT /users/me 拿 email
    if (!email) {
      const jwt = cookieStore.get("jwt")?.value;
      if (jwt) {
        try {
          const meRes = await fetch(`${BASE}/wp-json/wp/v2/users/me`, {
            headers: { Authorization: `Bearer ${jwt}` },
            cache: "no-store",
          });
          if (meRes.ok) {
            const me = await meRes.json();
            if (me?.email) {
              email = me.email;
            }
          }
        } catch (e) {
          console.error("/api/account/profile users/me error:", e);
        }
      }
    }

    if (!email) {
      // 完全拿不到 email，就視為未登入
      return NextResponse.json(
        { loggedIn: false, customer: null, membership: null },
        { headers: noCache }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 4) 用 email 查 WooCommerce customer
    let customer: any = null;
    try {
      const custRes = await fetch(
        `${BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(
          normalizedEmail
        )}`,
        {
          headers: { Authorization: auth },
          cache: "no-store",
        }
      );

      if (custRes.ok) {
        const custArr = await custRes.json();
        customer =
          Array.isArray(custArr) && custArr.length > 0 ? custArr[0] : null;
      } else {
        const txt = await custRes.text();
        console.error("Fetch customer by email error:", custRes.status, txt);
      }
    } catch (e) {
      console.error("Fetch customer by email catch error:", e);
    }

    // 5) 用訂單計算「近 12 個月」 processing + completed 的總金額
    let totalSpent12m = 0;
    const now = new Date();
    const twelveMonthsAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate()
    );
    const afterIso = twelveMonthsAgo.toISOString();

    let ordersForCalc: any[] = [];

    // 5-1) 先嘗試用 customer.id 撈訂單
    if (customer && customer.id) {
      try {
        const oRes = await fetch(
          `${BASE}/wp-json/wc/v3/orders?customer=${
            customer.id
          }&status=processing,completed&per_page=100&after=${encodeURIComponent(
            afterIso
          )}`,
          {
            headers: { Authorization: auth },
            cache: "no-store",
          }
        );

        if (oRes.ok) {
          const arr = (await oRes.json()) as any[];
          if (Array.isArray(arr)) {
            ordersForCalc = arr;
          }
        } else {
          const txt = await oRes.text();
          console.error(
            "membership orders by customer error:",
            oRes.status,
            txt
          );
        }
      } catch (e) {
        console.error("membership orders by customer catch error:", e);
      }
    }

    // 5-2) 如果用 customerId 撈不到，改用 billing.email fallback 搜尋
    if ((!ordersForCalc || ordersForCalc.length === 0) && normalizedEmail) {
      try {
        const oRes = await fetch(
          `${BASE}/wp-json/wc/v3/orders?per_page=100&orderby=date&order=desc&after=${encodeURIComponent(
            afterIso
          )}&search=${encodeURIComponent(normalizedEmail)}`,
          {
            headers: { Authorization: auth },
            cache: "no-store",
          }
        );

        if (oRes.ok) {
          const all = (await oRes.json()) as any[];
          if (Array.isArray(all)) {
            ordersForCalc = all.filter((o) => {
              const emailInOrder = o?.billing?.email
                ? String(o.billing.email).trim().toLowerCase()
                : "";
              const status = String(o.status || "").toLowerCase();
              // 只算 processing + completed
              const statusOk =
                status === "processing" || status === "completed";
              return (
                emailInOrder === normalizedEmail &&
                statusOk
              );
            });
          }
        } else {
          const txt = await oRes.text();
          console.error(
            "membership orders by billing email error:",
            oRes.status,
            txt
          );
        }
      } catch (e) {
        console.error("membership orders by billing email catch error:", e);
      }
    }

    if (Array.isArray(ordersForCalc) && ordersForCalc.length > 0) {
      totalSpent12m = ordersForCalc.reduce((sum, o) => {
        const t = parseFloat(o.total || "0");
        return sum + (Number.isNaN(t) ? 0 : t);
      }, 0);
    }

    const membership = buildMembershipPayload(totalSpent12m);

    const customerPayload =
      customer && customer.id
        ? {
            id: customer.id,
            email: customer.email,
            first_name: customer.first_name,
            last_name: customer.last_name,
            username: customer.username,
          }
        : { email: normalizedEmail };

    return NextResponse.json(
      {
        loggedIn: true,
        customer: customerPayload,
        membership,
      },
      { headers: noCache }
    );
  } catch (e) {
    console.error("/api/account/profile error:", e);
    return NextResponse.json(
      {
        loggedIn: false,
        customer: null,
        membership: null,
        message: "系統錯誤",
      },
      { status: 500, headers: noCache }
    );
  }
}
