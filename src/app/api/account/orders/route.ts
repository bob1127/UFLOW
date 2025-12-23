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
        } else {
          const txt = await cRes.text();
          console.error("orders fetch customer by email error:", cRes.status, txt);
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
        } else {
          const txt = await oRes.text();
          console.error("orders fetch by customer error:", oRes.status, txt);
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
        } else {
          const txt = await oRes.text();
          console.error("orders fallback search error:", oRes.status, txt);
        }
      } catch (e) {
        console.error("orders fallback search catch error:", e);
      }
    }

    const orders = (ordersRaw || []).map((o: any) => ({
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

    return NextResponse.json({ ok: true, orders }, { headers: noCache });
  } catch (e) {
    console.error("/api/account/orders error:", e);
    return NextResponse.json({ ok: true, orders: [] }, { headers: noCache });
  }
}