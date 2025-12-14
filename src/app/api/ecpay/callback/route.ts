// app/api/ecpay/callback/route.ts
import { NextResponse } from "next/server";
import { generateCheckMacValue } from "@/lib/ecpay";

const {
  WC_API_BASE, WC_CONSUMER_KEY, WC_CONSUMER_SECRET,
  ECPAY_HASH_KEY, ECPAY_HASH_IV
} = process.env;

export async function POST(req: Request) {
  try {
    // 綠界傳回來的是 x-www-form-urlencoded
    const formData = await req.formData();
    const data: any = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    console.log("ECPay Callback:", data);

    // 1. 驗證 CheckMacValue (確保不是偽造請求)
    const receivedCheckMacValue = data.CheckMacValue;
    delete data.CheckMacValue; // 計算時要移除原本的檢查碼
    
    const computedCheckMacValue = generateCheckMacValue(data, ECPAY_HASH_KEY!, ECPAY_HASH_IV!);

    if (receivedCheckMacValue !== computedCheckMacValue) {
      console.error("ECPay CheckMacValue mismatch");
      return new NextResponse("0|ErrorMessage", { status: 400 });
    }

    // 2. 判斷交易是否成功 (RtnCode === '1')
    if (data.RtnCode === "1") {
      // 解析 MerchantTradeNo (我們格式是 W{orderId}T{timestamp})
      // 例如 W1234T9999 -> 抓出 1234
      const orderIdMatch = data.MerchantTradeNo.match(/^W(\d+)T/);
      
      if (orderIdMatch && orderIdMatch[1]) {
        const orderId = orderIdMatch[1];
        
        // 3. 更新 WooCommerce 訂單狀態為 processing (已付款)
        await fetch(`${WC_API_BASE}/wp-json/wc/v3/orders/${orderId}?consumer_key=${WC_CONSUMER_KEY}&consumer_secret=${WC_CONSUMER_SECRET}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "processing",
            transaction_id: data.TradeNo, // 綠界的交易號
            date_paid: new Date().toISOString()
          }),
        });
        
        console.log(`Order #${orderId} updated to processing.`);
      }
    }

    // 4. 回應綠界 1|OK (必須完全符合這格式)
    return new NextResponse("1|OK");

  } catch (error) {
    console.error("Callback Error", error);
    return new NextResponse("0|Error", { status: 500 });
  }
}