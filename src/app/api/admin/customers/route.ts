// src/app/api/admin/customers/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// 強制宣告為動態路由
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE = process.env.WC_API_BASE || "https://inf.fjg.mybluehost.me/website_4ad5d5f2";
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

function basicAuth() {
  if (!CK || !CS) return undefined;
  return "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
}

function calcTier(totalSpent: number) {
  if (totalSpent >= 35000) return "VVIP 貴賓";
  if (totalSpent >= 10000) return "VIP 貴賓";
  if (totalSpent >= 6000) return "金貴賓";
  if (totalSpent >= 2000) return "銀貴賓";
  if (totalSpent > 0) return "銅貴賓";
  return "尚未消費";
}

function getMetaValue(meta: any[], key: string): any {
  return meta?.find((m) => m.key === key)?.value;
}

function parseRewardedList(val: any): number[] {
  try {
    const arr = JSON.parse(String(val || "[]"));
    return Array.isArray(arr) ? arr.map((x) => Number(x)).filter(Boolean) : [];
  } catch { return []; }
}

async function fetchOrdersSummaryForCustomer(customerId: number, auth: string) {
  const url = `${BASE}/wp-json/wc/v3/orders?customer=${customerId}&per_page=50&status=any`;
  const res = await fetch(url, { headers: { Authorization: auth }, cache: "no-store" });
  if (!res.ok) return { totalSpent: 0, ordersCount: 0, lastOrderDate: null };
  const batch = await res.json();
  let totalSpent = 0;
  batch.forEach((o: any) => totalSpent += (parseFloat(o.total) || 0));
  return { totalSpent, ordersCount: batch.length, lastOrderDate: batch[0]?.date_created || null };
}

export async function GET() {
  const noCache = { "Cache-Control": "no-store, no-cache, must-revalidate" };
  try {
    const session = await getServerSession(authOptions);
    const auth = basicAuth();
    if (!auth) return NextResponse.json({ ok: false, message: "API 設定錯誤" }, { status: 500, headers: noCache });

    const perPage = 50;
    let page = 1;
    const allCustomers: any[] = [];

    while (true) {
      const url = `${BASE}/wp-json/wc/v3/customers?per_page=${perPage}&page=${page}`;
      const res = await fetch(url, { headers: { Authorization: auth }, cache: "no-store" });
      const batch = await res.json();
      if (!Array.isArray(batch) || batch.length === 0) break;
      allCustomers.push(...batch);
      if (batch.length < perPage) break;
      page++;
    }

    const referredCountMap: Record<number, number> = {};
    const rewardedCountMap: Record<number, number> = {};

    allCustomers.forEach(c => {
      const meta = c.meta_data || [];
      const referredBy = Number(getMetaValue(meta, "uf_referred_by") || 0);
      if (referredBy) referredCountMap[referredBy] = (referredCountMap[referredBy] || 0) + 1;
      const rewardedOrders = parseRewardedList(getMetaValue(meta, "uf_ref_rewarded_orders"));
      if (rewardedOrders.length > 0) rewardedCountMap[c.id] = rewardedOrders.length;
    });

    const customers = [];
    for (const c of allCustomers) {
      let totalSpent = parseFloat(c.total_spent) || 0;
      let ordersCount = Number(c.orders_count) || 0;
      let lastOrderDate = c.date_last_order || null;

      if (totalSpent === 0 && ordersCount === 0) {
        const summary = await fetchOrdersSummaryForCustomer(c.id, auth);
        totalSpent = summary.totalSpent;
        ordersCount = summary.ordersCount;
        lastOrderDate = summary.lastOrderDate;
      }

      customers.push({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`.trim() || c.username,
        email: c.email,
        totalSpent,
        tier: calcTier(totalSpent),
        referredCount: referredCountMap[c.id] || 0,
        rewardedCount: rewardedCountMap[c.id] || 0,
        referralEarned: (rewardedCountMap[c.id] || 0) * 200,
      });
    }

    return NextResponse.json({ ok: true, customers }, { headers: noCache });
  } catch (e) {
    return NextResponse.json({ ok: false, message: "系統錯誤" }, { status: 500, headers: noCache });
  }
}