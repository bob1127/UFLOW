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
        // 把 Woo 的錯誤訊息也一起丟回去，方便你 debug
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

    const customers = allCustomers.map((c) => {
      const totalSpent = parseFloat(c.total_spent || "0") || 0;
      const ordersCount = Number(c.orders_count || 0) || 0;

      return {
        id: c.id,
        name:
          c.first_name || c.last_name
            ? `${c.first_name} ${c.last_name}`.trim()
            : c.username || c.email,
        email: c.email,
        username: c.username,
        createdAt: c.date_created,
        lastOrderDate: c.date_last_order || null,
        totalSpent,
        ordersCount,
        tier: calcTier(totalSpent),
        billingCity: c.billing?.city || "",
        billingCountry: c.billing?.country || "",
      };
    });

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
