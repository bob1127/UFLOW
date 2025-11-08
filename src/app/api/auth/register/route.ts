// app/api/auth/register/route.ts
import { NextResponse } from "next/server";

const BASE = process.env.WC_API_BASE; // https://inf.fjg.mybluehost.me/website_xxx
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

function basicAuth() {
  if (!CK || !CS) throw new Error("缺少 WooCommerce consumer key/secret");
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

export async function POST(req: Request) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { message: "未設定 WC_API_BASE 環境變數" },
        { status: 500 }
      );
    }

    const { email, username, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "缺少 email 或 password" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BASE}/wp-json/wc/v3/customers`, {
      method: "POST",
      headers: {
        Authorization: basicAuth(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        username: username || email,
        password,
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "WooCommerce 建立帳號失敗" },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { ok: true, user: data },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "伺服器錯誤" },
      { status: 500 }
    );
  }
}
