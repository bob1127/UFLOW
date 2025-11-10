// src/lib/auth-options.ts
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

/** ===== WooCommerce 基本設定 ===== */
const BASE = process.env.WC_API_BASE!;
const CK = process.env.WC_CONSUMER_KEY!;
const CS = process.env.WC_CONSUMER_SECRET!;

function basicAuth() {
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

/** 以 email upsert Woo 客戶（沒有就建立） */
async function upsertWooCustomer(email: string, name?: string) {
  const headers = {
    Authorization: basicAuth(),
    "Content-Type": "application/json",
  };

  // 1) 查是否存在
  const q = await fetch(
    `${BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
    { headers, cache: "no-store" }
  );
  const arr = (await q.json().catch(() => [])) || [];
  if (Array.isArray(arr) && arr.length > 0) return arr[0];

  // 2) 不存在 → 建立
  const [first, ...rest] = String(name || "").trim().split(/\s+/);
  const last = rest.join(" ");
  const r = await fetch(`${BASE}/wp-json/wc/v3/customers`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      username: email,
      first_name: first || "",
      last_name: last || "",
      // 只是初次建立需要；之後用 OAuth 都不會再用到
      password: Math.random().toString(36).slice(2, 12),
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Woo upsert failed: ${t}`);
  }
  return r.json();
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login", // 維持你自訂的登入頁 UI
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      // 預設 scope 已含 email, public_profile；若要額外欄位可加：
      // authorization: { params: { scope: "email,public_profile" } },
    }),
  ],
  callbacks: {
    /** OAuth 成功回來後：確保 Woo 端有對應客戶 */
    async signIn({ user }) {
      if (!user?.email) return false;
      try {
        await upsertWooCustomer(user.email, user.name || undefined);
        return true;
      } catch (e) {
        console.error("upsertWooCustomer error:", e);
        return false;
      }
    },

    /** 把 email/name 與 Woo customerId 帶到 JWT */
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        if (user.name) token.name = user.name;

        try {
          const headers = { Authorization: basicAuth() };
          const q = await fetch(
            `${BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(
              user.email
            )}`,
            { headers, cache: "no-store" }
          );
          const arr = (await q.json().catch(() => [])) || [];
          const customer = Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
          if (customer?.id) token.customerId = Number(customer.id);
        } catch {
          /* ignore */
        }
      }
      return token;
    },

    /** 前端 session：補上 email/name/customerId */
    async session({ session, token }) {
      if (!session.user) session.user = {};
      if (token?.email) session.user.email = token.email as string;
      if (token?.name) session.user.name = token.name as string;
      if (token?.customerId) (session as any).customerId = token.customerId;
      return session;
    },
  },
};
