import crypto from "crypto";

function toFormUrlEncoded(str: string) {
  // 綠界文件寫「urlencode 後再 AES」:contentReference[oaicite:1]{index=1}
  return encodeURIComponent(str).replace(/%20/g, "+");
}

function aesEncryptToBase64(plain: string, key: string, iv: string) {
  // AES-128-CBC + PKCS7 padding（Node cipher 預設就是 PKCS padding）
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  cipher.setAutoPadding(true);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return enc.toString("base64");
}

export function getInvoiceIssueUrl() {
  // 綠界 B2CInvoice/Issue：測試/正式 :contentReference[oaicite:2]{index=2}
  const isProd = process.env.NODE_ENV === "production";
  return isProd
    ? "https://einvoice.ecpay.com.tw/B2CInvoice/Issue"
    : "https://einvoice-stage.ecpay.com.tw/B2CInvoice/Issue";
}

export type InvoiceIssueItem = {
  ItemName: string;
  ItemCount: number;
  ItemWord: string;
  ItemPrice: number;
  ItemTaxType?: string;
  ItemAmount: number;
  ItemRemark?: string;
};

export type IssueInvoiceInput = {
  relateNumber: string;     // 特店自訂編號（唯一）
  customerEmail: string;
  salesAmount: number;      // 必須與金流一致
  items: InvoiceIssueItem[];
};

export async function issueEcpayInvoice(input: IssueInvoiceInput) {
  const MerchantID = process.env.ECPAY_MERCHANT_ID || "";
  const HashKey = process.env.ECPAY_HASH_KEY || "";
  const HashIV = process.env.ECPAY_HASH_IV || "";

  if (!MerchantID) throw new Error("ECPAY_MERCHANT_ID 未設定");
  if (!HashKey) throw new Error("ECPAY_HASH_KEY 未設定");
  if (!HashIV) throw new Error("ECPAY_HASH_IV 未設定");
  if (HashKey.length !== 16 || HashIV.length !== 16) {
    throw new Error("ECPAY_HASH_KEY / ECPAY_HASH_IV 長度必須為 16（AES-128）");
  }

  const nowTs = Math.floor(Date.now() / 1000);

  // ✅ B2C 基本開立欄位（你目前需求：電子發票寄 email）
  const dataObj: any = {
    MerchantID,
    RelateNumber: input.relateNumber,
    CustomerEmail: input.customerEmail,
    Print: "0",          // 不列印
    Donation: "0",       // 不捐贈
    TaxType: "1",        // 應稅
    SalesAmount: input.salesAmount,
    InvType: "07",       // 一般稅額
    vat: "1",
    Items: input.items.map((it) => ({
      ItemName: it.ItemName,
      ItemCount: String(it.ItemCount),
      ItemWord: it.ItemWord,
      ItemPrice: String(it.ItemPrice),
      ItemTaxType: it.ItemTaxType || "1",
      ItemAmount: String(it.ItemAmount),
      ItemRemark: it.ItemRemark || "",
    })),
  };

  const jsonStr = JSON.stringify(dataObj);
  const urlEncoded = toFormUrlEncoded(jsonStr);
  const encrypted = aesEncryptToBase64(urlEncoded, HashKey, HashIV);

  const payload = {
    MerchantID,
    RqHeader: { Timestamp: nowTs },
    Data: encrypted,
  };

  const res = await fetch(getInvoiceIssueUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await res.json().catch(() => ({} as any));
  if (!res.ok) {
    throw new Error(result?.Message || result?.message || "Invoice API HTTP error");
  }

  // 綠界回傳格式會含 Status / Message / Data（Data 仍是加密內容）
  return result;
}
