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

async function wcFetch(path: string, init?: RequestInit) {
  const headers = {
    Authorization: basicAuth(),
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  } as Record<string, string>;

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  return res;
}

// ✅ 取得 customer：優先 customer_id，不行就用 billing.email
async function getCustomerFromOrder(order: any) {
  const orderCustomerId = Number(order?.customer_id || 0);

  // 1) 訂單有 customer_id → 直接取 customer
  if (orderCustomerId) {
    const cRes = await wcFetch(`/wp-json/wc/v3/customers/${orderCustomerId}`);
    if (cRes.ok) {
      const c = await cRes.json();
      return { customer: c, byEmail: false };
    }
  }

  // 2) 訪客訂單 → 用 billing.email 找 customer
  const email = String(order?.billing?.email || "").trim().toLowerCase();
  if (!email) return { customer: null, byEmail: false };

  const r2 = await wcFetch(
    `/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`
  );
  const arr = await r2.json().catch(() => []);
  if (Array.isArray(arr) && arr.length > 0) return { customer: arr[0], byEmail: true };

  return { customer: null, byEmail: true };
}

// ✅ 若是訪客訂單，把 order.customer_id 補綁到找到的 customer.id
async function attachOrderToCustomer(orderId: number, customerId: number) {
  const putRes = await wcFetch(`/wp-json/wc/v3/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ customer_id: customerId }),
  });

  if (!putRes.ok) {
    const t = await putRes.text().catch(() => "");
    console.log("[order-referral] attachOrderToCustomer failed", orderId, customerId, t);
    return false;
  }

  console.log("[order-referral] attached order to customer", orderId, customerId);
  return true;
}

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));

    // Woo webhook payload 通常就含 id，有時候是 {id:..} 有時候包在 resource
    const orderId = Number(payload?.id || payload?.resource?.id || 0);
    if (!orderId) return NextResponse.json({ ok: true });

    // 1) 撈訂單
    const oRes = await wcFetch(`/wp-json/wc/v3/orders/${orderId}`);
    if (!oRes.ok) {
      console.log("[order-referral] fetch order failed", orderId);
      return NextResponse.json({ ok: true });
    }

    const order = await oRes.json();
    const status = String(order?.status || "").toLowerCase();

    console.log("[order-referral] got order", orderId, status, "customer_id=", order?.customer_id);

    // 只處理付款後狀態
    if (!["processing", "completed"].includes(status)) {
      console.log("[order-referral] skip status", orderId, status);
      return NextResponse.json({ ok: true });
    }

    // 2) 找到被推薦人的 customer（支援 guest）
    const { customer, byEmail } = await getCustomerFromOrder(order);
    if (!customer?.id) {
      console.log("[order-referral] no customer found for order", orderId, "byEmail=", byEmail);
      return NextResponse.json({ ok: true });
    }

    const customerId = Number(customer.id);

    // ✅ 如果訂單是訪客單(customer_id=0)，把它補綁到 customerId
    const orderCustomerId = Number(order?.customer_id || 0);
    if (!orderCustomerId && customerId) {
      await attachOrderToCustomer(orderId, customerId);
    }

    const cMeta: any[] = Array.isArray(customer.meta_data) ? customer.meta_data : [];

    const referredBy = Number(cMeta.find((m) => m.key === "uf_referred_by")?.value || 0);
    if (!referredBy) {
      console.log("[order-referral] order not referred", orderId, "customerId=", customerId);
      return NextResponse.json({ ok: true });
    }

    const firstOrderRewarded = cMeta.find(
      (m) => m.key === "uf_ref_first_order_rewarded" && String(m.value) === "1"
    );
    if (firstOrderRewarded) {
      console.log("[order-referral] already rewarded friend", customerId);
      return NextResponse.json({ ok: true });
    }

    // 3) 確認是第一筆有效訂單（processing/completed）
    const allRes = await wcFetch(
      `/wp-json/wc/v3/orders?customer=${customerId}&status=processing,completed&per_page=100`
    );

    const allOrders = (await allRes.json().catch(() => [])) as any[];
    const validOrders = Array.isArray(allOrders)
      ? allOrders.filter((o) => ["processing", "completed"].includes(String(o.status)))
      : [];

    const isFirstValidOrder =
      validOrders.length === 1 && Number(validOrders[0].id) === Number(orderId);

    if (!isFirstValidOrder) {
      console.log(
        "[order-referral] not first valid order",
        "customerId=",
        customerId,
        "validOrders=",
        validOrders.map((o) => o.id)
      );
      return NextResponse.json({ ok: true });
    }

    // 4) 撈推薦人資料（避免同訂單重發）
    const aRes = await wcFetch(`/wp-json/wc/v3/customers/${referredBy}`);
    if (!aRes.ok) {
      console.log("[order-referral] ambassador not found", referredBy);
      return NextResponse.json({ ok: true });
    }

    const ambassador = await aRes.json();
    const ambassadorEmail = String(ambassador?.email || "").trim().toLowerCase();
    if (!ambassadorEmail) {
      console.log("[order-referral] ambassador email missing", referredBy);
      return NextResponse.json({ ok: true });
    }

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

    const existRes = await wcFetch(
      `/wp-json/wc/v3/coupons?code=${encodeURIComponent(code)}`
    );
    const existArr = await existRes.json().catch(() => []);
    if (Array.isArray(existArr) && existArr.length > 0) {
      console.log("[order-referral] coupon already exists", code);
      return NextResponse.json({ ok: true });
    }

    const cCreateRes = await wcFetch(`/wp-json/wc/v3/coupons`, {
      method: "POST",
      body: JSON.stringify({
        code,
        discount_type: "fixed_cart",
        amount: "200",
        individual_use: true,
        usage_limit: 1,
        usage_limit_per_user: 1,
        email_restrictions: [ambassadorEmail],
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
      const errTxt = await cCreateRes.text().catch(() => "");
      console.log("[order-referral] create coupon failed", errTxt);
      return NextResponse.json({ ok: true });
    }

    console.log("[order-referral] coupon created", code);

    // 6) 寫入雙方 meta 去重
    rewardedOrders.push(Number(orderId));

    await wcFetch(`/wp-json/wc/v3/customers/${referredBy}`, {
      method: "PUT",
      body: JSON.stringify({
        meta_data: [
          { key: "uf_ref_rewarded_orders", value: JSON.stringify(rewardedOrders) },
        ],
      }),
    });

    await wcFetch(`/wp-json/wc/v3/customers/${customerId}`, {
      method: "PUT",
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
