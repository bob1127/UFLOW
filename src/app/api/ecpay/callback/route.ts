// app/api/ecpay/callback/route.ts
import { NextResponse } from "next/server";
import { generateCheckMacValue } from "@/lib/ecpay";
import { issueEcpayInvoice } from "@/lib/ecpay-invoice";

const {
  WC_API_BASE,
  WC_CONSUMER_KEY,
  WC_CONSUMER_SECRET,
  ECPAY_HASH_KEY,
  ECPAY_HASH_IV,
} = process.env;

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = String(value ?? "");
    });

    console.log("綠界回傳數據:", data);

    /* ================== 1. 驗證 CheckMacValue ================== */
    if (!ECPAY_HASH_KEY || !ECPAY_HASH_IV) {
      console.error("缺少 ECPAY_HASH_KEY / ECPAY_HASH_IV");
      return new NextResponse("0|HashKeyOrIVMissing");
    }

    const receivedMac = data.CheckMacValue;
    const dataForVerify = { ...data };
    delete dataForVerify.CheckMacValue;

    const computedMac = generateCheckMacValue(
      dataForVerify,
      ECPAY_HASH_KEY,
      ECPAY_HASH_IV
    );

    if (receivedMac !== computedMac) {
      console.error("CheckMacValue 驗證失敗");
      return new NextResponse("0|CheckMacValueVerifyFail");
    }

    /* ================== 2. 僅處理付款成功 ================== */
    if (data.RtnCode === "1") {
      /**
       * 你在 /api/checkout 已經這樣送：
       * CustomField1 = orderId
       * CustomField2 = email
       * CustomField3 = totalAmount
       */
      const orderId = data.CustomField1;
      const customerEmail = data.CustomField2;
      const tradeAmount = Math.round(
        Number(data.TradeAmt || data.CustomField3 || 0)
      );

      if (!orderId) {
        console.error("缺少 orderId，略過後續處理");
        return new NextResponse("1|OK");
      }

      /* ================== 3. 更新 WooCommerce 訂單 ================== */
      if (WC_API_BASE && WC_CONSUMER_KEY && WC_CONSUMER_SECRET) {
        const wcRes = await fetch(
          `${WC_API_BASE}/wp-json/wc/v3/orders/${orderId}?consumer_key=${WC_CONSUMER_KEY}&consumer_secret=${WC_CONSUMER_SECRET}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "processing",
              set_paid: true,
              transaction_id: data.TradeNo, // 綠界交易序號
            }),
          }
        );

        if (wcRes.ok) {
          console.log(`訂單 #${orderId} 狀態已更新為 processing`);
        } else {
          console.error("更新 WooCommerce 訂單失敗");
        }
      }

      /* ================== 4. 開立電子發票（關鍵新增） ================== */
      if (customerEmail && tradeAmount > 0) {
        try {
          /**
           * RelateNumber 必須唯一、英數字、不超過 30
           * 建議：INV + orderId + 短 timestamp
           */
          const relateNumber = `INV${orderId}${Date.now()
            .toString()
            .slice(-6)}`;

          await issueEcpayInvoice({
            relateNumber,
            customerEmail,
            salesAmount: tradeAmount, // ✅ = 綠界實收金額
            items: [
              {
                ItemName: "Uflow 商品",
                ItemCount: 1,
                ItemWord: "式",
                ItemPrice: tradeAmount,
                ItemAmount: tradeAmount,
              },
            ],
          });

          console.log(`訂單 #${orderId} 電子發票已開立`);
        } catch (invoiceErr) {
          // ❗ 發票失敗不能影響回傳 1|OK
          console.error("電子發票開立失敗:", invoiceErr);
        }
      } else {
        console.warn("缺少 email 或金額，略過發票開立");
      }
    }

    /* ================== 5. 一定要回 1|OK ================== */
    return new NextResponse("1|OK");
  } catch (error) {
    console.error("ECPay Callback 錯誤:", error);
    // 即使錯誤，也建議回 1|OK，避免綠界無限重送
    return new NextResponse("1|OK");
  }
}
