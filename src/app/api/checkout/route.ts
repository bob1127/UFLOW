// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const runtime = "nodejs";

const BASE = process.env.WC_API_BASE!;
const CK = process.env.WC_CONSUMER_KEY!;
const CS = process.env.WC_CONSUMER_SECRET!;
const MERCHANT_ID = process.env.ECPAY_MERCHANT_ID || process.env.NEXT_PUBLIC_ECPAY_MERCHANT_ID!;
const HASH_KEY = process.env.ECPAY_HASH_KEY!;
const HASH_IV = process.env.ECPAY_HASH_IV!;
const ECPAY_URL = process.env.ECPAY_API_URL || "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";

interface CartItem { wcProductId: number; qty: number; price: number; title: string; }
interface ContactInfo { email: string; }
interface AddressInfo { firstName: string; lastName: string; line1: string; phone: string; storeId?: string; storeName?: string; storeAddr?: string; }
interface RequestBody { items: CartItem[]; contact: ContactInfo; addr: AddressInfo; total: number; shipMethod: string; payMethod?: string; coupon?: { code: string; amount: number } | null; }

function getEcpayDate(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - offset + 8 * 3600000);
  return local.toISOString().replace(/T/, " ").replace(/\..+/, "").replace(/-/g, "/");
}

function ecpayEncode(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return "";
  return encodeURIComponent(String(text)).replace(/%20/g, "+");
}

function generateCheckMacValue(params: Record<string, string>): string {
  const keys = Object.keys(params).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  let raw = `HashKey=${HASH_KEY}`;
  keys.forEach((k) => { if (k !== "CheckMacValue") raw += `&${k}=${params[k]}`; });
  raw += `&HashIV=${HASH_IV}`;
  const encoded = encodeURIComponent(raw).toLowerCase()
    .replace(/%20/g, "+").replace(/%2d/g, "-").replace(/%5f/g, "_").replace(/%2e/g, ".")
    .replace(/%21/g, "!").replace(/%2a/g, "*").replace(/%28/g, "(").replace(/%29/g, ")");
  return crypto.createHash("sha256").update(encoded).digest("hex").toUpperCase();
}

