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

async function fetchJson(url: string, init: RequestInit) {
  const r = await fetch(url, init);
  const text = await r.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { ok: r.ok, status: r.status, json, text };
}

// ✅ 取得 customer：優先 customer_id，不行就用 billing.email
async function getCustomerFromOrder(order: any) {
  const authHeader = { Authorization: basicAuth() };

  const customerId = Number(order?.customer_id || 0);
  if (customerId) {
    const cRes = await fetchJson(`${BASE}/wp-json/wc/v3/customers/${customerId}`, {
      headers: authHeader,
      cache: "no-store",
    });
    if (cRes.ok && cRes.json?.id) return cRes.json;
  }

  const email = String(order?.billing?.email || "").trim().toLowerCase();
  if (!email) return null;

  const r2 = await fetchJson(
    `${BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
    { headers: authHeader, cache: "no-store" }
  );
  const arr = r2.json;
  if (Array.isArray(arr) && arr.length > 0) return arr[0];

  return null;
}

/**
 * ✅ 關鍵修正點
 * 1) 200 元只在 order status = processing/completed 才發（避免 pending 就發）
 * 2) 「首單判斷」改用 billing.email 搜尋 + 比對（支援訪客單 customer_id=0）
 * 3) 仍保留 idempotency：用 uf_ref_rewarded_orders + coupon exist check 避免重複發
 *
 * 注意：
 * - 若你曾經把訂單改 completed 但當時沒觸發 webhook，可在後台「更新」訂單再觸發 order.updated webhook
 */
export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));

    // Woo webhook payload 通常就含 id，有時候是 {id:..} 有時候包在 resource
    const orderId = payload?.id || payload?.resource?.id;
    if (!orderId) return NextResponse.json({ ok: true });

    const authHeader = { Authorization: basicAuth() };

    // 1) 撈訂單
    const oRes = await fetchJson(`${BASE}/wp-json/wc/v3/orders/${orderId}`, {
      headers: authHeader,
      cache: "no-store",
    });
    if (!oRes.ok || !oRes.json?.id) {
      console.log("[order-referral] fetch order failed", orderId, oRes.status);
      return NextResponse.json({ ok: true });
    }

    const order = oRes.json;
    const status = String(order?.status || "").toLowerCase();
    console.log("[order-referral] got order", orderId, status);

    // ✅ 只在成功付款流程狀態才發 200（pending 時先不做）
    if (!["processing", "completed"].includes(status)) {
      console.log("[order-referral] skip status", orderId, status);
      return NextResponse.json({ ok: true });
    }

    // 2) 找到被推薦人的 customer（支援 guest → 用 email 找 customer）
    const customer = await getCustomerFromOrder(order);
    if (!customer?.id) {
      console.log("[order-referral] no customer found for order", orderId);
      return NextResponse.json({ ok: true });
    }

    const customerId = Number(customer.id);
    const cMeta: any[] = Array.isArray(customer.meta_data) ? customer.meta_data : [];

    const referredBy = Number(cMeta.find((m) => m.key === "uf_referred_by")?.value || 0);
    if (!referredBy) {
      console.log("[order-referral] order not referred (no uf_referred_by)", orderId);
      return NextResponse.json({ ok: true });
    }

    // 已發過（被推薦人第一單已獎勵）就不重複
    const firstOrderRewarded = cMeta.find(
      (m) => m.key === "uf_ref_first_order_rewarded" && String(m.value) === "1"
    );
    if (firstOrderRewarded) {
      console.log("[order-referral] already rewarded friend", customerId);
      return NextResponse.json({ ok: true });
    }

    // 3) ✅ 首單判斷：改用 billing.email（支援訪客單）
    const billingEmail = String(order?.billing?.email || "").trim().toLowerCase();
    if (!billingEmail) {
      console.log("[order-referral] no billing email, cannot determine first order", orderId);
      return NextResponse.json({ ok: true });
    }

    // 用 search 縮小範圍（Woo 的 search 不保證只搜 email，所以仍需二次 filter）
    const allRes = await fetchJson(
      `${BASE}/wp-json/wc/v3/orders?search=${encodeURIComponent(
        billingEmail
      )}&status=processing,completed&per_page=100&orderby=date&order=asc`,
      { headers: authHeader, cache: "no-store" }
    );

    const allOrdersRaw = allRes.json;
    const allOrders: any[] = Array.isArray(allOrdersRaw) ? allOrdersRaw : [];

    const validOrders = allOrders.filter((o) => {
      const s = String(o?.status || "").toLowerCase();
      const em = String(o?.billing?.email || "").trim().toLowerCase();
      return ["processing", "completed"].includes(s) && em === billingEmail;
    });

    // 這筆就是該 email 的第一筆有效訂單才發 200
    const isFirstValidOrder =
      validOrders.length > 0 && Number(validOrders[0]?.id) === Number(orderId);

    if (!isFirstValidOrder) {
      console.log(
        "[order-referral] not first valid order by email",
        billingEmail,
        "current:",
        orderId,
        "first:",
        validOrders[0]?.id
      );
      return NextResponse.json({ ok: true });
    }

    // 4) 撈推薦人資料 + 去重（避免同訂單重發）
    const aRes = await fetchJson(`${BASE}/wp-json/wc/v3/customers/${referredBy}`, {
      headers: authHeader,
      cache: "no-store",
    });
    if (!aRes.ok || !aRes.json?.id) {
      console.log("[order-referral] ambassador not found", referredBy);
      return NextResponse.json({ ok: true });
    }

    const ambassador = aRes.json;
    const aMeta: any[] = Array.isArray(ambassador.meta_data) ? ambassador.meta_data : [];

    const rewardedListMeta = aMeta.find((m) => m.key === "uf_ref_rewarded_orders")?.value;
    const rewardedOrders = parseRewardedList(rewardedListMeta);

    if (rewardedOrders.includes(Number(orderId))) {
      console.log("[order-referral] order already rewarded", orderId);
      return NextResponse.json({ ok: true });
    }

    // 5) 建立推薦人 200 coupon（一筆推薦一碼）
    const code = `UFAMB-${referredBy}-${customerId}-${orderId}`;
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 6);

    // 先查是否存在（雙重保險）
    const existRes = await fetchJson(
      `${BASE}/wp-json/wc/v3/coupons?code=${encodeURIComponent(code)}`,
      { headers: authHeader, cache: "no-store" }
    );
    if (Array.isArray(existRes.json) && existRes.json.length > 0) {
      console.log("[order-referral] coupon already exists", code);
      return NextResponse.json({ ok: true });
    }

    const ambassadorEmail = String(ambassador?.email || "").trim().toLowerCase();
    if (!ambassadorEmail) {
      console.log("[order-referral] ambassador has no email, cannot set email_restrictions", referredBy);
      return NextResponse.json({ ok: true });
    }

    const cCreateRes = await fetchJson(`${BASE}/wp-json/wc/v3/coupons`, {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        code,
        discount_type: "fixed_cart",
        amount: "200",
        individual_use: true,
        usage_limit: 1,
        usage_limit_per_user: 1,
        email_restrictions: [ambassadorEmail], // ✅ 只給推薦人
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
      console.log("[order-referral] create coupon failed", cCreateRes.status, cCreateRes.text);
      return NextResponse.json({ ok: true });
    }

    console.log("[order-referral] coupon created", code);

    // 6) 寫入雙方 meta 去重
    rewardedOrders.push(Number(orderId));

    await fetchJson(`${BASE}/wp-json/wc/v3/customers/${referredBy}`, {
      method: "PUT",
      headers: { ...authHeader, "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        meta_data: [
          {
            key: "uf_ref_rewarded_orders",
            value: JSON.stringify(rewardedOrders),
          },
        ],
      }),
    });

    await fetchJson(`${BASE}/wp-json/wc/v3/customers/${customerId}`, {
      method: "PUT",
      headers: { ...authHeader, "Content-Type": "application/json" },
      cache: "no-store",
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
