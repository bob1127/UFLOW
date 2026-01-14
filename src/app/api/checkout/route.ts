import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

const BASE = process.env.WC_API_BASE;
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

// ✅ 設為 false，強制在 Localhost 也能連線到綠界正式環境
const SKIP_ECPAY_ON_LOCAL = false;

// 務必確認 .env.local 內的設定是正式環境的
const HASH_KEY = process.env.ECPAY_HASH_KEY;
const HASH_IV = process.env.ECPAY_HASH_IV;
const MERCHANT_ID = process.env.ECPAY_MERCHANT_ID;
// 正式環境網址
const ECPAY_URL = process.env.ECPAY_API_URL || "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5"; 
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; // http://localhost:3000

// ==========================================
// 1. 綠界專用輔助函式 (修正日期格式與加密)
// ==========================================

// ✅ 修正：綠界日期必須是 yyyy/MM/dd (斜線)，不能是橫線
function getEcpayDate() {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - offset + 8 * 3600000); // 轉 UTC+8
  return local.toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "")
    .replace(/-/g, "/"); // ⚠️ 關鍵修正：將 2023-01-01 改為 2023/01/01
}

// 綠界電子發票專用 Encode
function ecpayEncode(text: string | number) {
  if (text === undefined || text === null) return "";
  // 1. 基本 URI 編碼
  let encoded = encodeURIComponent(String(text));
  // 2. 綠界特殊規則：空格轉 +
  encoded = encoded.replace(/%20/g, "+");
  return encoded;
}

/**
 * 產生 CheckMacValue (SHA256)
 * 修正了所有特殊符號的處理，確保通過綠界驗證
 */
