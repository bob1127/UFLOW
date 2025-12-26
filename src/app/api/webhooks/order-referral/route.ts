// src/app/api/webhooks/order-referral/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BASE = process.env.WC_API_BASE!;
const CK = process.env.WC_CONSUMER_KEY!;
const CS = process.env.WC_CONSUMER_SECRET!;

function basicAuth() {
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

function parseRewardedList(val: any): number[] {
  try {
    const arr = JSON.parse(String(val || "[]"));
    return Array.isArray(arr) ? arr.map((x) => Number(x)).filter(Boolean) : [];
  } catch {
    return [];
  }
}

// ✅ 取得 customer：優先 customer_id，不行就用 billing.email
async function getCustomerFromOrder(order: any) {
  const authHeader = { Authorization: basicAuth() };

  const customerId = Number(order.customer_id || 0);
  if (customerId) {
    const cRes = await fetch(`${BASE}/wp-json/wc/v3/customers/${customerId}`, {
      headers: authHeader,
      cache: "no-store",
    });
    if (cRes.ok) return cRes.json();
  }

  const email = String(order?.billing?.email || "").trim().toLowerCase();
  if (!email) return null;

  const r2 = await fetch(
    `${BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
    { headers: authHeader, cache: "no-store" }
  );
  const arr = await r2.json();
  if (Array.isArray(arr) && arr.length > 0) return arr[0];

  return null;
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Woo webhook payload 通常就含 id，有時候是 {id:..} 有時候包在 resource
    const orderId = payload?.id || payload?.resource?.id;
    if (!orderId) return NextResponse.json({ ok: true });

    const authHeader = { Authorization: basicAuth() };

    // 1) 撈訂單
    const oRes = await fetch(`${BASE}/wp-json/wc/v3/orders/${orderId}`, {
      headers: authHeader,
      cache: "no-store",
    });
    if (!oRes.ok) {
      console.log("[order-referral] fetch order failed", orderId);
      return NextResponse.json({ ok: true });
    }

    const order = await oRes.json();
    const status = String(order.status || "").toLowerCase();

    console.log("[order-referral] got order", orderId, status);

    if (!["processing", "completed"].includes(status)) {
      return NextResponse.json({ ok: true });
    }

    // 2) 找到被推薦人的 customer（支援 guest）
    const customer = await getCustomerFromOrder(order);
    if (!customer?.id) {
      console.log("[order-referral] no customer found for order", orderId);
      return NextResponse.json({ ok: true });
    }

    const customerId = Number(customer.id);
    const cMeta: any[] = Array.isArray(customer.meta_data)
      ? customer.meta_data
      : [];

    const referredBy = Number(
      cMeta.find((m) => m.key === "uf_referred_by")?.value || 0
    );
    if (!referredBy) {
      console.log("[order-referral] order not referred", orderId);
      return NextResponse.json({ ok: true });
    }

    const firstOrderRewarded = cMeta.find(
      (m) => m.key === "uf_ref_first_order_rewarded" && String(m.value) === "1"
    );
    if (firstOrderRewarded) {
      console.log("[order-referral] already rewarded friend", customerId);
      return NextResponse.json({ ok: true });
    }

    // 3) 確認是第一筆有效訂單
    const allRes = await fetch(
      `${BASE}/wp-json/wc/v3/orders?customer=${customerId}&status=processing,completed&per_page=100`,
      { headers: authHeader, cache: "no-store" }
    );
    const allOrders = (await allRes.json()) as any[];
    const validOrders = Array.isArray(allOrders)
      ? allOrders.filter((o) =>
          ["processing", "completed"].includes(String(o.status))
        )
      : [];

    const isFirstValidOrder =
      validOrders.length === 1 &&
      Number(validOrders[0].id) === Number(orderId);

    if (!isFirstValidOrder) {
      console.log("[order-referral] not first valid order", customerId);
      return NextResponse.json({ ok: true });
    }

    // 4) 撈推薦人 meta，避免同訂單重發
    const aRes = await fetch(`${BASE}/wp-json/wc/v3/customers/${referredBy}`, {
      headers: authHeader,
      cache: "no-store",
    });
    if (!aRes.ok) {
      console.log("[order-referral] ambassador not found", referredBy);
      return NextResponse.json({ ok: true });
    }

    const ambassador = await aRes.json();
    const aMeta: any[] = Array.isArray(ambassador.meta_data)
      ? ambassador.meta_data
      : [];

    const rewardedListMeta = aMeta.find(
      (m) => m.key === "uf_ref_rewarded_orders"
    )?.value;
    const rewardedOrders = parseRewardedList(rewardedListMeta);

    if (rewardedOrders.includes(Number(orderId))) {
      console.log("[order-referral] order already rewarded", orderId);
      return NextResponse.json({ ok: true });
    }

    // 5) 建立推薦人 200 coupon（一筆推薦一碼）
    const code = `UFAMB-${referredBy}-${customerId}-${orderId}`;
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 6);

    // ✅ 先查是否存在，避免重複建立報錯
    const existRes = await fetch(
      `${BASE}/wp-json/wc/v3/coupons?code=${encodeURIComponent(code)}`,
      { headers: authHeader, cache: "no-store" }
    );
    const existArr = await existRes.json();
    if (Array.isArray(existArr) && existArr.length > 0) {
      console.log("[order-referral] coupon already exists", code);
      return NextResponse.json({ ok: true });
    }

    const cCreateRes = await fetch(`${BASE}/wp-json/wc/v3/coupons`, {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        discount_type: "fixed_cart",
        amount: "200",
        individual_use: true,
        usage_limit: 1,
        usage_limit_per_user: 1,
        email_restrictions: [ambassador.email],
        date_expires: expires.toISOString(),
        description: "金牌大使推薦首單回饋 200 元",
        meta_data: [
          { key: "uf_ref_ambassador_coupon", value: "1" },
          { key: "uf_referred_order_id", value: String(orderId) },
          { key: "uf_referred_customer_id", value: String(customerId) },
        ],
      }),
    });

    if (!cCreateRes.ok) {
      const errTxt = await cCreateRes.text();
      console.log("[order-referral] create coupon failed", errTxt);
      return NextResponse.json({ ok: true });
    }

    console.log("[order-referral] coupon created", code);

    // 6) 寫入雙方 meta 去重
    rewardedOrders.push(Number(orderId));

    await fetch(`${BASE}/wp-json/wc/v3/customers/${referredBy}`, {
      method: "PUT",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({
        meta_data: [
          {
            key: "uf_ref_rewarded_orders",
            value: JSON.stringify(rewardedOrders),
          },
        ],
      }),
    });

    await fetch(`${BASE}/wp-json/wc/v3/customers/${customerId}`, {
      method: "PUT",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({
        meta_data: [{ key: "uf_ref_first_order_rewarded", value: "1" }],
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("order referral webhook error:", e);
    return NextResponse.json({ ok: true });
  }
}
