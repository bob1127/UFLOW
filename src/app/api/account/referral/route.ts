// src/app/api/account/referral/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const runtime = "nodejs";

const BASE = process.env.WC_API_BASE!;
const CK = process.env.WC_CONSUMER_KEY!;
const CS = process.env.WC_CONSUMER_SECRET!;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

function basicAuth() {
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

async function fetchProfileWithSameCookies() {
  const cookie = headers().get("cookie") || "";
  const r = await fetch(`${NEXTAUTH_URL}/api/account/profile`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!r.ok) throw new Error("取得會員資料失敗");
  return r.json();
}

function genRefCode(customerId: number) {
  // 你可以換更漂亮的編碼（hash/base36）
  return `UF${customerId}`;
}

export async function GET() {
  try {
    const profile = await fetchProfileWithSameCookies();
    if (!profile?.loggedIn || !profile?.customer?.id) {
      return NextResponse.json({ ok: false, message: "未登入" }, { status: 401 });
    }

    const customerId = profile.customer.id;
    const authHeader = { Authorization: basicAuth() };

    // 讀 customer meta
    const uRes = await fetch(`${BASE}/wp-json/wc/v3/customers/${customerId}`, {
      headers: authHeader,
      cache: "no-store",
    });
    const user = await uRes.json();
    const meta: any[] = Array.isArray(user.meta_data) ? user.meta_data : [];

    let refCode = meta.find((m) => m.key === "uf_ref_code")?.value as string | undefined;

    if (!refCode) {
      refCode = genRefCode(customerId);

      // 寫入推薦碼（只寫一次）
      await fetch(`${BASE}/wp-json/wc/v3/customers/${customerId}`, {
        method: "PUT",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_data: [{ key: "uf_ref_code", value: refCode }],
        }),
      });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || NEXTAUTH_URL;
    const referralLink = `${origin}/register?ref=${encodeURIComponent(refCode)}`;

    return NextResponse.json({
      ok: true,
      refCode,
      referralLink,
      friendReward: 50,
      ambassadorReward: 200,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message || "error" }, { status: 500 });
  }
}
