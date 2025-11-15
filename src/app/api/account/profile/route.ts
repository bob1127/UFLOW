// app/api/account/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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

// 分級規則（跟 /api/admin/customers 一致）
function calcTier(totalSpent: number) {
  if (totalSpent >= 35000) return "VVIP 貴賓";
  if (totalSpent >= 10000) return "VIP 貴賓";
  if (totalSpent >= 6000) return "金貴賓";
  if (totalSpent >= 2000) return "銀貴賓";
  if (totalSpent > 0) return "銅貴賓";
  return "尚未消費";
}

// 依照等級給一些說明文字（可依需求調整）
function buildMembershipPayload(totalSpent12m: number) {
  const tierName = calcTier(totalSpent12m);

  let discountLabel = "依活動公告";
  let upgradeGift = 0;
  let birthdayCredit = 0;
  let nextTierName: string | null = null;
  let nextNeedAmount: number | null = null;

  if (tierName === "尚未消費") {
    nextTierName = "U 銅貴賓";
    nextNeedAmount = 1; // 只要有消費就升銅
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
    // UVVIP 以上就不再往上
    nextTierName = null;
    nextNeedAmount = null;
  }

  // 這三個可以之後依照實際方案調整
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          loggedIn: false,
          customer: null,
          membership: null,
        },
        { headers: noCache }
      );
    }

    const email = session.user.email;
    const auth = basicAuth();
    if (!auth) {
      return NextResponse.json(
        { loggedIn: true, customer: null, membership: null, message: "WooCommerce API 尚未設定" },
        { headers: noCache, status: 500 }
      );
    }

    // 1) 用 email 找 WooCommerce customer
    const custRes = await fetch(
      `${BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
      {
        headers: { Authorization: auth },
        cache: "no-store",
      }
    );

    if (!custRes.ok) {
      const txt = await custRes.text();
      console.error("Fetch customer error:", custRes.status, txt);
      return NextResponse.json(
        {
          loggedIn: true,
          customer: null,
          membership: buildMembershipPayload(0),
        },
        { headers: noCache }
      );
    }

    const custArr = await custRes.json();
    const customer = Array.isArray(custArr) && custArr.length > 0 ? custArr[0] : null;

    if (!customer) {
      // 還沒有在 Woo 產生 customer 時，視為尚未消費
      return NextResponse.json(
        {
          loggedIn: true,
          customer: {
            email,
          },
          membership: buildMembershipPayload(0),
        },
        { headers: noCache }
      );
    }

    const customerId = customer.id;

    // 2) 計算最近 12 個月消費（包含 processing + completed 訂單）
    const now = new Date();
    const twelveMonthsAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate()
    );
    const afterIso = twelveMonthsAgo.toISOString();

    // Woo REST 支援 status 逗號分隔
    const ordersRes = await fetch(
      `${BASE}/wp-json/wc/v3/orders?customer=${customerId}&status=processing,completed&per_page=100&after=${encodeURIComponent(
        afterIso
      )}`,
      {
        headers: { Authorization: auth },
        cache: "no-store",
      }
    );

    let totalSpent12m = 0;

    if (ordersRes.ok) {
      const orders = (await ordersRes.json()) as any[];
      if (Array.isArray(orders)) {
        totalSpent12m = orders.reduce((sum, o) => {
          const t = parseFloat(o.total || "0");
          return sum + (isNaN(t) ? 0 : t);
        }, 0);
      }
    } else {
      const txt = await ordersRes.text();
      console.error("Fetch orders for membership error:", ordersRes.status, txt);
    }

    const membership = buildMembershipPayload(totalSpent12m);

    return NextResponse.json(
      {
        loggedIn: true,
        customer: {
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          username: customer.username,
        },
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
