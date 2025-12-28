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

  // ✅ 由前端 pricing.total 傳入（含折扣後），讓金流/發票一致
  total?: number;

  // ✅ 已套用折價券（固定折抵）
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
    const auth = basicAuth();
    if (!auth) {
      return NextResponse.json({ ok: false, message: "WooCommerce API key 未設定" }, { status: 500 });
    }
    if (!BASE) {
      return NextResponse.json({ ok: false, message: "WC_API_BASE 未設定" }, { status: 500 });
    }

    const body = (await req.json()) as ReqBody;
    const { items, contact, addr, shipMethod, coupon } = body;

    if (!items?.length) {
      return NextResponse.json({ ok: false, message: "購物車為空" }, { status: 400 });
    }
    if (!contact?.email) {
      return NextResponse.json({ ok: false, message: "缺少 email" }, { status: 400 });
    }

    // 1) 清洗商品名稱（避免綠界 ItemName 規則問題）
    const cleanItemName =
      items
        .map((it) => (it.title || "").replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ""))
        .join("#")
        .slice(0, 150) || "Uflow_Product";

    // 2) 地址
    const finalAddress = addr?.line1 || "";

    // 3) 綠界交易編號（<= 20，英文數字）
    const tradeNo = `W${Date.now().toString().slice(-8)}`;

    // 4) 建立 WooCommerce 訂單
    const wcOrderPayload: any = {
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
        { key: "_invoice_email", value: contact.email }, // ✅ 開發票用
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

    // ✅ 金額以「前端 total」為主（含折扣後），確保金流/發票一致
    const totalFromClient = Number(body.total);
    const totalFromWc = Math.round(parseFloat(wcData.total));
    const totalAmount = Number.isFinite(totalFromClient) && totalFromClient > 0
      ? Math.round(totalFromClient)
      : totalFromWc;

    // ✅ localhost / dev：跳過綠界
    if (SKIP_ECPAY_ON_LOCAL) {
      return NextResponse.json({ ok: true, orderId, skippedEcpay: true });
    }

    const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    if (!NEXT_PUBLIC_BASE_URL) throw new Error("NEXT_PUBLIC_BASE_URL 未設定");

    if (!process.env.ECPAY_MERCHANT_ID) throw new Error("ECPAY_MERCHANT_ID 未設定");
    if (!process.env.ECPAY_HASH_KEY) throw new Error("ECPAY_HASH_KEY 未設定");
    if (!process.env.ECPAY_HASH_IV) throw new Error("ECPAY_HASH_IV 未設定");
    if (!process.env.ECPAY_API_URL) throw new Error("ECPAY_API_URL 未設定");

    const ecpayParams: any = {
      MerchantID: process.env.ECPAY_MERCHANT_ID,
      MerchantTradeNo: tradeNo,
      MerchantTradeDate: getEcpayDate(),
      PaymentType: "aio",
      TotalAmount: totalAmount,
      TradeDesc: "Uflow_Purchase",
      ItemName: cleanItemName,
      ReturnURL: `${NEXT_PUBLIC_BASE_URL}/api/ecpay/callback`,
      OrderResultURL: `${NEXT_PUBLIC_BASE_URL}/thank-you?orderId=${orderId}`,
      ChoosePayment: "ALL",
      EncryptType: "1",
      CustomField1: orderId.toString(),       // ✅ callback 用
      CustomField2: contact.email,            // ✅ 直接帶回來開發票用
      CustomField3: String(totalAmount),      // ✅ 讓 callback 不用猜
    };

    ecpayParams.CheckMacValue = generateCheckMacValue(
      ecpayParams,
      process.env.ECPAY_HASH_KEY!,
      process.env.ECPAY_HASH_IV!
    );

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
