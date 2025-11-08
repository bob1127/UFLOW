// src/lib/auth-options.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/** WooCommerce 基本設定（只在 server 端使用） */
const BASE = process.env.WC_API_BASE!;
const CK = process.env.WC_CONSUMER_KEY!;
const CS = process.env.WC_CONSUMER_SECRET!;

function basicAuth() {
  // 注意：這段需要 Node runtime（Edge 環境沒有 Buffer）
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

/** 依 email 查或建 WooCommerce Customer */
async function upsertWooCustomer(email: string, name?: string) {
  const headers = {
    Authorization: basicAuth(),
    "Content-Type": "application/json",
  };

  // 1) 查是否已存在
  const q = await fetch(
    `${BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
    { headers, cache: "no-store" }
  );
  const arr = (await q.json().catch(() => [])) || [];
  if (Array.isArray(arr) && arr.length > 0) return arr[0];

  // 2) 不存在則建立
  const [first, ...rest] = (name || "").trim().split(/\s+/);
  const last = rest.join(" ");
  const r = await fetch(`${BASE}/wp-json/wc/v3/customers`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      username: email,
      first_name: first || "",
      last_name: last || "",
      // 可選：隨機密碼，讓 WP 端帳號完整
      password: Math.random().toString(36).slice(2, 12),
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Woo upsert failed: ${t}`);
  }
  return r.json();
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login", // 使用你的自訂登入頁
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // scope 預設含 openid email profile
    }),
  ],
  callbacks: {
    /** Google 完成後，確保 Woo 顧客存在 */
    async signIn({ user }) {
      if (!user?.email) return false;
      try {
        await upsertWooCustomer(user.email, user.name || undefined);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },

    /** 把 email/name/customerId 放進 JWT */
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        token.name = user.name || token.name;

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
          if (customer?.id) (token as any).customerId = Number(customer.id);
        } catch {
          // ignore
        }
      }
      return token;
    },

    /** 將 JWT 欄位帶到 session（前端可讀） */
    async session({ session, token }) {
      if (token?.email)
        session.user = { ...(session.user || {}), email: token.email as string };
      if (token?.name)
        session.user = { ...(session.user || {}), name: token.name as string };
      if ((token as any)?.customerId)
        (session as any).customerId = (token as any).customerId;
      return session;
    },
  },
};
