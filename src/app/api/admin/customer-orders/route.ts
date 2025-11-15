// app/api/admin/customer-orders/route.ts
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

// 這裡可以用你的 isAdminEmail 做權限檢查（略）

export async function GET(req: Request) {
  const noCache = { "Cache-Control": "no-store, no-cache, must-revalidate" };
  try {
    const url = new URL(req.url);
    const customerId = url.searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { ok: false, message: "缺少 customerId" },
        { status: 400, headers: noCache }
      );
    }

    const session = await getServerSession(authOptions);
    // 如要限制只有管理員可看，在這裡檢查 session.user.email

    const auth = basicAuth();
    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "WooCommerce API 尚未設定 CK/CS" },
        { status: 500, headers: noCache }
      );
    }

    const res = await fetch(
      `${BASE}/wp-json/wc/v3/orders?customer=${customerId}&per_page=50&orderby=date&order=desc`,
      {
        headers: { Authorization: auth },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const txt = await res.text();
      console.error("Fetch customer orders error:", res.status, txt);
      return NextResponse.json(
        { ok: false, message: "取得訂單資料失敗" },
        { status: 500, headers: noCache }
      );
    }

    const raw = (await res.json()) as any[];

    const orders = raw.map((o) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      total: parseFloat(o.total || "0"),
      currency: o.currency,
      date_created: o.date_created,
      line_items: (o.line_items || []).map((li: any) => ({
        name: li.name,
        quantity: li.quantity,
      })),
    }));

    return NextResponse.json({ ok: true, orders }, { headers: noCache });
  } catch (e) {
    console.error("/api/admin/customer-orders error:", e);
    return NextResponse.json(
      { ok: false, message: "系統錯誤" },
      { status: 500, headers: noCache }
    );
  }
}
