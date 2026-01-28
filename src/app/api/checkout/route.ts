import { NextResponse } from "next/server";
import crypto from "crypto";

// 強制使用 Node.js Runtime (因為使用了 crypto 模組)
export const runtime = "nodejs";

// 環境變數讀取
const BASE = process.env.WC_API_BASE;
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

// 優先讀取後端專用變數，若無則讀取公開變數 (相容舊設定)
const MERCHANT_ID = process.env.ECPAY_MERCHANT_ID || process.env.NEXT_PUBLIC_ECPAY_MERCHANT_ID;
const HASH_KEY = process.env.ECPAY_HASH_KEY;
const HASH_IV = process.env.ECPAY_HASH_IV;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; // e.g. https://uflow.space

// 正式環境網址
const ECPAY_URL = "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";

// ==========================================
// 1. 型別定義 (TypeScript Interfaces)
// ==========================================

interface CartItem {
  wcProductId: number;
  qty: number;
  price: number;
  title: string;
}

interface ContactInfo {
  email: string;
}

interface AddressInfo {
  firstName: string;
  lastName: string;
  line1: string;
  phone: string;
}

interface RequestBody {
  items: CartItem[];
  contact: ContactInfo;
  addr: AddressInfo;
  total: number;
  shipMethod: string;
  payMethod?: string;
  coupon?: { code: string; amount: number } | null;
}

// ==========================================
// 2. 綠界專用輔助函式
// ==========================================

/**
 * 取得綠界格式日期 yyyy/MM/dd HH:mm:ss
 */
function getEcpayDate(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - offset + 8 * 3600000); // 轉 UTC+8
  return local.toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "")
    .replace(/-/g, "/"); // 格式: 2023/01/01 12:00:00
}

/**
 * 綠界特殊編碼規則
 */
function ecpayEncode(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return "";
  let encoded = encodeURIComponent(String(text));
  encoded = encoded.replace(/%20/g, "+");
  return encoded;
}

/**
 * 產生 CheckMacValue (SHA256)
 */
function generateCheckMacValue(params: Record<string, string>): string {
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
    .toLowerCase() // 先轉小寫
    .replace(/%20/g, "+")
    .replace(/%2d/g, "-")
    .replace(/%5f/g, "_")
    .replace(/%2e/g, ".")
    .replace(/%21/g, "!")
    .replace(/%2a/g, "*")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")");

  // 4. SHA256 -> 大寫
  const hash = crypto.createHash("sha256").update(encoded).digest("hex");
  return hash.toUpperCase();
}

function basicAuth(): string | undefined {
  if (!CK || !CS) return undefined;
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

function escapeHtmlAttr(v: string | number): string {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ==========================================
// 3. 主程式 API Handler
// ==========================================

export async function POST(req: Request) {
  try {
    const auth = basicAuth();

    // 🔍 除錯：檢查變數是否抓到
    console.log("Config Check:", { MERCHANT_ID, HasKey: !!HASH_KEY, HasIV: !!HASH_IV, BASE_URL });

    if (!MERCHANT_ID || !HASH_KEY || !HASH_IV) {
      return NextResponse.json({ ok: false, message: "Server Config Error: 金鑰未設定" }, { status: 500 });
    }

    const body: RequestBody = await req.json();
    const { items, contact, addr, total } = body;

    // 1) 處理商品名稱 (移除特殊符號以免綠界報錯)
    const cleanItemName = items && items.length > 0
      ? items.map((it) => (it.title || "").replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "")).join("#").slice(0, 150)
      : "Uflow_Product";

    const tradeNo = `W${Date.now().toString().slice(-8)}`;

    // 2) 建立 WooCommerce 訂單 (Optional)
    let orderId: string | number = tradeNo; // 預設用交易編號
    if (auth && BASE) {
      try {
        const wcOrderPayload = {
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
          ],
        };

        const wcRes = await fetch(`${BASE}/wp-json/wc/v3/orders`, {
          method: "POST",
          headers: { Authorization: auth, "Content-Type": "application/json" },
          body: JSON.stringify(wcOrderPayload),
        });
        const wcData = await wcRes.json();
        if (wcData.id) orderId = wcData.id;
      } catch (wcErr) {
        console.error("WooCommerce Order Failed:", wcErr);
        // 失敗仍繼續執行付款，以免中斷流程
      }
    }

    // 3) 金額計算 (⚠️ 必須強制轉為整數字串，不能有小數點)
    const totalAmountString = Math.floor(Number(total) || 0).toString();

    // ==========================================
    // 4) 綠界 AIO 參數設定
    // ==========================================
    const invItemName = ecpayEncode("網路商品一批");
    const invItemWord = ecpayEncode("式");
    const invCustomerEmail = ecpayEncode(contact.email);

    // 建立參數物件 (Record<string, string>)
    const ecpayParams: Record<string, string> = {
      MerchantID: MERCHANT_ID,
      MerchantTradeNo: tradeNo,
      MerchantTradeDate: getEcpayDate(),
      PaymentType: "aio",
      TotalAmount: totalAmountString, // ✅ 必須是字串
      TradeDesc: ecpayEncode("Uflow_Shop"),
      ItemName: cleanItemName,
      ReturnURL: `${BASE_URL}/api/ecpay/callback`,
      OrderResultURL: `${BASE_URL}/thank-you?orderId=${orderId}`,
      ChoosePayment: "ALL",
      EncryptType: "1",
      CustomField1: String(orderId),
      CustomField2: contact.email,

      // --- 電子發票 ---
      InvoiceMark: "Y",
      RelateNumber: tradeNo,
      CustomerEmail: invCustomerEmail,
      TaxType: "1",
      CarruerType: "1",
      Donation: "0",
      Print: "0",
      InvoiceItemName: invItemName,
      InvoiceItemCount: "1",
      InvoiceItemWord: invItemWord,
      InvoiceItemPrice: totalAmountString,
      InvoiceItemTaxType: "1",
      DelayDay: "0",
      InvType: "07",
    };

    // ✅ 產生檢查碼
    const checkMacValue = generateCheckMacValue(ecpayParams);

    // 回傳 HTML Form (前端收到後會自動 submit)
    const htmlForm = `
      <form id="_form_ecpay" action="${escapeHtmlAttr(ECPAY_URL)}" method="POST">
        ${Object.keys(ecpayParams)
        .map((key) => {
          const val = ecpayParams[key];
          return `<input type="hidden" name="${escapeHtmlAttr(key)}" value="${escapeHtmlAttr(val)}" />`;
        })
        .join("")}
        <input type="hidden" name="CheckMacValue" value="${checkMacValue}" />
      </form>
    `.trim();

    return NextResponse.json({ ok: true, orderId, html: htmlForm });

  } catch (e: any) {
    console.error("Checkout Error:", e);
    // ✅ 回傳 JSON 格式的錯誤，讓前端能顯示 message
    return NextResponse.json({ ok: false, message: e.message || "Unknown Error" }, { status: 500 });
  }
}