// src/lib/ecpay-invoice.ts
import crypto from "crypto";

function phpUrlEncode(str: string) {
  // 模擬 PHP urlencode 行為（綠界文件常用）
  // 空白 => +
  // * ( ) ! 等保留字處理
  return encodeURIComponent(str)
    .replace(/%20/g, "+")
    .replace(/%21/g, "!")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")")
    .replace(/%2a/gi, "*");
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

function phpUrlDecode(str: string) {
  // PHP urldecode：+ => 空白
  return decodeURIComponent(str.replace(/\+/g, "%20"));
}

export function getInvoiceIssueUrl() {
  // ✅ 只走正式
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
  relateNumber: string; // 必須唯一、英數、不建議太長（<=30 最安全）
  customerEmail: string;
  salesAmount: number;
  items: InvoiceIssueItem[];
};

export async function issueEcpayInvoice(input: IssueInvoiceInput) {
  const MerchantID = process.env.ECPAY_MERCHANT_ID || "";
  const HashKey = process.env.ECPAY_HASH_KEY || "";
  const HashIV = process.env.ECPAY_HASH_IV || "";

  if (!MerchantID) throw new Error("ECPAY_MERCHANT_ID 未設定");
  if (!HashKey || !HashIV) throw new Error("ECPAY_HASH_KEY / ECPAY_HASH_IV 未設定");
  if (HashKey.length !== 16 || HashIV.length !== 16) {
    throw new Error("ECPAY_HASH_KEY / ECPAY_HASH_IV 長度必須為 16（AES-128）");
  }

  // ✅ SalesAmount 要等於 Items 加總（避免後續被打槍）
  const sum = input.items.reduce((s, it) => s + Number(it.ItemAmount), 0);
  if (sum !== Number(input.salesAmount)) {
    throw new Error(`SalesAmount(${input.salesAmount}) 必須等於 Items 合計(${sum})`);
  }

  const nowTs = Math.floor(Date.now() / 1000);

  const dataObj: any = {
    MerchantID,
    RelateNumber: input.relateNumber,
    CustomerEmail: input.customerEmail,

    // 你目前需求：寄 email，不列印、不捐贈、無載具
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

  // 1) JSON
  const jsonStr = JSON.stringify(dataObj);

  // 2) 先 urlencode（PHP 風格）
  const urlEncodedJson = phpUrlEncode(jsonStr);

  // 3) AES -> base64
  const base64Cipher = aesEncryptToBase64(urlEncodedJson, HashKey, HashIV);

  // 4) ⚠️ base64 再 urlencode（避免 + / = 傳輸被吃）
  const dataField = phpUrlEncode(base64Cipher);

  const payload = {
    MerchantID,
    RqHeader: { Timestamp: nowTs },
    Data: dataField,
  };

  const res = await fetch(getInvoiceIssueUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  let result: any = {};
  try {
    result = JSON.parse(raw);
  } catch {
    // ignore
  }

  if (!res.ok) {
    throw new Error(`Invoice API HTTP ${res.status} :: ${raw}`);
  }

  // ✅ 綠界常常 HTTP 200 但業務失敗，要看 TransCode / TransMsg
  if (result?.TransCode !== 1) {
    throw new Error(`Invoice API Failed :: ${raw}`);
  }

  // 若你想在本地直接看到 RtnCode，可以把回傳 Data 解開
  if (result?.Data) {
    try {
      const base64FromApi = phpUrlDecode(String(result.Data));
      const decrypted = aesDecryptFromBase64(base64FromApi, HashKey, HashIV);
      const json = JSON.parse(phpUrlDecode(decrypted));
      result.__decrypted = json; // { RtnCode, RtnMsg, InvoiceNo... }
    } catch (e) {
      // 解不開也不影響主流程
    }
  }

  return result;
}
