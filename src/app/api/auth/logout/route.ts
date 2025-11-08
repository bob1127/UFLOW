// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

// 簡化的 Cookie 選項型別（夠用就好）
type CookieOpts = {
  httpOnly?: boolean;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
  path?: string;
  domain?: string;
  maxAge?: number;
};

function clearOpts(): CookieOpts {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    domain: COOKIE_DOMAIN,
    maxAge: 0, // 刪除 cookie
  };
}

export async function POST() {
  const res = NextResponse.json(
    { success: true },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );

  // 1) 你的自家 JWT cookies
  const customCookies = ["jwt", "user_email", "user_name"];

  // 2) NextAuth 相關 cookies（不同情境名子不一，全部清）
  const nextAuthCookies = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "next-auth.pkce.code_verifier",
    "next-auth.state",
  ];

  for (const name of [...customCookies, ...nextAuthCookies]) {
    res.cookies.set(name, "", clearOpts());
  }

  return res;
}
