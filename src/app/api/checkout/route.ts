// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth-options";
import { generateCheckMacValue, getEcpayDate } from "@/lib/ecpay";

export const runtime = "nodejs";

// 環境變數設定
const BASE = process.env.WC_API_BASE || "https://inf.fjg.mybluehost.me/website_4ad5d5f2";
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

// 綠界相關環境變數
const {
  ECPAY_MERCHANT_ID,
  ECPAY_HASH_KEY,
  ECPAY_HASH_IV,
  ECPAY_API_URL,
  NEXT_PUBLIC_BASE_URL
} = process.env;

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
    
    // 檢查綠界變數是否設定
    if (!ECPAY_MERCHANT_ID || !ECPAY_HASH_KEY || !ECPAY_HASH_IV || !ECPAY_API_URL) {
      return NextResponse.json(
          { ok: false, message: "綠界金流尚未設定環境變數" },
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
      couponCode,
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

    const missingId = items.find((it) => !it.wcProductId);
    if (missingId) {
      return NextResponse.json(
        {
          ok: false,
          message: "商品缺少 wcProductId，請在前端 items 裡帶入 WooCommerce 的 product_id。",
        },
        { status: 400, headers: noCache }
      );
    }

    /* ===== 取得 email ===== */
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

    /* ===== 用 email 找 WooCommerce customer ===== */
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

    /* ===== 1. 組 WooCommerce 訂單 payload ===== */
    // 注意：Payment 改成 "ecpay"，狀態為 "pending"，set_paid 為 false
    const wcOrderPayload: any = {
      payment_method: "ecpay", 
      payment_method_title: "綠界科技 ECPay",
      set_paid: false, // ⚠️ 重要：還沒真正付款
      status: "pending", // ⚠️ 重要：等待付款
      billing: {
        first_name: addr.firstName || "",
        last_name: addr.lastName || "",
        address_1: addr.line1 || "",
        address_2: addr.line2 || "",
        city: addr.city || "",
        postcode: addr.zip || "",
        country: "TW", // 綠界通常只收 TW
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
        country: "TW",
      },
      line_items: items.map((it) => ({
        product_id: it.wcProductId,
        quantity: it.qty,
      })),
      shipping_lines: [
        {
          method_id: shipMethod || "flat_rate",
          method_title: "宅配速送",
          total: "0", // 這裡你可以根據邏輯動態計算，目前先保留 0
        },
      ],
    };

    if (customerId) {
      wcOrderPayload.customer_id = customerId;
    }

    const trimmedCoupon = (couponCode || "").trim();
    if (trimmedCoupon) {
      wcOrderPayload.coupon_lines = [
        { code: trimmedCoupon.toUpperCase() },
      ];
    }

    /* ===== 2. 呼叫 WooCommerce API 建立訂單 ===== */
    const res = await fetch(`${BASE}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wcOrderPayload),
    });

    const text = await res.text();
    let wcOrder: any = null;
    try {
      wcOrder = JSON.parse(text);
    } catch {}

    if (!res.ok) {
      console.error("Create order error:", res.status, text);
      return NextResponse.json(
        {
          ok: false,
          message:
            wcOrder?.message ||
            `WooCommerce 回傳錯誤（HTTP ${res.status}）：${text || "無內容"}`,
          status: res.status,
        },
        { status: 400, headers: noCache }
      );
    }

    // 訂單建立成功，取得 Woo 訂單 ID 和總金額
    const orderId = wcOrder.id;
    const totalAmount = parseInt(wcOrder.total); // 使用 Woo 計算折扣後的最終金額
    const tradeNo = `W${orderId}T${Date.now().toString().slice(-4)}`; // 產生唯一編號

    /* ===== 3. 準備綠界參數 ===== */
    const ecpayParams: any = {
      MerchantID: ECPAY_MERCHANT_ID,
      MerchantTradeNo: tradeNo,
      MerchantTradeDate: getEcpayDate(),
      PaymentType: "aio",
      TotalAmount: totalAmount,
      TradeDesc: "UFLOW Health Products",
      ItemName: `訂單 #${orderId} - UFLOW 保健食品`, 
      ReturnURL: `${NEXT_PUBLIC_BASE_URL}/api/ecpay/callback`, // 背景通知網址
      ClientBackURL: `${NEXT_PUBLIC_BASE_URL}/cart?step=3&orderId=${orderId}`, // 付款完成後跳轉
      ChoosePayment: "ALL", 
      EncryptType: "1",
    };

    /* ===== 4. 計算 CheckMacValue ===== */
    ecpayParams.CheckMacValue = generateCheckMacValue(ecpayParams, ECPAY_HASH_KEY!, ECPAY_HASH_IV!);

    /* ===== 5. 產生 HTML Form ===== */
    const htmlForm = `
      <form id="_form_ecpay" action="${ECPAY_API_URL}" method="POST">
        ${Object.keys(ecpayParams).map(key => `<input type="hidden" name="${key}" value="${ecpayParams[key]}" />`).join("")}
      </form>
      <script>document.getElementById("_form_ecpay").submit();</script>
    `;

    // 回傳成功訊息，包含 orderId 和 html form
    return NextResponse.json(
      {
        ok: true,
        order: {
          id: wcOrder.id,
          number: wcOrder.number,
          status: wcOrder.status,
        },
        html: htmlForm, // 前端收到這個後要執行 submit
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