function generateCheckMacValue(params: any) {
  // 1. Key 排序
  const keys = Object.keys(params).sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  // 2. 串接
  let raw = `HashKey=${HASH_KEY}`;
  keys.forEach((k) => {
    if (k === "CheckMacValue") return;
    raw += `&${k}=${params[k]}`;
  });
  raw += `&HashIV=${HASH_IV}`;

  // 3. URL Encode (綠界 .NET 兼容模式)
  let encoded = encodeURIComponent(raw)
    .replace(/%20/g, "+")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2a")
    .replace(/'/g, "%27");

  // 4. 小寫 -> SHA256 -> 大寫
  encoded = encoded.toLowerCase();
  const hash = crypto.createHash("sha256").update(encoded).digest("hex");
  return hash.toUpperCase();
}

// ==========================================
// 2. 主程式
// ==========================================

function basicAuth() {
  if (!CK || !CS) return undefined;
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

function escapeHtmlAttr(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type ReqBody = {
  items: Array<{ wcProductId: number; qty: number; price: number; title: string }>;
  contact: { email: string };
  addr: { firstName: string; lastName: string; line1: string; phone: string };
  shipMethod: "000" | "CVS" | "711";
  payMethod?: string;
  total?: number;
  coupon?: { code: string; amount: number } | null;
};

export async function POST(req: Request) {
  try {
    const auth = basicAuth();
    if (!auth) return NextResponse.json({ ok: false, message: "API Key Error" }, { status: 500 });
    
    if (!MERCHANT_ID || !HASH_KEY || !HASH_IV) {
      console.error("缺少綠界環境變數");
      return NextResponse.json({ ok: false, message: "Server Config Error" }, { status: 500 });
    }

    const body = (await req.json()) as ReqBody;
    const { items, contact, addr, shipMethod, coupon } = body;

    if (!items?.length) return NextResponse.json({ ok: false, message: "Empty Cart" }, { status: 400 });

    // 1) 處理商品名稱 (給金流後台看)
    const cleanItemName =
      items
        .map((it) => (it.title || "").replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ""))
        .join("#")
        .slice(0, 150) || "Uflow_Product";

    const tradeNo = `W${Date.now().toString().slice(-8)}`; 

    // 2) 建立 WC 訂單
    const wcOrderPayload: any = {
      payment_method: "ecpay",
      payment_method_title: "綠界科技 ECPay",
      set_paid: false,
      billing: {
        first_name: addr.lastName,
        last_name: addr.firstName,
        address_1: addr.line1,
        city: "Taipei",
        country: "TW",
        email: contact.email,
        phone: addr.phone,
      },
      line_items: items.map((it) => ({
        product_id: it.wcProductId,
        quantity: it.qty,
      })),
      meta_data: [
        { key: "_ecpay_trade_no", value: tradeNo },
        { key: "_invoice_email", value: contact.email },
        { key: "_coupon_code", value: coupon?.code || "" },
      ],
    };

    const wcRes = await fetch(`${BASE}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(wcOrderPayload),
    });

    const wcData = await wcRes.json();
    if (!wcRes.ok) throw new Error(wcData?.message || "Order Failed");
    const orderId = wcData.id;

    // 3) 金額計算
    const totalFromClient = Number(body.total);
    const totalAmount = Number.isFinite(totalFromClient) && totalFromClient > 0
      ? Math.round(totalFromClient)
      : Math.round(parseFloat(wcData.total));

    if (SKIP_ECPAY_ON_LOCAL) {
      return NextResponse.json({ ok: true, orderId, skippedEcpay: true });
    }

    // ==========================================
    // 4) 綠界 AIO 參數設定 (含電子發票)
    // ==========================================

    // ✅ 電子發票專用：先 Encode
    // 注意：發票品項名稱建議固定，避免字元過長或特殊符號導致錯誤
    const invItemName = ecpayEncode("網路商品一批"); 
    const invItemWord = ecpayEncode("式");
    const invCustomerEmail = ecpayEncode(contact.email); 

    const ecpayParams: any = {
      MerchantID: MERCHANT_ID,
      MerchantTradeNo: tradeNo,
      MerchantTradeDate: getEcpayDate(), // ✅ 這裡現在是 yyyy/MM/dd 了
      PaymentType: "aio",
      TotalAmount: totalAmount,
      TradeDesc: ecpayEncode("Uflow_Shop"), 
      ItemName: cleanItemName, 
      ReturnURL: `${BASE_URL}/api/ecpay/callback`,
      OrderResultURL: `${BASE_URL}/thank-you?orderId=${orderId}`,
      ChoosePayment: "ALL",
      EncryptType: "1", 
      CustomField1: String(orderId),
      CustomField2: contact.email,
      CustomField3: String(totalAmount),

      // --- ✅ 電子發票參數 (直接加在 AIO 參數裡即可，不用 AES) ---
      InvoiceMark: "Y",                       
      RelateNumber: tradeNo,                  
      CustomerEmail: invCustomerEmail,        // 已 Encode
      TaxType: "1",                           
      CarruerType: "1",                       // 1=綠界會員載具
      Donation: "0",                          
      Print: "0",                             
      InvoiceItemName: invItemName,           // 已 Encode
      InvoiceItemCount: "1",
      InvoiceItemWord: invItemWord,           // 已 Encode
      InvoiceItemPrice: String(totalAmount),
      InvoiceItemTaxType: "1",
      DelayDay: "0",
      InvType: "07",
    };

    // ✅ 產生檢查碼 (包含所有發票參數)
    ecpayParams.CheckMacValue = generateCheckMacValue(ecpayParams);

    // 回傳 HTML Form
    const htmlForm = `
      <form id="_form_ecpay" action="${escapeHtmlAttr(ECPAY_URL!)}" method="POST">
        ${Object.keys(ecpayParams)
          .map((key) => {
            const val = ecpayParams[key];
            return `<input type="hidden" name="${escapeHtmlAttr(key)}" value="${escapeHtmlAttr(String(val))}" />`;
          })
          .join("")}
      </form>
    `.trim();

    return NextResponse.json({ ok: true, orderId, html: htmlForm });

  } catch (e: any) {
    console.error("Checkout Error:", e);
    return NextResponse.json({ ok: false, message: e.message }, { status: 500 });
  }
}