// app/api/ecpay/callback/route.ts
import { NextResponse } from "next/server";
import { generateCheckMacValue } from "@/lib/ecpay";

const {
  WC_API_BASE, WC_CONSUMER_KEY, WC_CONSUMER_SECRET,
  ECPAY_HASH_KEY, ECPAY_HASH_IV
} = process.env;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data: any = {};
    formData.forEach((value, key) => { data[key] = value; });

    console.log("綠界回傳數據:", data);

    // 1. 驗證檢查碼
    const receivedMac = data.CheckMacValue;
    const dataForVerify = { ...data };
    delete dataForVerify.CheckMacValue;
    
    const computedMac = generateCheckMacValue(dataForVerify, ECPAY_HASH_KEY!, ECPAY_HASH_IV!);

    if (receivedMac !== computedMac) {
      console.error("檢查碼驗證失敗");
      return new NextResponse("0|CheckMacValueVerifyFail");
    }

    // 2. 交易成功 (RtnCode 為 1 代表付款成功)
    if (data.RtnCode === "1") {
      // 解析 MerchantTradeNo: 抓取 W 與 A 之間的 Order ID
      const match = data.MerchantTradeNo.match(/^W(\d+)A/);
      
      if (match && match[1]) {
        const orderId = match[1];

        // 3. 更新 WC 訂單為 processing
        // 當狀態變更為 processing 時，WooCommerce 會自動發送「付款成功」郵件給客戶
        const wcRes = await fetch(`${WC_API_BASE}/wp-json/wc/v3/orders/${orderId}?consumer_key=${WC_CONSUMER_KEY}&consumer_secret=${WC_CONSUMER_SECRET}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "processing",
            set_paid: true, // 標記為已付款
            transaction_id: data.TradeNo, // 紀錄綠界流水號
          }),
        });

        if (wcRes.ok) {
          console.log(`訂單 #${orderId} 付款成功，狀態已更新。`);
        }
      }
    }

    // 4. 必須回傳 1|OK 給綠界
    return new NextResponse("1|OK");

  } catch (error) {
    console.error("Callback 錯誤:", error);
    return new NextResponse("0|Error");
  }
}