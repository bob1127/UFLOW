// app/api/account/orders/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// 強制宣告為動態路由，因為使用了 cookies()
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
 * 💡 新增：從 meta_data 中提取綠界或其他金流的支付資訊
 */
function extractPaymentDetails(metaData: any[]) {
  const info: any = {};
  if (!Array.isArray(metaData)) return undefined;

  metaData.forEach((item: any) => {
    const key = String(item.key).toLowerCase();
    const val = item.value;

    // 匹配超商繳費代碼 (綠界常見 Key: _PaymentNo, _payment_no)
    if (key.includes("payment_no") || key === "_paymentno") {
      info.cvs_code = val;
    }
    // 匹配繳費期限 (綠界常見 Key: _ExpireDate, _expire_date)
    if (key.includes("expire_date") || key === "_expiredate") {
      info.expire_date = val;
    }
    // 匹配 ATM 虛擬帳號
    if (key.includes("vaccount") || key === "_atmbankcode") {
      info.atm_account = val;
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

    if (!customerId && normalizedEmail) {
      try {
        const cRes = await fetch(
          `${BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(
            normalizedEmail
          )}`,
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
    }

    let ordersRaw: any[] = [];

    if (customerId) {
      try {
        const oRes = await fetch(
          `${BASE}/wp-json/wc/v3/orders?customer=${customerId}&per_page=10&orderby=date&order=desc`,
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

    if ((!ordersRaw || ordersRaw.length === 0) && normalizedEmail) {
      try {
        const oRes = await fetch(
          `${BASE}/wp-json/wc/v3/orders?per_page=20&orderby=date&order=desc&search=${encodeURIComponent(
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

    // 💡 關鍵修改：在回傳前，將支付方式標題與 meta_data 中的支付資訊提取出來
    const orders = (ordersRaw || []).map((o: any) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      date_created: o.date_created,
      total: o.total,
      currency: o.currency,
      // 新增：提取支付方式名稱（如：綠界科技 ECPay）
      payment_method_title: o.payment_method_title || "標準支付",
      // 新增：掃描 meta_data 提取繳費代碼與期限
      payment_info: extractPaymentDetails(o.meta_data || []),
      line_items: (o.line_items || []).map((it: any) => ({
        name: it.name,
        quantity: it.quantity,
        // 加入金額，讓前端展開時可以顯示品項小計
        total: it.total,
      })),
    }));

    return NextResponse.json({ ok: true, orders }, { headers: noCache });
  } catch (e) {
    console.error("/api/account/orders error:", e);
    return NextResponse.json({ ok: true, orders: [] }, { headers: noCache });
  }
}