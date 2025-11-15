// app/api/account/orders/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

export async function GET() {
  const noCache = { "Cache-Control": "no-store, no-cache, must-revalidate" };

  try {
    const auth = basicAuth();
    if (!auth) {
      return NextResponse.json({ orders: [] }, { headers: noCache });
    }

    /* ===== 1) 先看 NextAuth Session ===== */
    const session = await getServerSession(authOptions);
    let email: string | null = session?.user?.email || null;

    /* ===== 2) 如果沒有 Session，再看 JWT ===== */
    if (!email) {
      const jwt = cookies().get("jwt")?.value;
      if (jwt) {
        const meRes = await fetch(`${BASE}/wp-json/wp/v2/users/me`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });
        if (meRes.ok) {
          const me = await meRes.json();
          email = me?.email || null;
        }
      }
    }

    if (!email) {
      return NextResponse.json({ orders: [] }, { headers: noCache });
    }

    // 用 email 找 WooCommerce customerId
    const cRes = await fetch(
      `${BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
      {
        headers: { Authorization: auth },
        cache: "no-store",
      }
    );
    const customers = (await cRes.json().catch(() => [])) as any[];
    const customerId = customers?.[0]?.id;
    if (!customerId) {
      return NextResponse.json({ orders: [] }, { headers: noCache });
    }

    // 撈最近 10 筆訂單
    const oRes = await fetch(
      `${BASE}/wp-json/wc/v3/orders?customer=${customerId}&per_page=10&orderby=date&order=desc`,
      {
        headers: { Authorization: auth },
        cache: "no-store",
      }
    );

    if (!oRes.ok) {
      return NextResponse.json({ orders: [] }, { headers: noCache });
    }

    const ordersRaw = (await oRes.json()) as any[];

    const orders = ordersRaw.map((o: any) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      date_created: o.date_created,
      total: o.total,
      currency: o.currency,
      line_items: (o.line_items || []).map((it: any) => ({
        name: it.name,
        quantity: it.quantity,
      })),
    }));

    return NextResponse.json({ orders }, { headers: noCache });
  } catch (e) {
    return NextResponse.json({ orders: [] }, { headers: noCache });
  }
}
