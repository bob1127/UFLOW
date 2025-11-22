// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
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

export async function POST(req: Request) {
  const noCache = { "Cache-Control": "no-store, no-cache, must-revalidate" };

  try {
    const auth = basicAuth();
    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "WooCommerce API 尚未設定 CK/CS" },
        { status: 500, headers: noCache }
      );
    }

    const body = await req.json();

    const {
      items,
      contact,
      addr,
      shipMethod,
      payMethod,
      couponCode, // ✅ 新增：前台送來的折扣碼
    }: {
      items: {
        wcProductId?: number;
        qty: number;
        price: number;
        title: string;
        img?: string;
        variant?: string;
      }[];
      contact: { email: string };
      addr: any;
      shipMethod: string;
      payMethod: string;
      couponCode?: string | null;
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, message: "沒有訂單商品" },
        { status: 400, headers: noCache }
      );
    }

    // ✅ 先檢查 product_id 有沒有帶
    const missingId = items.find((it) => !it.wcProductId);
    if (missingId) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "商品缺少 wcProductId，請在前端 items 裡帶入 WooCommerce 的 product_id。",
        },
        { status: 400, headers: noCache }
      );
    }

    /* ===== 取得 email（優先用表單，其次 session / JWT） ===== */
    let email = contact?.email || "";

    if (!email) {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) email = session.user.email;
    }

    if (!email) {
      const jwt = cookies().get("jwt")?.value;
      if (jwt) {
        const meRes = await fetch(`${BASE}/wp-json/wp/v2/users/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
          cache: "no-store",
        });
        if (meRes.ok) {
          const me = await meRes.json();
          email = me?.email || "";
        }
      }
    }

    /* ===== 用 email 找 WooCommerce customer（重點！） ===== */
    let customerId: number | 0 = 0;

    if (email) {
      try {
        const cRes = await fetch(
          `${BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
          {
            headers: { Authorization: auth },
            cache: "no-store",
          }
        );

        if (cRes.ok) {
          const arr = (await cRes.json().catch(() => [])) as any[];
          if (Array.isArray(arr) && arr.length > 0 && arr[0]?.id) {
            customerId = Number(arr[0].id) || 0;
          }
        }
      } catch (e) {
        console.error("查詢 WooCommerce customer 失敗：", e);
      }
    }

    /* ===== 組 WooCommerce 訂單 payload ===== */
    const wcOrderPayload: any = {
      payment_method: payMethod || "card",
      payment_method_title:
        payMethod === "linepay" ? "LINE Pay" : "信用卡付款（測試）",
      set_paid: true, // 測試環境先視為已付款
      billing: {
        first_name: addr.firstName || "",
        last_name: addr.lastName || "",
        address_1: addr.line1 || "",
        address_2: addr.line2 || "",
        city: addr.city || "",
        postcode: addr.zip || "",
        country: addr.country || "TW",
        email,
        phone: addr.phone || "",
      },
      shipping: {
        first_name: addr.firstName || "",
        last_name: addr.lastName || "",
        address_1: addr.line1 || "",
        address_2: addr.line2 || "",
        city: addr.city || "",
        postcode: addr.zip || "",
        country: addr.country || "TW",
      },
      line_items: items.map((it) => ({
        product_id: it.wcProductId,
        quantity: it.qty,
      })),
      shipping_lines: [
        {
          method_id: shipMethod || "flat_rate",
          method_title: "宅配速送",
          total: "0",
        },
      ],
    };

    // ⭐️ 關鍵：如果有找到 customer，就把訂單綁上去
    if (customerId) {
      wcOrderPayload.customer_id = customerId;
    }

    // ✅✅ 關鍵修正：把折扣碼真的套進訂單
    const trimmedCoupon = (couponCode || "").trim();
    if (trimmedCoupon) {
      wcOrderPayload.coupon_lines = [
        { code: trimmedCoupon.toUpperCase() },
      ];
    }

    const res = await fetch(`${BASE}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wcOrderPayload),
    });

    const text = await res.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {}

    if (!res.ok) {
      console.error("Create order error:", res.status, text);
      return NextResponse.json(
        {
          ok: false,
          message:
            parsed?.message ||
            `WooCommerce 回傳錯誤（HTTP ${res.status}）：${text || "無內容"}`,
          status: res.status,
        },
        { status: 400, headers: noCache }
      );
    }

    const wcOrder = parsed || ({} as any);

    return NextResponse.json(
      {
        ok: true,
        order: {
          id: wcOrder.id,
          number: wcOrder.number,
          status: wcOrder.status,
          coupon_lines: wcOrder.coupon_lines || [],
          discount_total: wcOrder.discount_total || "0",
        },
      },
      { headers: noCache }
    );
  } catch (e: any) {
    console.error("Checkout API error:", e);
    return NextResponse.json(
      { ok: false, message: "系統錯誤：" + (e?.message || "unknown") },
      { status: 500, headers: noCache }
    );
  }
}
