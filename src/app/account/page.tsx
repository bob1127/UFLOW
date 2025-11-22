// app/account/page.tsx
"use client";
import { Link } from "next-view-transitions";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type MembershipInfo = {
  tierName: string;
  totalSpent12m: number;
  discountLabel?: string;
  upgradeGift: number;
  birthdayCredit: number;
  nextTierName?: string | null;
  nextNeedAmount?: number | null;
};

type OrderItem = {
  name: string;
  quantity: number;
};

type Order = {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  currency: string;
  line_items: OrderItem[];
};

type ClaimKind = "upgrade" | "birthday";

type ReferralInfo = {
  refCode: string;
  referralLink: string;
  friendReward: number;
  ambassadorReward: number;
};

type AvailableCoupon = {
  kind?: string;
  code: string;
  amount: number;
  coupon?: any;
};

function isReferralCouponCode(code?: string) {
  if (!code) return false;
  return code.toUpperCase().startsWith("UFAMB-");
}

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [membership, setMembership] = useState<MembershipInfo | null>(null);
  const [error, setError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);

  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>(
    []
  );
  const [availableLoading, setAvailableLoading] = useState(false);

  const [claimLoading, setClaimLoading] = useState<{
    upgrade: boolean;
    birthday: boolean;
  }>({ upgrade: false, birthday: false });

  const [claimed, setClaimed] = useState<{
    upgrade: boolean;
    birthday: boolean;
  }>({ upgrade: false, birthday: false });

  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [claimStatus, setClaimStatus] = useState<"success" | "error" | null>(
    null
  );
  const [claimedCode, setClaimedCode] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/profile", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      if (data?.loggedIn) {
        setLoggedIn(true);
        setCustomer(data.customer || {});
        setMembership(data.membership || null);
      } else {
        setLoggedIn(false);
        setCustomer(null);
        setMembership(null);
      }
    } catch {
      setError("讀取會員資料失敗，請稍後再試。");
      setLoggedIn(false);
      setCustomer(null);
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/account/orders", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadReferral = useCallback(async () => {
    setReferralLoading(true);
    try {
      const res = await fetch("/api/account/referral", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data?.ok) setReferral(data);
      else setReferral(null);
    } catch {
      setReferral(null);
    } finally {
      setReferralLoading(false);
    }
  }, []);

  const loadAvailableCoupons = useCallback(async () => {
    setAvailableLoading(true);
    try {
      const res = await fetch("/api/account/coupons/available", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data?.ok && Array.isArray(data.available)) {
        setAvailableCoupons(data.available);
      } else {
        setAvailableCoupons([]);
      }
    } catch {
      setAvailableCoupons([]);
    } finally {
      setAvailableLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (loggedIn) {
      loadOrders();
      loadReferral();
      loadAvailableCoupons();
    }
  }, [loggedIn, loadOrders, loadReferral, loadAvailableCoupons]);

  const handleClaim = async (kind: ClaimKind) => {
    setClaimMessage(null);
    setClaimStatus(null);
    setClaimedCode(null);

    setClaimLoading((prev) => ({ ...prev, [kind]: true }));
    try {
      const res = await fetch("/api/account/coupons/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ kind }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setClaimStatus("error");
        setClaimMessage(
          data?.message || data?.detail || "領取失敗，請稍後再試。"
        );
        return;
      }

      setClaimStatus("success");
      setClaimMessage(data.message || "領取成功！");
      if (data.coupon?.code) setClaimedCode(data.coupon.code);

      setClaimed((prev) => ({ ...prev, [kind]: true }));
      loadAvailableCoupons();
    } catch {
      setClaimStatus("error");
      setClaimMessage("系統錯誤，請稍後再試。");
    } finally {
      setClaimLoading((prev) => ({ ...prev, [kind]: false }));
    }
  };

  // ✅ 這裡改成「不使用 hook」的推薦券整理
  const referralCoupons = availableCoupons.filter(
    (c) => c.kind === "referral" || isReferralCouponCode(c.code)
  );
  const referralTotal = referralCoupons.reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0
  );

  // ====== UI ======
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-slate-500">載入中…</div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">尚未登入</h1>
          <p className="mt-2 text-sm text-slate-600">
            請先登入以檢視會員資料。
          </p>
          <button
            onClick={() =>
              router.push(`/login?next=${encodeURIComponent("/account")}`)
            }
            className="mt-4 w-full rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
          >
            前往登入
          </button>
          {error && (
            <p className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md p-2">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  const displayName =
    (customer?.first_name || "") +
      (customer?.last_name ? ` ${customer?.last_name}` : "") ||
    customer?.username ||
    (customer?.email ? customer.email.split("@")[0] : "會員");

  return (
    <div className="min-h-[60vh] py-10 px-4">
      <div className="mx-auto w-full max-w-2xl rounded-xl mt-[100px] border bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">我的帳戶</h1>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.replace("/login?next=/account");
            }}
            className="rounded-md border px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50"
          >
            登出
          </button>
        </div>

        {/* 基本資料 */}
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 text-sm text-slate-500">姓名</div>
            <div className="col-span-2">{displayName}</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 text-sm text-slate-500">電子信箱</div>
            <div className="col-span-2">{customer?.email || "-"}</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 text-sm text-slate-500">使用者名稱</div>
            <div className="col-span-2">{customer?.username || "-"}</div>
          </div>
        </div>

        {/* ✅ 金牌大使推薦區塊 */}
        <div className="mt-8">
          {referralLoading && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
              讀取推薦資訊中…
            </div>
          )}

          {!referralLoading && referral && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
              <div className="flex items-center">
                <p className="text-md font-semibold tracking-widest text-amber-700">
                  金牌大使推薦
                </p>
                <Link href="/cooperate" className="font-bold text-[14px] ml-4">
                  {" "}
                  關於合作資訊{" "}
                </Link>
              </div>

              <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                1. 分享你的專屬推薦連結給親友。
                <br />
                2. 親友用連結註冊立刻獲得{" "}
                <span className="font-semibold text-amber-700">
                  NT$ {referral.friendReward}
                </span>{" "}
                購物金。
                <br />
                3. 親友完成首單後，你可獲得{" "}
                <span className="font-semibold text-amber-700">
                  NT$ {referral.ambassadorReward}
                </span>{" "}
                抵用金折抵下次訂單。
              </div>

              <div className="mt-3">
                <div className="text-xs text-slate-500 mb-1">
                  你的專屬推薦連結
                </div>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={referral.referralLink}
                    className="w-full rounded-md border bg-white px-3 py-2 text-xs"
                  />
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(referral.referralLink)
                    }
                    className="rounded-md bg-slate-900 px-3 py-2 text-xs text-white hover:bg-slate-800"
                  >
                    複製
                  </button>
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  推薦碼：
                  <span className="font-semibold text-slate-900">
                    {" "}
                    {referral.refCode}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 會員等級區塊 */}
        {membership && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              MEMBERSHIP
            </p>

            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-sm text-slate-500">目前等級</p>
                <p className="text-lg font-semibold text-slate-900">
                  {membership.tierName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">近 12 個月累積消費</p>
                <p className="text-base font-semibold text-slate-900">
                  NT$ {membership.totalSpent12m.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 text-xs text-slate-600 md:grid-cols-3">
              {/* 消費優惠 */}
              <div className="rounded-lg bg-white px-3 py-2">
                <p className="text-[11px] font-semibold text-slate-500">
                  消費優惠
                </p>
                <p className="mt-1 text-sm">
                  {membership.discountLabel || "依活動公告"}
                </p>
              </div>

              {/* 升等禮 */}
              <div className="rounded-lg bg-white px-3 py-2">
                <p className="text-[11px] font-semibold text-slate-500">
                  升等禮
                </p>
                <p className="mt-1 text-sm">
                  購物金 {membership.upgradeGift} 元
                </p>
                {membership.upgradeGift > 0 && (
                  <button
                    onClick={() => handleClaim("upgrade")}
                    disabled={claimLoading.upgrade || claimed.upgrade}
                    className="mt-2 rounded-md border px-3 py-1 text-[11px] hover:bg-slate-50 disabled:opacity-60"
                  >
                    {claimed.upgrade
                      ? "已領取"
                      : claimLoading.upgrade
                      ? "領取中…"
                      : "領取升等禮券"}
                  </button>
                )}
              </div>

              {/* 壽星好禮 */}
              <div className="rounded-lg bg-white px-3 py-2">
                <p className="text-[11px] font-semibold text-slate-500">
                  壽星好禮
                </p>
                <p className="mt-1 text-sm">
                  生日購物金 {membership.birthdayCredit} 元
                </p>
                {membership.birthdayCredit > 0 && (
                  <button
                    onClick={() => handleClaim("birthday")}
                    disabled={claimLoading.birthday || claimed.birthday}
                    className="mt-2 rounded-md border px-3 py-1 text-[11px] hover:bg-slate-50 disabled:opacity-60"
                  >
                    {claimed.birthday
                      ? "已領取"
                      : claimLoading.birthday
                      ? "領取中…"
                      : "領取生日禮券"}
                  </button>
                )}
              </div>

              {/* ✅ 推薦獎金 */}
              <div className="rounded-lg bg-white px-3 py-2">
                <p className="text-[11px] font-semibold text-slate-500">
                  推薦獎金
                </p>

                {availableLoading ? (
                  <p className="mt-1 text-sm text-slate-400">讀取中…</p>
                ) : referralCoupons.length === 0 ? (
                  <p className="mt-1 text-sm">目前尚無推薦獎金</p>
                ) : (
                  <>
                    <p className="mt-1 text-sm">
                      可用購物金{" "}
                      <span className="font-semibold text-slate-900">
                        {referralTotal}
                      </span>{" "}
                      元
                    </p>

                    <div className="mt-1 text-[11px] text-slate-500 space-y-1">
                      {referralCoupons.slice(0, 3).map((c) => (
                        <div key={c.code}>
                          折扣碼：{" "}
                          <span className="font-semibold text-slate-700">
                            {c.code}
                          </span>
                          （{c.amount} 元）
                        </div>
                      ))}
                      {referralCoupons.length > 3 && <div>…</div>}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 領券結果提示 */}
            {claimMessage && (
              <div
                className={`mt-3 rounded-md border px-3 py-2 text-xs ${
                  claimStatus === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                <p>{claimMessage}</p>
                {claimedCode && (
                  <p className="mt-1">
                    折扣碼：
                    <span className="font-semibold">{claimedCode}</span>
                  </p>
                )}
              </div>
            )}

            {membership.nextTierName && membership.nextNeedAmount != null && (
              <p className="mt-3 text-xs text-slate-500">
                再累積消費{" "}
                <span className="font-semibold text-slate-900">
                  NT$ {membership.nextNeedAmount.toLocaleString()}
                </span>{" "}
                即可升等為{" "}
                <span className="font-semibold text-slate-900">
                  {membership.nextTierName}
                </span>
                。
              </p>
            )}
          </div>
        )}

        {/* 訂單列表 */}
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">我的訂單</h2>
            <button
              onClick={loadOrders}
              className="rounded-md border px-3 py-1.5 text-xs hover:bg-slate-50"
            >
              重新整理訂單
            </button>
          </div>

          {ordersLoading ? (
            <p className="mt-4 text-sm text-slate-500">載入訂單中…</p>
          ) : orders.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              目前尚未有任何訂單紀錄。
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">
                        訂單編號 #{o.number}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {new Date(o.date_created).toLocaleString("zh-TW")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">訂單金額</p>
                      <p className="text-sm font-semibold text-slate-900">
                        NT$ {Number(o.total).toLocaleString()}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        狀態：{o.status}
                      </p>
                    </div>
                  </div>
                  {o.line_items?.length > 0 && (
                    <div className="mt-2 text-xs text-slate-600">
                      {o.line_items.slice(0, 3).map((it, idx) => (
                        <span key={idx} className="mr-2">
                          {it.name} × {it.quantity}
                        </span>
                      ))}
                      {o.line_items.length > 3 && <span>…</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 重新整理 */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={loadProfile}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            重新整理會員資料
          </button>
          <button
            onClick={loadAvailableCoupons}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            重新整理可用購物金
          </button>
        </div>
      </div>
    </div>
  );
}
