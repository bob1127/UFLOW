// app/api/auth/login/route.ts
import { NextResponse } from "next/server";

const BASE = process.env.WC_API_BASE; // 例: https://inf.fjg.mybluehost.me/website_xxx
const isProd = process.env.NODE_ENV === "production";

// 若需跨子網域共用 cookie（api.example.com 與 shop.example.com），設成 .example.com；否則留空即可
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

// 設定 JWT 存活秒數（不設則為 session cookie）
const JWT_MAX_AGE_SECONDS = process.env.JWT_MAX_AGE_SECONDS
  ? Number(process.env.JWT_MAX_AGE_SECONDS)
  : 7 * 24 * 60 * 60; // 預設 7 天

// 登入/登出「必須同一份」cookie 屬性
function cookieOpts(
  extra?: Partial<Parameters<NextResponse["cookies"]["set"]>[1]>
) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
    domain: COOKIE_DOMAIN,
    ...(JWT_MAX_AGE_SECONDS ? { maxAge: JWT_MAX_AGE_SECONDS } : {}),
   
  };
}

export async function POST(req: Request) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { message: "環境變數 WC_API_BASE 未設定" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const username: string = String(body?.username || "").trim();
    const password: string = String(body?.password || "").trim();

    if (!username || !password) {
      return NextResponse.json(
        { message: "請輸入帳號/信箱與密碼" },
        { status: 400 }
      );
    }

    // 打 WordPress JWT 端點
    const wpRes = await fetch(`${BASE}/wp-json/jwt-auth/v1/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });

    const text = await wpRes.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }

    if (!wpRes.ok || !data?.token) {
      const msg =
        data?.message ||
        (wpRes.status === 401 ? "帳號或密碼錯誤" : `登入失敗（${wpRes.status}）`);
      return NextResponse.json(
        { message: msg, code: data?.code || String(wpRes.status) },
        { status: wpRes.status || 401 }
      );
    }

    const res = NextResponse.json(
      {
        ok: true,
        user: {
          email: data.user_email || "",
          name:
            data.user_display_name ||
            data.user_nicename ||
            data.user_email ||
            "",
        },
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );

    // 寫 cookie（名稱需和登出時一致）
    res.cookies.set("jwt", String(data.token), cookieOpts());
    if (data.user_email) {
      res.cookies.set("user_email", String(data.user_email), cookieOpts());
    }
    res.cookies.set(
      "user_name",
      String(
        data.user_display_name || data.user_nicename || data.user_email || ""
      ),
      cookieOpts()
    );

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "登入例外錯誤" },
      { status: 500 }
    );
  }
}
