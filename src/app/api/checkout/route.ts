// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // 若沒用到 next-auth 可移除
import { authOptions } from "@/lib/auth-options"; // 若無此檔案請移除相關引用
import { generateCheckMacValue, getEcpayDate } from "@/lib/ecpay";

export const runtime = "nodejs";

const BASE = process.env.WC_API_BASE;
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

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
    if (!auth || !ECPAY_MERCHANT_ID || !ECPAY_HASH_KEY || !ECPAY_HASH_IV) {
      return NextResponse.json(
        { ok: false, message: "系統配置錯誤：缺少金鑰設定" },
        { status: 500, headers: noCache }
      );
    }

    const body = await req.json();
    const { items, contact, addr, shipMethod, couponCode } = body;

    // 1. 取得 Email
    let email = contact?.email || "";
    if (!email) {
      try {
        const session = await getServerSession(authOptions);
        if (session?.user?.email) email = session.user.email;
      } catch (e) { /* ignore */ }
    }

    // 2. 產生綠界交易編號 (不重複)
    const tradeNo = `W${Date.now().toString().slice(-8)}R${Math.floor(Math.random() * 1000)}`;

    // 3. 準備 WooCommerce 訂單 Payload
    const wcOrderPayload: any = {
      payment_method: "ecpay",
      payment_method_title: "綠界科技 ECPay",
      set_paid: false,
      status: "pending",
      billing: {
        first_name: addr.firstName,
        last_name: addr.lastName,
        address_1: addr.line1,
        address_2: addr.line2,
        city: addr.city,
        postcode: addr.zip,
        country: "TW",
        email: email,
        phone: addr.phone,
      },
      shipping: {
        first_name: addr.firstName,
        last_name: addr.lastName,
        address_1: addr.line1,
        address_2: addr.line2,
        city: addr.city,
        postcode: addr.zip,
        country: "TW",
      },
      line_items: items.map((it: any) => ({
        product_id: it.wcProductId,
        quantity: it.qty,
      })),
      shipping_lines: [
        {
          method_id: "flat_rate",
          method_title: "宅配速送",
          total: "0", // 若你有運費邏輯請在此修改
        }
      ],
      meta_data: [
        { key: "_ecpay_trade_no", value: tradeNo }
      ]
    };

    if (couponCode) {
      wcOrderPayload.coupon_lines = [{ code: couponCode }];
    }

    // 4. 建立 WooCommerce 訂單
    const wcRes = await fetch(`${BASE}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wcOrderPayload),
    });

    const wcData = await wcRes.json();
    if (!wcRes.ok || !wcData.id) {
      console.error("WooCommerce Error:", wcData);
      return NextResponse.json({ ok: false, message: "建立訂單失敗" }, { status: 400 });
    }

    const orderId = wcData.id;
    // 使用 WooCommerce 算好的最終金額 (含折扣/運費)
    const totalAmount = parseInt(wcData.total); 

    // 5. 處理商品名稱 (關鍵！防止 CheckMacValue Error)
    // 綠界限制：不可有特殊符號，長度限制 200 字
    let rawItemName = items.map((it: any) => `${it.title}x${it.qty}`).join("#");
    
    // 只保留 中文、英文、數字、底線、減號、空格
    let safeItemName = rawItemName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_\-\s]/g, "");
    
    // 如果處理完變空字串，或長度太長，就給一個預設值
    if (!safeItemName || safeItemName.length > 190) {
      safeItemName = "UFLOW Health Products (Detailed in Order)";
    }

    // 6. 準備綠界參數
  const ecpayParams: any = {
      MerchantID: ECPAY_MERCHANT_ID,
      MerchantTradeNo: tradeNo,
      MerchantTradeDate: getEcpayDate(),
      PaymentType: "aio",
      TotalAmount: totalAmount, // 強制 100 元測試或 WC 原始金額
      TradeDesc: "HealthProducts",
      ItemName: "UFLOWTestProduct", 
      ReturnURL: `${NEXT_PUBLIC_BASE_URL}/api/ecpay/callback`, 
      
      // ★ 關鍵修正：改用 OrderResultURL，付完款會「自動跳轉」回感謝頁
      // 路徑改為你獨立的 thank-you 頁面
      OrderResultURL: `${NEXT_PUBLIC_BASE_URL}/thank-you?orderId=${orderId}`, 
      
      ChoosePayment: "ALL",
      EncryptType: "1",
    };
    // 7. 計算檢查碼
    ecpayParams.CheckMacValue = generateCheckMacValue(
      ecpayParams, 
      ECPAY_HASH_KEY!, 
      ECPAY_HASH_IV!
    );

    // 8. 回傳 Form
    const htmlForm = `
      <form id="_form_ecpay" action="${ECPAY_API_URL}" method="POST">
        ${Object.keys(ecpayParams)
          .map((key) => `<input type="hidden" name="${key}" value="${ecpayParams[key]}" />`)
          .join("")}
      </form>
    `;

    return NextResponse.json({
      ok: true,
      orderId: orderId,
      html: htmlForm,
    });

  } catch (e: any) {
    console.error("API Error:", e);
    return NextResponse.json({ ok: false, message: e.message }, { status: 500 });
  }
}