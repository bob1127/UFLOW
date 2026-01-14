import { NextResponse } from "next/server";
import { generateCheckMacValue, getEcpayDate } from "@/lib/ecpay";

export const runtime = "nodejs";

const BASE = process.env.WC_API_BASE;
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

const SKIP_ECPAY_ON_LOCAL = process.env.SKIP_ECPAY_ON_LOCAL === "true";

function basicAuth() {
  if (!CK || !CS) return undefined;
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

// ✅ 新增：綠界電子發票欄位專用的 URL Encode 處理
// 綠界要求中文或特殊字元需進行編碼 (包含 Email)
function ecpayEncode(text: string) {
  return encodeURIComponent(text).replace(/%20/g, "+");
}

// ... (ReqBody 與 escapeHtmlAttr 保持不變) ...
type ReqBody = {
  items: Array<{
    wcProductId: number;
    qty: number;
    price: number;
    title: string;
  }>;
  contact: { email: string };
  addr: {
    firstName: string;
    lastName: string;
    line1: string;
    phone: string;
    storeId?: string;
    storeName?: string;
    storeAddr?: string;
  };
  shipMethod: "000" | "CVS" | "711";
  payMethod?: string;
  total?: number;
  coupon?: { code: string; amount: number } | null;
};

function escapeHtmlAttr(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
  try {
    // ... (前面驗證與變數宣告保持不變) ...
    const auth = basicAuth();
    if (!auth) {
      return NextResponse.json({ ok: false, message: "WooCommerce API key 未設定" }, { status: 500 });
    }
    if (!BASE) {
      return NextResponse.json({ ok: false, message: "WC_API_BASE 未設定" }, { status: 500 });
    }

    const body = (await req.json()) as ReqBody;
    const { items, contact, addr, shipMethod, coupon } = body;

    // ... (驗證 items, contact 保持不變) ...
    if (!items?.length) {
        return NextResponse.json({ ok: false, message: "購物車為空" }, { status: 400 });
    }
    if (!contact?.email) {
        return NextResponse.json({ ok: false, message: "缺少 email" }, { status: 400 });
    }

    // 1) 清洗商品名稱 (給金流介面看的，不用 Encode)
    const cleanItemName =
      items
        .map((it) => (it.title || "").replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ""))
        .join("#")
        .slice(0, 150) || "Uflow_Product";

    // 2) 地址
    const finalAddress = addr?.line1 || "";

    // 3) 綠界交易編號
    const tradeNo = `W${Date.now().toString().slice(-8)}`;

    // ... (4. 建立 WooCommerce 訂單保持不變) ...
    const wcOrderPayload: any = {
      // ... (這裡的 code 不用變) ...
      payment_method: "ecpay",
      payment_method_title: "綠界科技 ECPay",
      set_paid: false,
      billing: {
        first_name: addr.lastName,
        last_name: addr.firstName,
        address_1: finalAddress,
        city: "Taipei",
        postcode: "000",
        country: "TW",
        email: contact.email,
        phone: addr.phone,
      },
      shipping: {
        first_name: addr.lastName,
        last_name: addr.firstName,
        address_1: finalAddress,
        city: "Taipei",
        postcode: "000",
        country: "TW",
      },
      line_items: items.map((it) => ({
        product_id: it.wcProductId,
        quantity: it.qty,
      })),
      shipping_lines: [
        {
          method_id: "flat_rate",
          method_title: shipMethod === "000" ? "宅配寄送" : "超商取貨 (手動寄件)",
          total: "0",
        },
      ],
      meta_data: [
        { key: "_ecpay_trade_no", value: tradeNo },
        { key: "custom_shipping_label", value: shipMethod === "000" ? "Home" : "CVS" },
        { key: "_invoice_email", value: contact.email }, 
        { key: "_coupon_code", value: coupon?.code || "" },
        { key: "_coupon_amount", value: String(coupon?.amount || 0) },
        ...(SKIP_ECPAY_ON_LOCAL ? [{ key: "_dev_skip_ecpay", value: "true" }] : []),
      ],
    };

    const wcRes = await fetch(`${BASE}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(wcOrderPayload),
    });

    const wcData = await wcRes.json();
    if (!wcRes.ok) throw new Error(wcData?.message || "WC 訂單建立失敗");

    const orderId = wcData.id;

    // 計算總金額
    const totalFromClient = Number(body.total);
    const totalFromWc = Math.round(parseFloat(wcData.total));
    const totalAmount = Number.isFinite(totalFromClient) && totalFromClient > 0
      ? Math.round(totalFromClient)
      : totalFromWc;

    if (SKIP_ECPAY_ON_LOCAL) {
      return NextResponse.json({ ok: true, orderId, skippedEcpay: true });
    }

    const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    if (!NEXT_PUBLIC_BASE_URL) throw new Error("NEXT_PUBLIC_BASE_URL 未設定");
    if (!process.env.ECPAY_MERCHANT_ID) throw new Error("ECPAY_MERCHANT_ID 未設定");
    if (!process.env.ECPAY_HASH_KEY) throw new Error("ECPAY_HASH_KEY 未設定");
    if (!process.env.ECPAY_HASH_IV) throw new Error("ECPAY_HASH_IV 未設定");
    if (!process.env.ECPAY_API_URL) throw new Error("ECPAY_API_URL 未設定");

    // ==========================================
    // ✅ 修改重點：加入電子發票參數
    // ==========================================
    
    // 為了避免品項過多、長度限制或特殊符號導致編碼錯誤，
    // 電子發票品項建議統稱為「網路商品一批」，金額直接填總金額。
    const invItemName = ecpayEncode("網路商品一批");
    const invItemWord = ecpayEncode("式");
    
    const ecpayParams: any = {
      // --- 基本金流參數 ---
      MerchantID: process.env.ECPAY_MERCHANT_ID,
      MerchantTradeNo: tradeNo,
      MerchantTradeDate: getEcpayDate(),
      PaymentType: "aio",
      TotalAmount: totalAmount,
      TradeDesc: ecpayEncode("Uflow_Purchase"), // 建議也 encode 比較保險
      ItemName: cleanItemName, // 這是給金流看的 (不可 encode，綠界SDK會處理，或保持原樣)
      ReturnURL: `${NEXT_PUBLIC_BASE_URL}/api/ecpay/callback`,
      OrderResultURL: `${NEXT_PUBLIC_BASE_URL}/thank-you?orderId=${orderId}`,
      ChoosePayment: "ALL",
      EncryptType: "1",
      CustomField1: orderId.toString(),
      CustomField2: contact.email,
      CustomField3: String(totalAmount),

      // --- ✅ 電子發票參數 (E-Invoice) ---
      InvoiceMark: "Y",                       // 啟用電子發票
      RelateNumber: tradeNo,                  // 關聯編號 (可與訂單編號或交易編號相同)
      CustomerEmail: ecpayEncode(contact.email), // 客戶 Email (需 Encode)
      TaxType: "1",                           // 1: 應稅
      CarruerType: "1",                       // 1: 綠界會員載具 (無手機條碼時的預設，會寄信給客人)
      Donation: "0",                          // 0: 不捐贈
      Print: "0",                             // 0: 不列印 (B2C 通用)
      
      // 發票品項 (注意：發票金額需與 TotalAmount 一致)
      InvoiceItemName: invItemName,           // 商品名稱 (Encode)
      InvoiceItemCount: "1",                  // 數量
      InvoiceItemWord: invItemWord,           // 單位 (Encode)
      InvoiceItemPrice: String(totalAmount),  // 單價 (因為數量1，所以等於總價)
      InvoiceItemTaxType: "1",                // 1: 應稅
      
      // 客戶資訊 (B2C 不列印時可不填地址，但填了較完整)
      // CustomerName: ecpayEncode(addr.lastName + addr.firstName), // 選填
      // CustomerAddr: ecpayEncode(finalAddress),                   // 選填
      // CustomerPhone: addr.phone,                                 // 選填
      
      DelayDay: "0",                          // 0: 付款完成立即開立
      InvType: "07",                          // 07: 一般稅額
    };

    // 產生檢查碼 (CheckMacValue)
    // 注意：generateCheckMacValue 會將所有參數(含發票參數)納入計算
    ecpayParams.CheckMacValue = generateCheckMacValue(
      ecpayParams,
      process.env.ECPAY_HASH_KEY!,
      process.env.ECPAY_HASH_IV!
    );

    // 回傳 HTML Form
    const htmlForm = `
      <form id="_form_ecpay" action="${escapeHtmlAttr(process.env.ECPAY_API_URL!)}" method="POST">
        ${Object.keys(ecpayParams)
          .map((key) => {
            const val = ecpayParams[key] == null ? "" : String(ecpayParams[key]);
            return `<input type="hidden" name="${escapeHtmlAttr(key)}" value="${escapeHtmlAttr(val)}" />`;
          })
          .join("")}
      </form>
    `.trim();

    return NextResponse.json({ ok: true, orderId, html: htmlForm });
  } catch (e: any) {
    console.error("Checkout Error:", e);
    return NextResponse.json({ ok: false, message: e?.message || "Server error" }, { status: 500 });
  }
}