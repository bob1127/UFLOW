import crypto from "crypto";

// 修正：精準模擬 PHP 的 urlencode 行為，綠界發票專用
function ecpayUrlEncode(str: string) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/%20/g, "+");
}

function aesEncryptToBase64(plain: string, key: string, iv: string) {
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  cipher.setAutoPadding(true);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return enc.toString("base64");
}

function aesDecryptFromBase64(base64Cipher: string, key: string, iv: string) {
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  decipher.setAutoPadding(true);
  const dec = Buffer.concat([
    decipher.update(Buffer.from(base64Cipher, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

export function getInvoiceIssueUrl() {
  return "https://einvoice.ecpay.com.tw/B2CInvoice/Issue";
}

export type InvoiceIssueItem = {
  ItemName: string;
  ItemCount: number;
  ItemWord: string;
  ItemPrice: number;
  ItemAmount: number;
  ItemTaxType?: string;
  ItemRemark?: string;
};

export type IssueInvoiceInput = {
  relateNumber: string; 
  customerEmail: string;
  salesAmount: number;
  items: InvoiceIssueItem[];
};

export async function issueEcpayInvoice(input: IssueInvoiceInput) {
  const MerchantID = process.env.ECPAY_INVOICE_MERCHANT_ID || process.env.ECPAY_MERCHANT_ID || "";
  const HashKey = process.env.ECPAY_INVOICE_HASH_KEY || ""; 
  const HashIV = process.env.ECPAY_INVOICE_HASH_IV || "";   

  if (!MerchantID || !HashKey || !HashIV) throw new Error("發票金鑰未設定");

  const sum = input.items.reduce((s, it) => s + Number(it.ItemAmount), 0);
  if (sum !== Number(input.salesAmount)) throw new Error("SalesAmount 必須等於 Items 合計");

  const nowTs = Math.floor(Date.now() / 1000);

  const dataObj: any = {
    MerchantID,
    RelateNumber: input.relateNumber,
    CustomerEmail: input.customerEmail,
    Print: "0",
    Donation: "0",
    CarrierType: "",
    CarrierNum: "",
    TaxType: "1",
    SalesAmount: Number(input.salesAmount),
    InvType: "07",
    vat: "1",
    Items: input.items.map((it, idx) => ({
      ItemSeq: idx + 1,
      ItemName: it.ItemName,
      ItemCount: Number(it.ItemCount),
      ItemWord: it.ItemWord,
      ItemPrice: Number(it.ItemPrice),
      ItemTaxType: it.ItemTaxType || "1",
      ItemAmount: Number(it.ItemAmount),
      ItemRemark: it.ItemRemark || "",
    })),
  };

  const jsonStr = JSON.stringify(dataObj);
  const urlEncodedJson = ecpayUrlEncode(jsonStr);
  
  // 🚨 關鍵修復：加密後的 Base64 字串，絕對不可以再做 URL Encode
  const base64Cipher = aesEncryptToBase64(urlEncodedJson, HashKey, HashIV);

  const payload = {
    MerchantID,
    RqHeader: { Timestamp: nowTs },
    Data: base64Cipher, // 直接塞入純 Base64 字串
  };

  const res = await fetch(getInvoiceIssueUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  let result: any = {};
  try { result = JSON.parse(raw); } catch {}

  if (!res.ok) throw new Error(`Invoice API HTTP ${res.status} :: ${raw}`);
  if (result?.TransCode !== 1) throw new Error(`Invoice API Failed :: ${raw}`);

  return result;
}