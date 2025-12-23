import { NextResponse } from "next/server";
import { generateCheckMacValue, getEcpayDate } from "@/lib/ecpay";

export const runtime = "nodejs";

const BASE = process.env.WC_API_BASE;
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

function basicAuth() {
  if (!CK || !CS) return undefined;
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

export async function POST(req: Request) {
  try {
    const auth = basicAuth();
    const body = await req.json();
    const { items, contact, addr, shipMethod } = body;

    // 1. 徹底清洗商品名稱 (解決 10200078 錯誤)
    const cleanItemName = items
      .map((it: any) => it.title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ""))
      .join("#")
      .slice(0, 150) || "Uflow_Product";

    // 2. 處理收件地址 (把門市店名店號存入 address_1)
    const finalAddress = addr.line1; 

    const tradeNo = `W${Date.now().toString().slice(-8)}`;

    // 3. 建立 WooCommerce 訂單 Payload
    const wcOrderPayload: any = {
      payment_method: "ecpay",
      payment_method_title: "綠界科技 ECPay",
      set_paid: false,
      billing: {
        first_name: addr.lastName,
        last_name: addr.firstName,
        address_1: finalAddress,
        city: "Taipei",
        postcode: "000",
        country: "TW",
        email: contact.email,
        phone: addr.phone,
      },
      shipping: {
        first_name: addr.lastName,
        last_name: addr.firstName,
        address_1: finalAddress,
        city: "Taipei",
        postcode: "000",
        country: "TW",
      },
      line_items: items.map((it: any) => ({
        product_id: it.wcProductId,
        quantity: it.qty,
      })),
      shipping_lines: [{
        method_id: "flat_rate",
        method_title: shipMethod === "000" ? "宅配寄送" : "超商取貨 (手動寄件)",
        total: "0", 
      }],
      meta_data: [
        { key: "_ecpay_trade_no", value: tradeNo },
        { key: "custom_shipping_label", value: shipMethod === "000" ? "Home" : "CVS" }
      ]
    };

    // 發送到 WooCommerce
    const wcRes = await fetch(`${BASE}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: { 
        Authorization: auth!, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(wcOrderPayload),
    });

    const wcData = await wcRes.json();
    if (!wcRes.ok) throw new Error(wcData.message || "WC 訂單建立失敗");

    const orderId = wcData.id;
    const totalAmount = Math.round(parseFloat(wcData.total));

    // 4. 準備綠界正式金流參數
    const ecpayParams: any = {
      MerchantID: process.env.ECPAY_MERCHANT_ID,
      MerchantTradeNo: tradeNo,
      MerchantTradeDate: getEcpayDate(),
      PaymentType: "aio",
      TotalAmount: totalAmount,
      TradeDesc: "Uflow_Purchase",
      ItemName: cleanItemName,
      ReturnURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/ecpay/callback`,
      OrderResultURL: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?orderId=${orderId}`,
      ChoosePayment: "ALL",
      EncryptType: "1",
      CustomField1: orderId.toString(),
    };

    ecpayParams.CheckMacValue = generateCheckMacValue(
      ecpayParams, 
      process.env.ECPAY_HASH_KEY!, 
      process.env.ECPAY_HASH_IV!
    );

    // 返回 Form HTML 以便自動跳轉
    const htmlForm = `
      <form id="_form_ecpay" action="${process.env.ECPAY_API_URL}" method="POST">
        ${Object.keys(ecpayParams).map(key => `<input type="hidden" name="${key}" value="${ecpayParams[key]}" />`).join("")}
      </form>
    `;

    return NextResponse.json({ ok: true, orderId, html: htmlForm });
  } catch (e: any) {
    console.error("Checkout Error:", e);
    return NextResponse.json({ ok: false, message: e.message }, { status: 500 });
  }
}