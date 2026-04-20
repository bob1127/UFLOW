import { NextResponse } from "next/server";
import crypto from "crypto";
import { issueEcpayInvoice } from "@/lib/ecpay-invoice";

export const runtime = "nodejs";

const {
  WC_API_BASE,
  WC_CONSUMER_KEY,
  WC_CONSUMER_SECRET,
  ECPAY_HASH_KEY,
  ECPAY_HASH_IV,
} = process.env;

function generateCheckMacValue(params: Record<string, string>, hashKey: string, hashIv: string): string {
  const keys = Object.keys(params).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  let raw = `HashKey=${hashKey}`;
  keys.forEach((k) => { raw += `&${k}=${params[k]}` });
  raw += `&HashIV=${hashIv}`;
  const encoded = encodeURIComponent(raw)
    .toLowerCase()
    .replace(/%20/g, "+").replace(/%2d/g, "-").replace(/%5f/g, "_").replace(/%2e/g, ".")
    .replace(/%21/g, "!").replace(/%2a/g, "*").replace(/%28/g, "(").replace(/%29/g, ")");
  return crypto.createHash("sha256").update(encoded).digest("hex").toUpperCase();
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => { data[key] = String(value ?? ""); });

    console.log("🟢 收到綠界回傳數據:", data.MerchantTradeNo, "RtnCode:", data.RtnCode);

    if (!ECPAY_HASH_KEY || !ECPAY_HASH_IV) return new NextResponse("0|HashKeyOrIVMissing");

    const receivedMac = data.CheckMacValue || "";
    const dataForVerify = { ...data };
    delete dataForVerify.CheckMacValue;

    const computedMac = generateCheckMacValue(dataForVerify, ECPAY_HASH_KEY, ECPAY_HASH_IV);
    if (receivedMac !== computedMac) {
       console.error("❌ 綠界 CheckMacValue 驗證失敗");
       return new NextResponse("0|CheckMacValueVerifyFail");
    }

    const orderId = data.CustomField1;

    // 💡 情況 A：取得 ATM 虛擬帳號/超商代碼成功 (RtnCode 是 2)
    if (data.RtnCode === "2") {
      if (orderId && WC_API_BASE && WC_CONSUMER_KEY && WC_CONSUMER_SECRET) {
        const bankCode = data.BankCode || "";
        const vAccount = data.vAccount || "";
        const expireDate = data.ExpireDate || "";
        const paymentNo = data.PaymentNo || ""; // 超商代碼

        // 準備要寫入 WooCommerce 的自訂欄位
        const metaData = [];
        let customerNote = "";

        if (data.PaymentType?.includes("ATM")) {
          metaData.push({ key: "_vAccount", value: vAccount });
          metaData.push({ key: "_BankCode", value: bankCode });
          metaData.push({ key: "_ExpireDate", value: expireDate });
          customerNote = `【系統自動紀錄】ATM 銀行代碼: ${bankCode}, 虛擬帳號: ${vAccount}, 期限: ${expireDate}`;
        } else if (data.PaymentType?.includes("CVS") || data.PaymentType?.includes("BARCODE")) {
          metaData.push({ key: "_PaymentNo", value: paymentNo });
          metaData.push({ key: "_ExpireDate", value: expireDate });
          customerNote = `【系統自動紀錄】超商繳費代碼: ${paymentNo}, 期限: ${expireDate}`;
        }

        if (metaData.length > 0) {
          const wcRes = await fetch(`${WC_API_BASE.replace(/\/$/, "")}/wp-json/wc/v3/orders/${orderId}?consumer_key=${WC_CONSUMER_KEY}&consumer_secret=${WC_CONSUMER_SECRET}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              meta_data: metaData,
              customer_note: customerNote, // 順便寫入備註，方便後台人員看
            }),
          });
          
          if (wcRes.ok) console.log(`✅ 訂單 #${orderId} 的取號資訊已存入 WooCommerce`);
          else console.error(`❌ 訂單 #${orderId} 取號資訊存入失敗`);
        }
      }
      return new NextResponse("1|OK");
    }

    // 💡 情況 B：實際付款成功 (RtnCode 是 1)
    if (data.RtnCode === "1") {
      const customerEmail = data.CustomField2;
      const tradeAmount = Math.round(Number(data.TradeAmt || data.CustomField3 || 0));

      if (!orderId) return new NextResponse("1|OK");

      // 1) 更新 Woo 訂單為已付款
      if (WC_API_BASE && WC_CONSUMER_KEY && WC_CONSUMER_SECRET) {
        const wcRes = await fetch(`${WC_API_BASE.replace(/\/$/, "")}/wp-json/wc/v3/orders/${orderId}?consumer_key=${WC_CONSUMER_KEY}&consumer_secret=${WC_CONSUMER_SECRET}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "processing", set_paid: true, transaction_id: data.TradeNo }),
        });
        if (wcRes.ok) console.log(`✅ 訂單 #${orderId} 狀態已更新為 processing`);
        else console.error(`❌ 訂單 #${orderId} 狀態更新失敗`);
      }

      // 2) 開立電子發票
      if (customerEmail && tradeAmount > 0) {
        try {
          const relateNumber = `INV${orderId}${Date.now().toString().slice(-6)}`.slice(0, 30);
          await issueEcpayInvoice({
            relateNumber,
            customerEmail,
            salesAmount: tradeAmount,
            items: [{
              ItemName: "UFLOW保健食品",
              ItemCount: 1,
              ItemWord: "式",
              ItemPrice: tradeAmount,
              ItemAmount: tradeAmount,
            }],
          });
          console.log(`🧾 訂單 #${orderId} 電子發票已成功開立並寄出`);
        } catch (invoiceErr) {
          console.error("❌ 電子發票開立失敗:", invoiceErr);
        }
      }
    }

    return new NextResponse("1|OK");
  } catch (error) {
    console.error("ECPay Callback 錯誤:", error);
    return new NextResponse("1|OK");
  }
}