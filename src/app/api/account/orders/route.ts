// app/api/account/orders/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE =
  process.env.WC_API_BASE || "https://inf.fjg.mybluehost.me/website_4ad5d5f2";
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

function basicAuth() {
  if (!CK || !CS) return undefined;
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

/**
 * 提取綠界支付資訊
 */
function extractPaymentDetails(metaData: any[]) {
  const info: any = {};
  if (!Array.isArray(metaData)) return undefined;

  metaData.forEach((item: any) => {
    const key = String(item.key || "").toLowerCase();
    const val = Array.isArray(item.value) ? String(item.value[0]) : String(item.value || "");

    if (key.includes("vaccount") || key.includes("virtual_account") || key.includes("atm_account")) {
      info.atm_account = val;
    }
    if (key.includes("bankcode") || key.includes("bank_code") || key.includes("atm_bank")) {
      info.bank_code = val;
    }
    if (key.includes("paymentno") || key.includes("cvs_payment") || key.includes("cvscode")) {
      info.cvs_code = val;
    }
    if (key.includes("expiredate") || key.includes("expire_date") || key.includes("duedate")) {
      info.expire_date = val;
    }
  });

  return Object.keys(info).length > 0 ? info : undefined;
}

export async function GET() {
  const noCache = { "Cache-Control": "no-store, no-cache, must-revalidate" };

  try {
    const auth = basicAuth();
    if (!auth) {
      return NextResponse.json({ ok: true, orders: [] }, { headers: noCache });
    }

    const session = await getServerSession(authOptions);
    const cookieStore = cookies();

    let email: string | null = session?.user?.email || null;
    let wpUserId: number | null = null;

    const emailCookie = cookieStore.get("user_email");
    if (!email && emailCookie?.value) {
      email = emailCookie.value;
    }

    const jwt = cookieStore.get("jwt")?.value;
    if (jwt) {
      try {
        const meRes = await fetch(`${BASE}/wp-json/wp/v2/users/me`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });
        if (meRes.ok) {
          const me = await meRes.json();
          wpUserId = typeof me?.id === "number" ? me.id : null;
          if (!email && me?.email) email = me.email;
        }
      } catch (e) {
        console.error("orders users/me error:", e);
      }
    }

    if (!email && !wpUserId) {
      return NextResponse.json({ ok: true, orders: [] }, { headers: noCache });
    }

    const normalizedEmail = email ? email.trim().toLowerCase() : null;
    let customerId: number | null = null;

    // 1. 透過 wpUserId 尋找
    if (wpUserId) {
      try {
        const byIdRes = await fetch(
          `${BASE}/wp-json/wc/v3/customers/${wpUserId}`,
          {
            headers: { Authorization: auth },
            cache: "no-store",
          }
        );
        if (byIdRes.ok) {
          const c = await byIdRes.json();
          if (c && c.id) customerId = c.id;
        }
      } catch (e) {
        console.error("orders fetch customer by id error:", e);
      }
    }

    // 2. 透過 Email 尋找 (🚨 關鍵修正：加入 role=all 讓 LINE 註冊的帳號也能被找到)
    if (!customerId && normalizedEmail) {
      try {
        const cRes = await fetch(
          `${BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(
            normalizedEmail
          )}&role=all`,
          {
            headers: { Authorization: auth },
            cache: "no-store",
          }
        );

        if (cRes.ok) {
          const customers = (await cRes.json().catch(() => [])) as any[];
          if (Array.isArray(customers) && customers.length > 0) {
            customerId = customers[0].id;
          }
        }
      } catch (e) {
        console.error("orders fetch customer by email catch error:", e);
      }

      // 3. 雙重保險：如果 WooCommerce 還是找不到，去 WordPress 底層找
      if (!customerId) {
        try {
          const wpRes = await fetch(
            `${BASE}/wp-json/wp/v2/users?search=${encodeURIComponent(normalizedEmail)}`,
            { headers: { Authorization: auth }, cache: "no-store" }
          );
          if (wpRes.ok) {
            const wpUsers = await wpRes.json();
            const matchedUser = wpUsers.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
            if (matchedUser) customerId = matchedUser.id;
          }
        } catch (e) {
          console.error("orders fallback to wp user error:", e);
        }
      }
    }

    let ordersRaw: any[] = [];

    // 如果成功找到會員 ID，直接撈取該會員所有訂單
    if (customerId) {
      try {
        const oRes = await fetch(
          `${BASE}/wp-json/wc/v3/orders?customer=${customerId}&per_page=20&orderby=date&order=desc`,
          {
            headers: { Authorization: auth },
            cache: "no-store",
          }
        );
        if (oRes.ok) {
          ordersRaw = (await oRes.json()) as any[];
        }
      } catch (e) {
        console.error("orders fetch by customer catch error:", e);
      }
    }

    // 終極保險：如果還是沒有訂單，嘗試用信箱暴力搜尋 (處理訪客結帳或未綁定情況)
    if ((!ordersRaw || ordersRaw.length === 0) && normalizedEmail) {
      try {
        const oRes = await fetch(
          `${BASE}/wp-json/wc/v3/orders?per_page=30&orderby=date&order=desc&search=${encodeURIComponent(
            normalizedEmail
          )}`,
          {
            headers: { Authorization: auth },
            cache: "no-store",
          }
        );

        if (oRes.ok) {
          const all = (await oRes.json()) as any[];
          ordersRaw = Array.isArray(all)
            ? all.filter((o) => {
                const emailInOrder = o?.billing?.email
                  ? String(o.billing.email).trim().toLowerCase()
                  : "";
                return emailInOrder === normalizedEmail;
              })
            : [];
        }
      } catch (e) {
        console.error("orders fallback search catch error:", e);
      }
    }

    // 整理回傳給前端
    const orders = (ordersRaw || []).map((o: any) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      date_created: o.date_created,
      total: o.total,
      currency: o.currency,
      payment_method_title: o.payment_method_title || "標準支付",
      customer_note: o.customer_note || "",
      payment_info: extractPaymentDetails(o.meta_data || []),
      meta_data: o.meta_data || [],
      line_items: (o.line_items || []).map((it: any) => ({
        name: it.name,
        quantity: it.quantity,
        total: it.total,
      })),
    }));

    return NextResponse.json({ ok: true, orders }, { headers: noCache });
  } catch (e) {
    console.error("/api/account/orders error:", e);
    return NextResponse.json({ ok: true, orders: [] }, { headers: noCache });
  }
}