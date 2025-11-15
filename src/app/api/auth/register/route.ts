// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const BASE = process.env.WC_API_BASE;
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;
const RESET_SECRET = process.env.RESET_TOKEN_SECRET!; // ✅ 沿用原本的
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

    // 1) 建立 WooCommerce customer，預設 email 未驗證
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
        meta_data: [
          { key: "email_verified", value: "0" }, // 0 = 未驗證
        ],
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

    // 2) 產生驗證 token（用 RESET_TOKEN_SECRET）
    const token = jwt.sign(
      {
        type: "verify-email",
        email,
        customerId: data.id,
      },
      RESET_SECRET,
      { expiresIn: "1d" } // 連結有效 1 天
    );

    const url = new URL("/verify-email", SITE_URL);
    url.searchParams.set("token", token);

    // 3) 寄出驗證信（沿用 SMTP_*）
    try {
      const transporter = createTransport();
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

      await transporter.sendMail({
        from: mailFrom,
        to: email,
        subject: "UFLOW – 信箱驗證",
        html,
      });
    } catch (e) {
      console.error("send verify email error:", e);
      // 信寄失敗你可以視需求決定要不要直接擋掉註冊
    }

    return NextResponse.json(
      {
        ok: true,
        user: data,
        message: "註冊成功，請前往信箱完成驗證。",
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (err: any) {
    console.error("register error:", err);
    return NextResponse.json(
      { message: err?.message || "伺服器錯誤" },
      { status: 500 }
    );
  }
}
