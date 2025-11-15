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

function isAdminEmail(email?: string | null) {
  const adminList = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (!email) return false;
  return adminList.includes(email);
}

// 依照終身消費金額計算等級（你原本的規則）
function calcTier(totalSpent: number) {
  if (totalSpent >= 35000) return "VVIP 貴賓";
  if (totalSpent >= 10000) return "VIP 貴賓";
  if (totalSpent >= 6000) return "金貴賓";
  if (totalSpent >= 2000) return "銀貴賓";
  if (totalSpent > 0) return "銅貴賓";
  return "尚未消費";
}

// 🧮 針對單一顧客，從訂單重新計算金額 / 次數 / 最近日期
async function computeStatsFromOrders(
  customerId: number,
  authHeader: string
) {
  let page = 1;
  const perPage = 100;
  let totalSpent = 0;
  let ordersCount = 0;
  let lastOrderDate: string | null = null;

  while (true) {
    const res = await fetch(
      `${BASE}/wp-json/wc/v3/orders?customer=${customerId}&status=processing,completed&per_page=${perPage}&page=${page}`,
      {
        headers: { Authorization: authHeader },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      // 失敗就直接跳出，用預設 0
      break;
    }

    const batch = (await res.json()) as any[];

    if (!Array.isArray(batch) || batch.length === 0) break;

    for (const order of batch) {
      const t = parseFloat(order.total || "0");
      totalSpent += isNaN(t) ? 0 : t;
      ordersCount += 1;

      const created =
        order.date_created_gmt || order.date_created || order.date_paid;
      if (created) {
        const ts = new Date(created).getTime();
        if (!lastOrderDate || ts > new Date(lastOrderDate).getTime()) {
          lastOrderDate = created;
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

    // ✅ 如果之後要開啟權限檢查，再把這段打開即可
    // if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    //   return NextResponse.json(
    //     { ok: false, message: "無權限" },
    //     { status: 401, headers: noCache }
    //   );
    // }

    const auth = basicAuth();
    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "WooCommerce API 尚未設定 CK/CS" },
        { status: 500, headers: noCache }
      );
    }

    const perPage = 50;
    let page = 1;
    const allCustomers: any[] = [];

    // 先把 Woo 的 customer 列表全部抓出來
    while (true) {
      const res = await fetch(
        `${BASE}/wp-json/wc/v3/customers?per_page=${perPage}&page=${page}`,
        {
          headers: { Authorization: auth },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        console.error("Fetch customers error:", res.status, txt);
        return NextResponse.json(
          { ok: false, message: "取得顧客資料失敗" },
          { status: 500, headers: noCache }
        );
      }

      const batch = (await res.json()) as any[];

      if (!Array.isArray(batch) || batch.length === 0) break;

      allCustomers.push(...batch);

      if (batch.length < perPage) break;
      page += 1;
    }

    // 對每一個 customer，去訂單重算金額 / 次數 / 最近訂購
    const customers = await Promise.all(
      allCustomers.map(async (c) => {
        const stats = await computeStatsFromOrders(c.id, auth);

        const totalSpent =
          stats.totalSpent || parseFloat(c.total_spent || "0") || 0;
        const ordersCount =
          stats.ordersCount || Number(c.orders_count || 0) || 0;
        const lastOrderDate = stats.lastOrderDate || c.date_last_order;

        return {
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
        };
      })
    );

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
