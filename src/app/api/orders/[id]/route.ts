// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";

// 強制宣告為動態路由，防止 build 時編譯錯誤
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  
  // 檢查環境變數是否存在
  const BASE = process.env.WC_API_BASE;
  const CK = process.env.WC_CONSUMER_KEY;
  const CS = process.env.WC_CONSUMER_SECRET;

  if (!BASE || !CK || !CS) {
    return NextResponse.json({ error: "伺服器配置錯誤" }, { status: 500 });
  }

  const auth = "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");

  try {
    // 確保 BASE 結尾沒有多餘斜線，並加上 cache: 'no-store' 確保資料即時
    const res = await fetch(`${BASE.replace(/\/$/, "")}/wp-json/wc/v3/orders/${id}`, {
      headers: { Authorization: auth },
      cache: "no-store", 
    });

    if (!res.ok) {
      return NextResponse.json({ error: "訂單不存在" }, { status: 404 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Fetch WC Order Error:", err);
    return NextResponse.json({ error: "無法獲獲取訂單" }, { status: 500 });
  }
}