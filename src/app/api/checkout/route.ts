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

// 正式環境網址 (金流)
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
  // 超商相關擴充
  storeId?: string;
  storeName?: string;
  storeAddr?: string;
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

function getEcpayDate(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - offset + 8 * 3600000); // 轉 UTC+8
  return local.toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "")
    .replace(/-/g, "/");
}

function ecpayEncode(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return "";
  let encoded = encodeURIComponent(String(text));
  encoded = encoded.replace(/%20/g, "+");
  return encoded;
}

function generateCheckMacValue(params: Record<string, string>): string {
  const keys = Object.keys(params).sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  let raw = `HashKey=${HASH_KEY}`;
  keys.forEach((k) => {
    if (k === "CheckMacValue") return;
    raw += `&${k}=${params[k]}`;
  });
  raw += `&HashIV=${HASH_IV}`;

  let encoded = encodeURIComponent(raw)
    .toLowerCase()
    .replace(/%20/g, "+")
    .replace(/%2d/g, "-")
    .replace(/%5f/g, "_")
    .replace(/%2e/g, ".")
    .replace(/%21/g, "!")
    .replace(/%2a/g, "*")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")");

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

    console.log("Config Check:", { MERCHANT_ID, HasKey: !!HASH_KEY, HasIV: !!HASH_IV, BASE_URL });

    if (!MERCHANT_ID || !HASH_KEY || !HASH_IV) {
      return NextResponse.json({ ok: false, message: "Server Config Error: 金鑰未設定" }, { status: 500 });
    }

    const body: RequestBody = await req.json();
    const { items, contact, addr, total, shipMethod, payMethod, coupon } = body;

    const cleanItemName = items && items.length > 0
      ? items.map((it) => (it.title || "").replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "")).join("#").slice(0, 150)
      : "Uflow_Product";

    const tradeNo = `W${Date.now().toString().slice(-8)}`;

    // 2) 建立 WooCommerce 訂單
    let orderId: string | number = tradeNo;
    if (auth && BASE) {
      try {
        // 🔥 準備 Meta Data (給 RY Tools / 綠界物流看)
        const meta_data: any[] = [
          { key: "_ecpay_trade_no", value: tradeNo },
          { key: "_invoice_email", value: contact.email },
        ];

        let finalAddress = addr.line1;
        let logisticsSubType = "";

        // 如果是超商取貨
        if ((shipMethod === "CVS" || shipMethod === "711") && addr.storeId) {
          // 判斷物流類型 (給綠界看)
          // 7-11: UNIMARTC2C, 全家: FAMIC2C, 萊爾富: HILIFEC2C
          // 這裡做簡單判斷，建議前端可傳更精確的 provider
          if (shipMethod === "CVS") logisticsSubType = "FAMIC2C"; // 預設全家
          else logisticsSubType = "UNIMARTC2C"; // 7-11

          // 寫入 RY Tools / 綠界外掛 常用欄位
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

          // 優化地址顯示 (讓後台列表一眼看出門市)
          finalAddress = `${addr.storeName} (${addr.storeId}) - ${addr.storeAddr}`;
        }

        if (coupon?.code) {
          meta_data.push({ key: "_used_coupon_code", value: coupon.code });
        }

        const wcOrderPayload = {
          payment_method: "ecpay",
          payment_method_title: "綠界科技 ECPay",
          set_paid: false,
          billing: {
            first_name: addr.lastName,
            last_name: addr.firstName,
            address_1: finalAddress, // 地址欄顯示門市
            city: "Taipei",
            country: "TW",
            email: contact.email,
            phone: addr.phone,
          },
          shipping: {
            first_name: addr.lastName,
            last_name: addr.firstName,
            address_1: finalAddress, // 地址欄顯示門市
            country: "TW",
          },
          line_items: items.map((it) => ({
            product_id: it.wcProductId,
            quantity: it.qty,
          })),
          meta_data: meta_data, // 🔥 寫入 Meta Data
        };

        const wcRes = await fetch(`${BASE.replace(/\/$/, "")}/wp-json/wc/v3/orders`, {
          method: "POST",
          headers: { Authorization: auth, "Content-Type": "application/json" },
          body: JSON.stringify(wcOrderPayload),
        });
        const wcData = await wcRes.json();
        if (wcData.id) orderId = wcData.id;
        else console.error("WooCommerce 建單失敗:", wcData);

      } catch (wcErr) {
        console.error("WooCommerce Order Failed:", wcErr);
      }
    }

    // 3) 金額計算
    const totalAmountString = Math.floor(Number(total) || 0).toString();

    // ==========================================
    // 4) 綠界 AIO 參數設定
    // ==========================================
    const invItemName = ecpayEncode("網路商品一批");
    const invItemWord = ecpayEncode("式");
    const invCustomerEmail = ecpayEncode(contact.email);

    const ecpayParams: Record<string, string> = {
      MerchantID: MERCHANT_ID,
      MerchantTradeNo: tradeNo,
      MerchantTradeDate: getEcpayDate(),
      PaymentType: "aio",
      TotalAmount: totalAmountString,
      TradeDesc: ecpayEncode("Uflow_Shop"),
      ItemName: cleanItemName,
      ReturnURL: `${BASE_URL}/api/ecpay/callback`,
      OrderResultURL: `${BASE_URL}/thank-you?orderId=${orderId}`,
      ChoosePayment: "ALL",
      EncryptType: "1",
      CustomField1: String(orderId),
      CustomField2: contact.email,
      CustomField3: totalAmountString,

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

    const checkMacValue = generateCheckMacValue(ecpayParams);

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
    return NextResponse.json({ ok: false, message: e.message || "Unknown Error" }, { status: 500 });
  }
}