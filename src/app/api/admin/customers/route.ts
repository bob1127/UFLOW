// app/api/admin/customers/route.ts
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

function calcTier(totalSpent: number) {
  if (totalSpent >= 35000) return "VVIP 貴賓";
  if (totalSpent >= 10000) return "VIP 貴賓";
  if (totalSpent >= 6000) return "金貴賓";
  if (totalSpent >= 2000) return "銀貴賓";
  if (totalSpent > 0) return "銅貴賓";
  return "尚未消費";
}

// 解析 meta array 取指定 key
function getMetaValue(meta: any[], key: string): any {
  return meta?.find((m) => m.key === key)?.value;
}

function parseRewardedList(val: any): number[] {
  try {
    const arr = JSON.parse(String(val || "[]"));
    return Array.isArray(arr) ? arr.map((x) => Number(x)).filter(Boolean) : [];
  } catch {
    return [];
  }
}

// ✅ 幫某個 customer 把訂單抓出來加總
async function fetchOrdersSummaryForCustomer(customerId: number, auth: string) {
  const perPage = 50;
  let page = 1;

  let totalSpent = 0;
  let ordersCount = 0;
  let lastOrderDate: string | null = null;

  while (true) {
    const url = `${BASE}/wp-json/wc/v3/orders?customer=${customerId}&per_page=${perPage}&page=${page}&status=any&orderby=date&order=desc`;

    const res = await fetch(url, {
      headers: { Authorization: auth },
      cache: "no-store",
    });

    if (!res.ok) break;

    const batch = (await res.json()) as any[];
    if (!Array.isArray(batch) || batch.length === 0) break;

    for (const o of batch) {
      const amount = parseFloat(o.total || "0") || 0;
      totalSpent += amount;
      ordersCount += 1;

      const d = o.date_created;
      if (d) {
        if (!lastOrderDate || new Date(d) > new Date(lastOrderDate)) {
          lastOrderDate = d;
        }
      }
    }

    if (batch.length < perPage) break;
    page += 1;
  }

  return { totalSpent, ordersCount, lastOrderDate };
}

export async function GET() {
  const noCache = { "Cache-Control": "no-store, no-cache, must-revalidate" };

  try {
    const session = await getServerSession(authOptions);
    // 如要做權限控管，在這裡檢查 session.user.email

    const auth = basicAuth();
    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "WooCommerce API 尚未設定 CK/CS" },
        { status: 500, headers: noCache }
      );
    }

    // 1) 抓全部 customers
    const perPage = 50;
    let page = 1;
    const allCustomers: any[] = [];

    while (true) {
      const url = `${BASE}/wp-json/wc/v3/customers?per_page=${perPage}&page=${page}`;

      const res = await fetch(url, {
        headers: { Authorization: auth },
        cache: "no-store",
      });

      if (!res.ok) {
        const txt = await res.text();
        return NextResponse.json(
          { ok: false, message: "取得顧客資料失敗", detail: txt },
          { status: 500, headers: noCache }
        );
      }

      const batch = (await res.json()) as any[];
      if (!Array.isArray(batch) || batch.length === 0) break;

      allCustomers.push(...batch);
      if (batch.length < perPage) break;
      page += 1;
    }

    // =============================
    // ✅ referral 統計：先掃一次 allCustomers
    // =============================
    const referredCountMap: Record<number, number> = {};
    const rewardedCountMap: Record<number, number> = {};

    for (const c of allCustomers) {
      const meta: any[] = Array.isArray(c.meta_data) ? c.meta_data : [];

      // 被推薦人 uf_referred_by → 推薦人 +1
      const referredBy = Number(getMetaValue(meta, "uf_referred_by") || 0);
      if (referredBy) {
        referredCountMap[referredBy] = (referredCountMap[referredBy] || 0) + 1;
      }

      // 推薦人 uf_ref_rewarded_orders → 已成功首單數
      const rewardedOrdersVal = getMetaValue(meta, "uf_ref_rewarded_orders");
      const rewardedOrders = parseRewardedList(rewardedOrdersVal);
      if (rewardedOrders.length > 0) {
        rewardedCountMap[c.id] = rewardedOrders.length;
      }
    }

    // 2) 組資料回前端
    const customers: any[] = [];

    for (const c of allCustomers) {
      let totalSpent = parseFloat(c.total_spent || "0") || 0;
      let ordersCount = Number(c.orders_count || 0) || 0;
      let lastOrderDate: string | null = c.date_last_order || null;

      if (totalSpent === 0 && ordersCount === 0) {
        try {
          const summary = await fetchOrdersSummaryForCustomer(c.id, auth);
          totalSpent = summary.totalSpent;
          ordersCount = summary.ordersCount;
          if (summary.lastOrderDate) lastOrderDate = summary.lastOrderDate;
        } catch {}
      }

      const referredCount = referredCountMap[c.id] || 0;
      const rewardedCount = rewardedCountMap[c.id] || 0;
      const referralEarned = rewardedCount * 200;

      customers.push({
        id: c.id,
        name:
          c.first_name || c.last_name
            ? `${c.first_name} ${c.last_name}`.trim()
            : c.username || c.email,
        email: c.email,
        username: c.username,
        createdAt: c.date_created,
        lastOrderDate,
        totalSpent,
        ordersCount,
        tier: calcTier(totalSpent),
        billingCity: c.billing?.city || "",
        billingCountry: c.billing?.country || "",

        // ✅ 回傳 referral 統計
        referredCount,        // 推薦註冊人數
        rewardedCount,        // 成功首單數
        referralEarned,       // 已賺推薦金
      });
    }

    return NextResponse.json({ ok: true, customers }, { headers: noCache });
  } catch (e) {
    console.error("admin/customers error:", e);
    return NextResponse.json(
      { ok: false, message: "系統錯誤" },
      { status: 500, headers: noCache }
    );
  }
}
