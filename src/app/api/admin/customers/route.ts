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

    if (!res.ok) {
      const txt = await res.text();
      console.error(
        "Fetch orders error:",
        res.status,
        txt,
        "customer:",
        customerId
      );
      break;
    }

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
    // 如要做權限控管，在這裡用 session.user.email 去比對 ADMIN_EMAILS

    const auth = basicAuth();
    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "WooCommerce API 尚未設定 CK/CS" },
        { status: 500, headers: noCache }
      );
    }

    // 1) 先把 Woo 的 customers 抓回來
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
        console.error("Fetch customers error:", res.status, txt, "url:", url);
        return NextResponse.json(
          {
            ok: false,
            message: `取得顧客資料失敗（Woo API 狀態碼 ${res.status}）`,
            detail: txt,
          },
          { status: 500, headers: noCache }
        );
      }

      const batch = (await res.json()) as any[];

      if (!Array.isArray(batch) || batch.length === 0) break;

      allCustomers.push(...batch);

      if (batch.length < perPage) break;
      page += 1;
    }

    // 2) 組出前端要的 customers，必要時用訂單重新計算 totalSpent
    const customers: any[] = [];

    for (const c of allCustomers) {
      let totalSpent = parseFloat(c.total_spent || "0") || 0;
      let ordersCount = Number(c.orders_count || 0) || 0;
      let lastOrderDate: string | null = c.date_last_order || null;

      // 如果 Woo 回來都是 0，就自己用訂單算一次
      if (totalSpent === 0 && ordersCount === 0) {
        try {
          const summary = await fetchOrdersSummaryForCustomer(c.id, auth);
          totalSpent = summary.totalSpent;
          ordersCount = summary.ordersCount;
          if (summary.lastOrderDate) {
            lastOrderDate = summary.lastOrderDate;
          }
        } catch (err) {
          console.error(
            "Recalculate customer totalSpent error:",
            c.id,
            err
          );
        }
      }

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
      });
    }

    return NextResponse.json(
      { ok: true, customers },
      { headers: noCache }
    );
  } catch (e) {
    console.error("admin/customers error:", e);
    return NextResponse.json(
      { ok: false, message: "系統錯誤" },
      { status: 500, headers: noCache }
    );
  }
}
