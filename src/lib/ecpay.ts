// lib/ecpay.ts
import crypto from "crypto";

export function generateCheckMacValue(params: any, HashKey: string, HashIV: string) {
  // 1. 將參數依照 Key 字母排序 (A-Z)
  const keys = Object.keys(params).sort();

  // 2. 串接字串: HashKey=xxx&A=val&B=val...&HashIV=xxx
  let raw = `HashKey=${HashKey}`;
  keys.forEach((key) => {
    raw += `&${key}=${params[key]}`;
  });
  raw += `&HashIV=${HashIV}`;

  // 3. URL Encode (綠界的特殊規則：轉換成小寫後，將特定字元轉回符號)
  // 綠界要求 .NET 樣式的 Encode，這裡做簡單模擬
  let encoded = encodeURIComponent(raw).toLowerCase();

  // 修正 encodeURIComponent 沒處理到的符號，或綠界不編碼的符號
  encoded = encoded
    .replace(/%2d/g, "-")
    .replace(/%5f/g, "_")
    .replace(/%2e/g, ".")
    .replace(/%21/g, "!")
    .replace(/%2a/g, "*")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")");

  // 4. SHA256 加密
  const sha256 = crypto.createHash("sha256").update(encoded).digest("hex");

  // 5. 轉大寫
  return sha256.toUpperCase();
}

// 產生當前時間字串 yyyy/MM/dd HH:mm:ss
export function getEcpayDate() {
  const d = new Date();
  // 補零 helper
  const p = (n: number) => (n < 10 ? `0${n}` : n);
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}