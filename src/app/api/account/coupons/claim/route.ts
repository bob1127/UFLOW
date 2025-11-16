// src/app/api/account/coupons/claim/route.ts
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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const kind: "upgrade" | "birthday" = body.kind;

    if (!["upgrade", "birthday"].includes(kind)) {
      return NextResponse.json({ ok: false, message: "領取類型不正確" }, { status: 400 });
    }

    // 取得會員資料
    const profile = await fetchProfileWithSameCookies();
    if (!profile?.loggedIn || !profile.customer?.id) {
      return NextResponse.json({ ok: false, message: "請先登入會員" }, { status: 401 });
    }

    const customerId = profile.customer.id;
    const tier = profile.membership?.tierName;

    // 決定禮金
    const upgradeGift = profile.membership?.upgradeGift || 0;
    const birthdayCredit = profile.membership?.birthdayCredit || 0;

    const amount = kind === "upgrade" ? upgradeGift : birthdayCredit;
    if (amount <= 0) {
      return NextResponse.json({ ok: false, message: "目前等級無對應禮金。" }, { status: 400 });
    }

    const authHeader = { Authorization: basicAuth() };

    // 取得客戶 meta
    const uRes = await fetch(`${BASE}/wp-json/wc/v3/customers/${customerId}`, {
      headers: authHeader,
      cache: "no-store",
    });
    const user = await uRes.json();

    const meta: any[] = Array.isArray(user.meta_data) ? user.meta_data : [];

    // ====== 🎂 生日禮「只要生日當月可領一次」 ======
    if (kind === "birthday") {
      const now = new Date();
      const month = now.getMonth() + 1; // 1~12
      const metaKey = `uf_birthday_claim_${month}`;

      const claimed = meta.find((m) => m.key === metaKey && m.value === "1");

      if (claimed) {
        return NextResponse.json({
          ok: true,
          already: true,
          message: "本月生日禮金已領取過，請於結帳時使用折扣碼。",
        });
      }

      // 共用折扣碼（每年只用一個）
      const code = `UFBD-${month}`; // 每月一碼，例如：UFBD-11

      // 檢查是否存在
      let coupon: any = null;
      const s = await fetch(`${BASE}/wp-json/wc/v3/coupons?code=${code}`, {
        headers: authHeader,
      });
      const arr = await s.json();
      if (Array.isArray(arr) && arr.length > 0) {
        coupon = arr[0];
      } else {
        // 建立
        const expires = new Date();
        expires.setMonth(expires.getMonth() + 2); // 有效兩個月 (你可調整)

        const c = await fetch(`${BASE}/wp-json/wc/v3/coupons`, {
          method: "POST",
          headers: { ...authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            discount_type: "fixed_cart",
            amount: String(amount),
            usage_limit: 0,
            usage_limit_per_user: 1,
            description: `生日禮金 ${amount} 元（本月適用）`,
            date_expires: expires.toISOString(),
            meta_data: [{ key: "uflow_is_shared", value: "1" }],
          }),
        });

        coupon = await c.json();
      }

      // 紀錄本月已領
      await fetch(`${BASE}/wp-json/wc/v3/customers/${customerId}`, {
        method: "PUT",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_data: [{ key: `uf_birthday_claim_${month}`, value: "1" }],
        }),
      });

      return NextResponse.json({
        ok: true,
        already: false,
        coupon,
        message: "生日禮金領取成功！",
      });
    }

    // ====== 🔼 升等禮（維持只能領一次） ======
    const uKey = `uf_upgrade_claimed`;
    const uClaimed = meta.find((m) => m.key === uKey && m.value === "1");

    if (uClaimed) {
      return NextResponse.json({
        ok: true,
        already: true,
        message: "升等禮已領取過。",
      });
    }

    // 升等禮共用折扣碼
    const upgradeCode = `UFUP-${new Date().getFullYear()}`;
    let coupon: any = null;

    const s2 = await fetch(`${BASE}/wp-json/wc/v3/coupons?code=${upgradeCode}`, {
      headers: authHeader,
    });
    const arr2 = await s2.json();

    if (Array.isArray(arr2) && arr2.length > 0) {
      coupon = arr2[0];
    } else {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);

      const c2 = await fetch(`${BASE}/wp-json/wc/v3/coupons`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          code: upgradeCode,
          discount_type: "fixed_cart",
          amount: String(amount),
          usage_limit: 0,
          usage_limit_per_user: 1,
          date_expires: expires.toISOString(),
          description: `升等禮購物金 ${amount} 元`,
        }),
      });

      coupon = await c2.json();
    }

    // 寫入 meta：已領取
    await fetch(`${BASE}/wp-json/wc/v3/customers/${customerId}`, {
      method: "PUT",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({
        meta_data: [{ key: uKey, value: "1" }],
      }),
    });

    return NextResponse.json({
      ok: true,
      already: false,
      coupon,
      message: "升等禮領取成功！",
    });

  } catch (err) {
    console.error("claim coupon error:", err);
    return NextResponse.json({ ok: false, message: "系統錯誤" }, { status: 500 });
  }
}
