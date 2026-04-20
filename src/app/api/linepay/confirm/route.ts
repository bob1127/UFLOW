// src/app/api/linepay/confirm/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

const BASE = process.env.WC_API_BASE!;
const CK = process.env.WC_CONSUMER_KEY!;
const CS = process.env.WC_CONSUMER_SECRET!;

const LINEPAY_CHANNEL_ID = process.env.LINEPAY_CHANNEL_ID!;
const LINEPAY_CHANNEL_SECRET = process.env.LINEPAY_CHANNEL_SECRET!;
const LINEPAY_URL = process.env.LINEPAY_API_URL || "https://sandbox-api-pay.line.me"; // 測試機網址

// 綠界電子發票專用金鑰 (通常跟金流不同，請至綠界後台確認)
const INV_MERCHANT_ID = process.env.ECPAY_INV_MERCHANT_ID || process.env.NEXT_PUBLIC_ECPAY_MERCHANT_ID!;
const INV_HASH_KEY = process.env.ECPAY_INV_HASH_KEY || process.env.ECPAY_HASH_KEY!;
const INV_HASH_IV = process.env.ECPAY_INV_HASH_IV || process.env.ECPAY_HASH_IV!;
const ECPAY_INVOICE_URL = "https://einvoice.ecpay.com.tw/B2CInvoice/Issue"; // 正式機開票網址

function basicAuth() {
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

// LINE Pay 簽章產生器
function generateLinePaySignature(uri: string, requestBody: string, nonce: string): string {
  const message = `${LINEPAY_CHANNEL_SECRET}${uri}${requestBody}${nonce}`;
  return crypto.createHmac("sha256", LINEPAY_CHANNEL_SECRET).update(message).digest("base64");
}

// 綠界發票 MD5 壓碼產生器 (發票 API 規定用 MD5)
function generateInvoiceMacValue(params: Record<string, string>): string {
  const keys = Object.keys(params).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  let raw = `HashKey=${INV_HASH_KEY}`;
  keys.forEach((k) => { if (k !== "CheckMacValue") raw += `&${k}=${params[k]}`; });
  raw += `&HashIV=${INV_HASH_IV}`;
  const encoded = encodeURIComponent(raw).toLowerCase()
    .replace(/%20/g, "+").replace(/%2d/g, "-").replace(/%5f/g, "_").replace(/%2e/g, ".")
    .replace(/%21/g, "!").replace(/%2a/g, "*").replace(/%28/g, "(").replace(/%29/g, ")");
  return crypto.createHash("md5").update(encoded).digest("hex").toUpperCase();
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const transactionId = url.searchParams.get("transactionId");
    const orderId = url.searchParams.get("orderId"); // WC 訂單 ID

    if (!transactionId || !orderId) {
      return NextResponse.json({ ok: false, message: "參數遺失" }, { status: 400 });
    }

    const auth = basicAuth();

    // 1. 去 WooCommerce 撈取這筆訂單的詳細資料 (金額、Email、品項)
    const wcOrderRes = await fetch(`${BASE.replace(/\/$/, "")}/wp-json/wc/v3/orders/${orderId}`, {
      headers: { Authorization: auth! },
      cache: "no-store"
    });
    if (!wcOrderRes.ok) throw new Error("找不到訂單");
    const wcOrder = await wcOrderRes.json();
    
    const amount = Number(wcOrder.total);

    // 2. 呼叫 LINE Pay Confirm API 真正扣款
    const nonce = crypto.randomUUID();
    const confirmUri = `/v3/payments/${transactionId}/confirm`;
    const confirmPayload = JSON.stringify({ amount: amount, currency: "TWD" });
    const signature = generateLinePaySignature(confirmUri, confirmPayload, nonce);

    const lpRes = await fetch(`${LINEPAY_URL}${confirmUri}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-LINE-ChannelId": LINEPAY_CHANNEL_ID,
        "X-LINE-Authorization-Nonce": nonce,
        "X-LINE-Authorization": signature,
      },
      body: confirmPayload
    });

    const lpData = await lpRes.json();

    if (lpData.returnCode === "0000") {
      // ✅ 扣款成功！更新 WooCommerce 訂單狀態為「處理中」
      await fetch(`${BASE.replace(/\/$/, "")}/wp-json/wc/v3/orders/${orderId}`, {
        method: "PUT",
        headers: { Authorization: auth!, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "processing", set_paid: true }),
      });

      // 🚀 3. 觸發開立綠界電子發票
      try {
        const items = wcOrder.line_items || [];
        const itemNames = items.map((i: any) => i.name.replace(/[|]/g, "-")).join("|");
        const itemCounts = items.map((i: any) => i.quantity).join("|");
        const itemWords = items.map(() => "件").join("|");
        const itemPrices = items.map((i: any) => i.price).join("|");
        const itemTaxTypes = items.map(() => "1").join("|");
        const itemAmounts = items.map((i: any) => i.subtotal).join("|");

        const invParams: Record<string, string> = {
          MerchantID: INV_MERCHANT_ID,
          RelateNumber: `UFLOW${orderId}INV`, // 發票號碼不可重複
          CustomerID: String(wcOrder.customer_id || ""),
          CustomerIdentifier: "",
          CustomerName: wcOrder.billing.last_name + wcOrder.billing.first_name || "Uflow 客戶",
          CustomerAddr: wcOrder.billing.address_1 || "無",
          CustomerPhone: wcOrder.billing.phone || "",
          CustomerEmail: wcOrder.billing.email,
          ClearanceMark: "1",
          Print: "0",
          Donation: "0",
          LoveCode: "",
          CarruerType: "1", // 綠界預設載具
          CarruerNum: "",
          TaxType: "1",
          SalesAmount: String(amount),
          InvoiceRemark: "LINE Pay 付款自動開立",
          ItemName: itemNames,
          ItemCount: itemCounts,
          ItemWord: itemWords,
          ItemPrice: itemPrices,
          ItemTaxType: itemTaxTypes,
          ItemAmount: itemAmounts,
          InvType: "07",
          TimeStamp: String(Math.floor(Date.now() / 1000))
        };

        const macValue = generateInvoiceMacValue(invParams);
        invParams.CheckMacValue = macValue;

        // 在背景發送給綠界，不卡住客人的畫面
        fetch(ECPAY_INVOICE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(invParams).toString()
        }).catch(e => console.error("發票開立失敗:", e));

      } catch (invErr) {
        console.error("準備發票參數失敗:", invErr);
      }

      // ✅ 一切大功告成！用 302 Redirect 把客人踢到你的感謝頁
      return NextResponse.redirect(new URL(`/thank-you?orderId=${orderId}`, req.url));
      
    } else {
      // 扣款失敗
      console.error("LINE Pay Confirm Failed:", lpData);
      return NextResponse.redirect(new URL(`/cart?error=payment_failed`, req.url));
    }

  } catch (e: any) {
    console.error("LINE Pay Confirm Error:", e);
    return NextResponse.redirect(new URL(`/cart?error=system_error`, req.url));
  }
}