function basicAuth(): string | undefined {
  if (!CK || !CS) return undefined;
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

function escapeHtmlAttr(v: string | number): string {
  return String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
  try {
    const auth = basicAuth();
    if (!MERCHANT_ID || !HASH_KEY || !HASH_IV) {
      return NextResponse.json({ ok: false, message: "Server Config Error" }, { status: 500 });
    }

    // 💡 1. 嘗試抓取 Session
    const session = await getServerSession(authOptions);
    let loggedInCustomerId = (session as any)?.customerId || 0;

    const body: RequestBody = await req.json();
    const { items, contact, addr, total, shipMethod, coupon } = body;

    // 💡 2. 強制認親機制 (Fallback)：如果 Session 沒抓到，用填寫的 Email 去 WooCommerce 查 ID！
    if (!loggedInCustomerId && contact?.email && auth && BASE) {
      try {
        const cRes = await fetch(`${BASE.replace(/\/$/, "")}/wp-json/wc/v3/customers?email=${encodeURIComponent(contact.email.trim())}&role=all`, {
          headers: { Authorization: auth },
          cache: "no-store"
        });
        if (cRes.ok) {
          const cArr = await cRes.json();
          if (Array.isArray(cArr) && cArr.length > 0) {
            loggedInCustomerId = cArr[0].id;
            console.log(`✅ 強制認親成功：找到 Email ${contact.email} 對應的 ID: ${loggedInCustomerId}`);
          }
        }
      } catch (e) {
        console.error("強制認親發生錯誤:", e);
      }
    }

    const cleanItemName = items && items.length > 0 ? items.map((it) => (it.title || "").replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "")).join("#").slice(0, 150) : "Uflow_Product";
    const tradeNo = `W${Date.now().toString().slice(-8)}`;

    let orderId: string | number = tradeNo;
    if (auth && BASE) {
      try {
        const meta_data: any[] = [
          { key: "_ecpay_trade_no", value: tradeNo },
          { key: "_invoice_email", value: contact.email },
        ];

        let finalAddress = addr.line1;
        let logisticsSubType = "";

        if ((shipMethod === "CVS" || shipMethod === "711") && addr.storeId) {
          logisticsSubType = shipMethod === "CVS" ? "FAMIC2C" : "UNIMARTC2C"; 
          meta_data.push(
            { key: "_shipping_store_id", value: String(addr.storeId) },
            { key: "_shipping_store_name", value: addr.storeName },
            { key: "_shipping_store_address", value: addr.storeAddr },
            { key: "_shipping_phone", value: addr.phone },
            { key: "CVSStoreID", value: String(addr.storeId) },
            { key: "CVSStoreName", value: addr.storeName },
            { key: "CVSAddress", value: addr.storeAddr },
            { key: "LogisticsSubType", value: logisticsSubType },
            { key: "_ecpay_shipping_method", value: logisticsSubType }
          );
          finalAddress = `${addr.storeName} (${addr.storeId}) - ${addr.storeAddr}`;
        }

        if (coupon?.code) meta_data.push({ key: "_used_coupon_code", value: coupon.code });

        const wcOrderPayload = {
          customer_id: loggedInCustomerId, // 🚨 這裡現在絕對能綁定到了！
          payment_method: "ecpay",
          payment_method_title: "綠界科技 ECPay",
          set_paid: false,
          billing: {
            first_name: addr.lastName, last_name: addr.firstName,
            address_1: finalAddress, city: "Taipei", country: "TW",
            email: contact.email, phone: addr.phone,
          },
          shipping: {
            first_name: addr.lastName, last_name: addr.firstName,
            address_1: finalAddress, country: "TW",
          },
          line_items: items.map((it) => ({ product_id: it.wcProductId, quantity: it.qty })),
          meta_data: meta_data, 
        };

        const wcRes = await fetch(`${BASE.replace(/\/$/, "")}/wp-json/wc/v3/orders`, {
          method: "POST",
          headers: { Authorization: auth, "Content-Type": "application/json" },
          body: JSON.stringify(wcOrderPayload),
        });
        const wcData = await wcRes.json();
        if (wcData.id) orderId = wcData.id;
      } catch (wcErr) {}
    }

    const totalAmountString = Math.floor(Number(total) || 0).toString();
    
    // 💡 本地測試用的臨時網址，推上正式機記得改回 "https://www.uflow.space"
  const domain = "https://www.uflow.space";

    const ecpayParams: Record<string, string> = {
      MerchantID: MERCHANT_ID,
      MerchantTradeNo: tradeNo,
      MerchantTradeDate: getEcpayDate(),
      PaymentType: "aio",
      TotalAmount: totalAmountString,
      TradeDesc: ecpayEncode("Uflow_Shop"),
      ItemName: cleanItemName,
      ReturnURL: `${domain}/api/ecpay/callback`,
      PaymentInfoURL: `${domain}/api/ecpay/callback`, // 🚨 獲取 ATM 帳號的靈魂參數
      ClientBackURL: `http://localhost:3000/thank-you?orderId=${orderId}`,
      ChoosePayment: "ALL",
      EncryptType: "1",
      CustomField1: String(orderId),
      CustomField2: contact.email,
      CustomField3: totalAmountString,
    };

    const checkMacValue = generateCheckMacValue(ecpayParams);

    const htmlForm = `
      <form id="_form_ecpay" action="${escapeHtmlAttr(ECPAY_URL)}" method="POST">
        ${Object.keys(ecpayParams).map((key) => `<input type="hidden" name="${escapeHtmlAttr(key)}" value="${escapeHtmlAttr(ecpayParams[key])}" />`).join("")}
        <input type="hidden" name="CheckMacValue" value="${checkMacValue}" />
      </form>
    `.trim();

    return NextResponse.json({ ok: true, orderId, html: htmlForm });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message || "Unknown Error" }, { status: 500 });
  }
}