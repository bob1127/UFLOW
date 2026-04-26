import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const runtime = "nodejs";

const BASE = process.env.WC_API_BASE!;
const CK = process.env.WC_CONSUMER_KEY!;
const CS = process.env.WC_CONSUMER_SECRET!;

const MERCHANT_ID = process.env.ECPAY_MERCHANT_ID!;
const HASH_KEY = process.env.ECPAY_HASH_KEY!;
const HASH_IV = process.env.ECPAY_HASH_IV!;
const ECPAY_URL = process.env.ECPAY_API_URL || "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5"; 

const LINEPAY_CHANNEL_ID = process.env.LINEPAY_CHANNEL_ID!;
const LINEPAY_CHANNEL_SECRET = process.env.LINEPAY_CHANNEL_SECRET!;
const LINEPAY_URL = process.env.LINEPAY_API_URL || "https://api-pay.line.me/v3/payments/request"; 

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

function generateLinePaySignature(uri: string, requestBody: string, nonce: string): string {
  const message = `${LINEPAY_CHANNEL_SECRET}${uri}${requestBody}${nonce}`;
  return crypto.createHmac("sha256", LINEPAY_CHANNEL_SECRET).update(message).digest("base64");
}

export async function POST(req: Request) {
  try {
    const auth = basicAuth();
    if (!MERCHANT_ID || !HASH_KEY || !HASH_IV) {
      return NextResponse.json({ ok: false, message: "Server Config Error" }, { status: 500 });
    }

    const session = await getServerSession(authOptions);
    let loggedInCustomerId = (session as any)?.customerId || 0;

    const body: RequestBody = await req.json();
    const { items, contact, addr, total, shipMethod, payMethod, coupon } = body;

    const safeLastName = (addr.lastName || "").replace(/\s+/g, "");
    const safeFirstName = (addr.firstName || "").replace(/\s+/g, "");
    const safePhone = (addr.phone || "").replace(/\s+/g, "");

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
          }
        }
      } catch (e) {}
    }

    const cleanItemName = items && items.length > 0 ? items.map((it) => (it.title || "").replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "")).join("#").slice(0, 150) : "Uflow_Product";
    const tradeNo = `W${Date.now().toString().slice(-8)}`;
    let orderId: string | number = tradeNo;
    
    if (auth && BASE) {
      try {
        const meta_data: any[] = [
          { key: "_ecpay_trade_no", value: tradeNo },
          { key: "_shipping_phone", value: safePhone } 
        ];

        let finalAddress = addr.line1;
        let methodId = "ry_ecpay_shipping"; 
        let shippingTitle = "宅配速送";

        if ((shipMethod === "CVS" || shipMethod === "711") && addr.storeId) {
          const isFami = shipMethod === "CVS";
          
          // 🚀 核心防呆：自動補齊全家被吃掉的 0 (強制補滿 6 碼)
          const finalStoreId = String(addr.storeId).padStart(6, '0');

          // 使用原生探針測出來的最完美 ID
          methodId = isFami ? "ry_ecpay_shipping_cvs_family" : "ry_ecpay_shipping_cvs_711"; 
          shippingTitle = isFami ? "綠界物流 超商取貨 全家" : "綠界物流 超商取貨 7-ELEVEN";
          finalAddress = `${addr.storeName} (${finalStoreId}) - ${addr.storeAddr}`;
          
          // 原生探針證實的極簡 Meta Data (沒有多餘的暗號，絕不干擾)
          meta_data.push(
            { key: "_shipping_cvs_store_ID", value: finalStoreId },
            { key: "_shipping_cvs_store_name", value: addr.storeName },
            { key: "_shipping_cvs_store_address", value: addr.storeAddr },
            { key: "_shipping_cvs_store_telephone", value: safePhone }
          );
        }

        if (coupon?.code) meta_data.push({ key: "_used_coupon_code", value: coupon.code });

        const wcOrderPayload = {
          customer_id: loggedInCustomerId, 
          // 🚀 核心欺騙術：告訴 Woo 這是 bacs，讓外掛面板立刻現身
          payment_method: payMethod === "linepay" ? "linepay" : "bacs",
          payment_method_title: payMethod === "linepay" ? "LINE Pay" : "綠界科技 ECPay",
          set_paid: false, 
          billing: {
            first_name: safeFirstName, last_name: safeLastName,
            address_1: finalAddress, city: "Taipei", country: "TW",
            email: contact.email, phone: safePhone,
          },
          shipping: {
            first_name: safeFirstName, last_name: safeLastName,
            address_1: finalAddress, country: "TW",
          },
          shipping_lines: [{ method_id: methodId, method_title: shippingTitle, total: "80" }],
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
      } catch (wcErr) {
        console.error("WC 訂單建立失敗", wcErr);
      }
    }

    const totalAmountString = Math.floor(Number(total) || 0).toString();
    const domain = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"; 

    if (payMethod === "linepay") {
      if (!LINEPAY_CHANNEL_ID || !LINEPAY_CHANNEL_SECRET) {
        return NextResponse.json({ ok: false, message: "LINE Pay 金鑰未設定" }, { status: 500 });
      }

      const nonce = crypto.randomUUID();
      const uri = "/v3/payments/request";
      const lpPayload = {
        amount: Number(totalAmountString),
        currency: "TWD",
        orderId: tradeNo,
        packages: [
          {
            id: `PKG_${orderId}`,
            amount: Number(totalAmountString),
            name: "UFLOW 訂單",
            products: items.map(it => ({
              id: String(it.wcProductId || "product"),
              name: it.title,
              quantity: it.qty,
              price: it.price
            }))
          }
        ],
        redirectUrls: {
          confirmUrl: `${domain}/api/linepay/confirm?orderId=${orderId}&tradeNo=${tradeNo}`, 
          cancelUrl: `${domain}/cart` 
        }
      };

      const payloadString = JSON.stringify(lpPayload);
      const signature = generateLinePaySignature(uri, payloadString, nonce);

      const lpRes = await fetch(LINEPAY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-LINE-ChannelId": LINEPAY_CHANNEL_ID,
          "X-LINE-Authorization-Nonce": nonce,
          "X-LINE-Authorization": signature,
        },
        body: payloadString
      });

      const lpData = await lpRes.json();

      if (lpData.returnCode === "0000" && lpData.info.paymentUrl.web) {
        return NextResponse.json({ ok: true, orderId, redirectUrl: lpData.info.paymentUrl.web });
      } else {
        return NextResponse.json({ ok: false, message: lpData.returnMessage || "LINE Pay 請求失敗" }, { status: 400 });
      }

    } else {
      const ecpayParams: Record<string, string> = {
        MerchantID: MERCHANT_ID,
        MerchantTradeNo: tradeNo,
        MerchantTradeDate: getEcpayDate(),
        PaymentType: "aio",
        TotalAmount: totalAmountString,
        TradeDesc: ecpayEncode("Uflow_Shop"),
        ItemName: cleanItemName,
        ReturnURL: `${domain}/api/ecpay/callback`,
        PaymentInfoURL: `${domain}/api/ecpay/callback`, 
        ClientBackURL: `${domain}/thank-you?orderId=${orderId}`, 
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
    }

  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message || "Unknown Error" }, { status: 500 });
  }
}