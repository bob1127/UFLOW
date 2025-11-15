// app/admin/members/page.tsx
"use client";

import { useEffect, useState, useMemo, Fragment } from "react";

type AdminCustomer = {
  id: number;
  name: string;
  email: string;
  username?: string;
  createdAt?: string;
  lastOrderDate?: string;
  totalSpent: number;
  ordersCount: number;
  tier: string;
  billingCity?: string;
  billingCountry?: string;
};

type AdminOrder = {
  id: number;
  number: string;
  status: string;
  total: number;
  currency: string;
  date_created: string;
  line_items: { name: string; quantity: number }[];
};

export default function AdminMembersPage() {
  const [data, setData] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  // 展開中的會員 + 他的訂單資料
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/customers", {
          cache: "no-store",
        });
        const js = await res.json();
        if (!res.ok || !js.ok) {
          throw new Error(js.message || "讀取失敗");
        }
        setData(js.customers || []);
      } catch (e: any) {
        setError(e.message || "讀取失敗");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return data;
    return data.filter((c) => {
      return (
        c.name.toLowerCase().includes(keyword) ||
        c.email.toLowerCase().includes(keyword) ||
        (c.username || "").toLowerCase().includes(keyword)
      );
    });
  }, [q, data]);

  const totalMembers = data.length;
  const totalRevenue = data.reduce((s, c) => s + c.totalSpent, 0);

  // 點擊會員列時切換展開／收合，同時去撈訂單
  const toggleExpand = async (customerId: number) => {
    if (expandedId === customerId) {
      // 再點一次就收合
      setExpandedId(null);
      return;
    }

    setExpandedId(customerId);
    setOrders([]);
    setOrdersError("");
    setOrdersLoading(true);

    try {
      const res = await fetch(
        `/api/admin/customer-orders?customerId=${customerId}`,
        { cache: "no-store" }
      );
      const js = await res.json();
      if (!res.ok || !js.ok) {
        throw new Error(js.message || "讀取訂單失敗");
      }
      setOrders(js.orders || []);
    } catch (e: any) {
      setOrders([]);
      setOrdersError(e.message || "讀取訂單失敗");
    } finally {
      setOrdersLoading(false);
    }
  };

  const renderOrders = () => {
    if (ordersLoading) {
      return <p className="text-xs text-slate-500 py-2">載入訂單中…</p>;
    }
    if (ordersError) {
      return <p className="text-xs text-rose-600 py-2">{ordersError}</p>;
    }
    if (orders.length === 0) {
      return <p className="text-xs text-slate-500 py-2">目前尚無任何訂單。</p>;
    }

    return (
      <div className="mt-1 rounded-lg border bg-slate-50">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-100 text-slate-500">
            <tr>
              <th className="px-3 py-1 text-left">訂單編號</th>
              <th className="px-3 py-1 text-left">日期</th>
              <th className="px-3 py-1 text-left">狀態</th>
              <th className="px-3 py-1 text-right">金額</th>
              <th className="px-3 py-1 text-left">品項</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t last:border-b">
                <td className="px-3 py-1 align-top">#{o.number}</td>
                <td className="px-3 py-1 align-top">
                  {new Date(o.date_created).toLocaleString("zh-TW")}
                </td>
                <td className="px-3 py-1 align-top">{o.status}</td>
                <td className="px-3 py-1 align-top text-right">
                  NT$ {Math.round(o.total).toLocaleString("zh-TW")}
                </td>
                <td className="px-3 py-1 align-top">
                  {o.line_items.slice(0, 3).map((it, idx) => (
                    <span key={idx} className="mr-2">
                      {it.name} × {it.quantity}
                    </span>
                  ))}
                  {o.line_items.length > 3 && <span>…</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 py-20 mt-20 px-4">
      <div className="mx-auto max-w-6xl">
        {/* 頂部標題 + 統計 */}
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              會員總覽（前端後台）
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              這頁資料來自 WooCommerce REST API，你可以依照會員分級規則客製 UI。
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="rounded-xl bg-white px-4 py-2 shadow-sm border">
              <div className="text-xs text-slate-500">會員數</div>
              <div className="text-lg font-semibold">{totalMembers}</div>
            </div>
            <div className="rounded-xl bg-white px-4 py-2 shadow-sm border">
              <div className="text-xs text-slate-500">累計消費總額</div>
              <div className="text-lg font-semibold">
                NT$
                {Math.round(totalRevenue).toLocaleString("zh-TW")}
              </div>
            </div>
          </div>
        </header>

        {/* 搜尋列 */}
        <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="relative w-full max-w-sm">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜尋姓名 / Email / 使用者名稱…"
              className="w-full rounded-lg border bg-white px-3 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
          </div>
          <div className="text-xs text-slate-500">
            顯示 {filtered.length} / {data.length} 筆
          </div>
        </div>

        {/* 內容區 */}
        {loading && (
          <div className="mt-10 flex justify-center text-slate-500">
            載入中…
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left">會員</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">城市</th>
                  <th className="px-4 py-2 text-right">訂單數</th>
                  <th className="px-4 py-2 text-right">累計消費</th>
                  <th className="px-4 py-2 text-center">會員等級</th>
                  <th className="px-4 py-2 text-left">最近訂購</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <Fragment key={c.id}>
                    {/* 主列：點一下展開 */}
                    <tr
                      className="border-t last:border-b hover:bg-slate-50/80 cursor-pointer"
                      onClick={() => toggleExpand(c.id)}
                    >
                      <td className="px-4 py-2 align-middle">
                        <div className="font-medium text-slate-800">
                          {c.name || "—"}
                        </div>
                        {c.username && (
                          <div className="text-xs text-slate-500">
                            @{c.username}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 align-middle text-slate-700">
                        {c.email}
                      </td>
                      <td className="px-4 py-2 align-middle text-slate-700">
                        {c.billingCountry || ""} {c.billingCity || ""}
                      </td>
                      <td className="px-4 py-2 align-middle text-right">
                        {c.ordersCount}
                      </td>
                      <td className="px-4 py-2 align-middle text-right">
                        NT$
                        {Math.round(c.totalSpent).toLocaleString("zh-TW")}
                      </td>
                      <td className="px-4 py-2 align-middle text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            c.tier.includes("VVIP")
                              ? "bg-purple-100 text-purple-700"
                              : c.tier.includes("UVIP")
                              ? "bg-indigo-100 text-indigo-700"
                              : c.tier.includes("金")
                              ? "bg-amber-100 text-amber-700"
                              : c.tier.includes("銀")
                              ? "bg-slate-100 text-slate-700"
                              : c.tier.includes("銅")
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-50 text-slate-400"
                          }`}
                        >
                          {c.tier}
                        </span>
                      </td>
                      <td className="px-4 py-2 align-middle text-xs text-slate-500">
                        {c.lastOrderDate
                          ? new Date(c.lastOrderDate).toLocaleDateString(
                              "zh-TW"
                            )
                          : "—"}
                      </td>
                    </tr>

                    {/* 展開列：只有選中的那一個顯示 */}
                    {expandedId === c.id && (
                      <tr className="bg-slate-50/40">
                        <td colSpan={7} className="px-4 pb-3 pt-0">
                          <div className="pt-2 text-xs text-slate-500 mb-1">
                            會員訂單明細
                          </div>
                          {renderOrders()}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-slate-500"
                    >
                      找不到符合條件的會員。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
