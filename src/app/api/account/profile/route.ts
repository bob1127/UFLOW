// app/api/account/profile/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
// ✅ 正確匯入位置（有 @ 別名）：
import { authOptions } from "@/lib/auth-options";
// ✅ 若沒有 @ 別名，用相對路徑（照你的專案層級調整）：
// import { authOptions } from "../../../lib/auth-options";

export const runtime = "nodejs"; // 因為下面會用到 Buffer/basicAuth

const BASE =
  process.env.WC_API_BASE || "https://inf.fjg.mybluehost.me/website_4ad5d5f2";
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

function basicAuth() {
  if (!CK || !CS) return undefined;
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

export async function GET() {
  const noCache = { "Cache-Control": "no-store, no-cache, must-revalidate" };

  try {
    /* ===== 1) 先讀 NextAuth Session（Google SSO） ===== */
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      // 若 callbacks 已把 customerId 放到 session，就直接拿；否則用 email 查一次
      let customerId: number | undefined = (session as any)?.customerId;

      if (!customerId && CK && CS) {
        try {
          const auth = basicAuth();
          if (auth) {
            const r = await fetch(
              `${BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(
                session.user.email
              )}`,
              { headers: { Authorization: auth }, cache: "no-store" }
            );
            const arr = (await r.json().catch(() => [])) as any[];
            if (Array.isArray(arr) && arr.length > 0) {
              customerId = Number(arr[0]?.id);
            }
          }
        } catch {
          /* ignore */
        }
      }

      const displayName =
        session.user.name || session.user.email.split("@")[0] || "會員";

      return NextResponse.json(
        {
          loggedIn: true,
          customer: {
            id: customerId, // 這是 Woo customerId（可能為 undefined）
            email: session.user.email,
            username: displayName,
            first_name: session.user.name || "",
            last_name: "",
          },
          source: "nextauth",
        },
        { headers: noCache }
      );
    }

    /* ===== 2) 沒有 NextAuth → 回退你的 JWT Cookie（WP JWT） ===== */
    const jwt = cookies().get("jwt")?.value;
    if (!jwt) {
      return NextResponse.json({ loggedIn: false }, { headers: noCache });
    }

    const meRes = await fetch(`${BASE}/wp-json/wp/v2/users/me`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!meRes.ok) {
      // token 失效/過期 → 當未登入
      return NextResponse.json({ loggedIn: false }, { headers: noCache });
    }

    const me = await meRes.json();
    const customer = {
      id: me?.id, // 這是 WP userId；要 Woo customerId 請用 email 再查 wc/v3/customers
      email: me?.email,
      username: me?.slug || me?.username || me?.name,
      first_name: me?.first_name || "",
      last_name: me?.last_name || "",
    };

    return NextResponse.json(
      { loggedIn: true, customer, source: "jwt" },
      { headers: noCache }
    );
  } catch {
    return NextResponse.json({ loggedIn: false }, { headers: noCache });
  }
}
