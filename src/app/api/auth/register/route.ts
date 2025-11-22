// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const BASE = process.env.WC_API_BASE;
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;
const RESET_SECRET = process.env.RESET_TOKEN_SECRET!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function basicAuth() {
  if (!CK || !CS) throw new Error("缺少 WooCommerce consumer key/secret");
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP 設定不完整");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/* =========================
   ✅ referral helpers
========================= */

// 你前面方案用 UF{id} 當 refCode，這裡直接解析
function parseAmbassadorId(ref?: string | null): number | null {
  if (!ref) return null;
  const s = String(ref).trim();
  if (!s.startsWith("UF")) return null;
  const n = Number(s.replace("UF", ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

// 確認這個 ambassadorId 真的存在（避免亂填）
async function ensureAmbassadorExists(id: number): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/wp-json/wc/v3/customers/${id}`, {
      headers: { Authorization: basicAuth() },
      cache: "no-store",
    });
    return r.ok;
  } catch {
    return false;
  }
}

// 給親友 50 元註冊禮（一次）
async function grantFriendCoupon(newCustomerId: number, ambassadorId: number) {
  const authHeader = { Authorization: basicAuth() };

  // 讀新客 meta，確認沒給過
  const uRes = await fetch(`${BASE}/wp-json/wc/v3/customers/${newCustomerId}`, {
    headers: authHeader,
    cache: "no-store",
  });
  const user = await uRes.json();
  const meta: any[] = Array.isArray(user.meta_data) ? user.meta_data : [];

  const already = meta.find(
    (m) => m.key === "uf_ref_signup_rewarded" && String(m.value) === "1"
  );
  if (already) return;

  const code = `UFFRD-${newCustomerId}`; // 一人一碼
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 2);

  // 建 coupon（限定 email）
  await fetch(`${BASE}/wp-json/wc/v3/coupons`, {
    method: "POST",
    headers: { ...authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      discount_type: "fixed_cart",
      amount: "50",
      individual_use: true,
      usage_limit: 1,
      usage_limit_per_user: 1,
      email_restrictions: [user.email],
      date_expires: expires.toISOString(),
      description: "好友推薦註冊禮 50 元",
      meta_data: [
        { key: "uf_ref_friend_coupon", value: "1" },
        { key: "uf_referred_by", value: String(ambassadorId) },
      ],
    }),
  });

  // 寫 meta 防止重發
  await fetch(`${BASE}/wp-json/wc/v3/customers/${newCustomerId}`, {
    method: "PUT",
    headers: { ...authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({
      meta_data: [{ key: "uf_ref_signup_rewarded", value: "1" }],
    }),
  });
}

export async function POST(req: Request) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { message: "未設定 WC_API_BASE 環境變數" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const email: string = String(body.email || "").trim().toLowerCase();
    const username: string = String(body.username || "").trim();
    const password: string = String(body.password || "");
    const ref: string | null = body.ref ? String(body.ref) : null;

    if (!email || !password) {
      return NextResponse.json(
        { message: "缺少 email 或 password" },
        { status: 400 }
      );
    }

    /* =========================
       ✅ referral: parse + verify
    ========================= */
    const ambassadorId = parseAmbassadorId(ref);
    const ambassadorOk =
      ambassadorId ? await ensureAmbassadorExists(ambassadorId) : false;

    // 1) 建立 WooCommerce customer，預設 email 未驗證
    const meta_data: any[] = [{ key: "email_verified", value: "0" }];

    // ✅ referral: 若 ref 合法，先寫 uf_referred_by
    if (ambassadorOk && ambassadorId) {
      meta_data.push({
        key: "uf_referred_by",
        value: String(ambassadorId),
      });
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
        meta_data,
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

    const newCustomerId: number = data.id;

    // ✅ WooCommerce 實際建立的 email（防止前端送錯、或 WC 回傳不同值）
    const createdEmail = String(data?.email || email).trim().toLowerCase();

    /* =========================
       ✅ referral: grant 50 after create
       - 避免自我推薦: ambassadorId !== newCustomerId
    ========================= */
    if (ambassadorOk && ambassadorId && ambassadorId !== newCustomerId) {
      try {
        await grantFriendCoupon(newCustomerId, ambassadorId);
      } catch (e) {
        console.error("grantFriendCoupon error:", e);
        // 不影響註冊流程
      }
    }

    // 2) 產生驗證 token（用 createdEmail）
    const token = jwt.sign(
      {
        type: "verify-email",
        email: createdEmail,
        customerId: newCustomerId,
      },
      RESET_SECRET,
      { expiresIn: "1d" }
    );

    const url = new URL("/verify-email", SITE_URL);
    url.searchParams.set("token", token);

    // 3) 寄出驗證信（可觀測 + 不吞錯）
    try {
      const transporter = createTransport();

      // ✅ 先 verify SMTP 連線
      await transporter.verify();

      const mailFrom = process.env.SMTP_USER!;
      const html = `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6;">
          <h2>會員註冊信箱驗證</h2>
          <p>親愛的會員您好：</p>
          <p>感謝您註冊 UFLOW 會員，請點擊下方按鈕完成信箱驗證：</p>
          <p style="margin: 24px 0;">
            <a href="${url.toString()}"
               style="display:inline-block;padding:10px 18px;background:#111;color:#fff;text-decoration:none;border-radius:999px;">
              完成信箱驗證
            </a>
          </p>
          <p>如果按鈕無法點擊，請將以下連結複製到瀏覽器開啟：</p>
          <p style="word-break: break-all;">${url.toString()}</p>
          <p>此連結將在 24 小時後失效。</p>
          <p style="margin-top: 24px;">UFLOW 官方網站</p>
        </div>
      `;

      const info = await transporter.sendMail({
        from: mailFrom,
        to: createdEmail,
        subject: "UFLOW – 信箱驗證",
        html,
      });

      console.log("[verify-email] sent:", info.messageId, info.response);
    } catch (e) {
      console.error("send verify email error:", e);
      // ✅ 寄信失敗就不要假裝成功
      return NextResponse.json(
        { ok: false, message: "驗證信寄送失敗，請稍後重試或聯絡客服。" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        user: data,
        message: "註冊成功，請前往信箱完成驗證。",
        referralApplied: ambassadorOk ? true : false,
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (err: any) {
    console.error("register error:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "伺服器錯誤" },
      { status: 500 }
    );
  }
}
