// app/account/page.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
} from "react";
import { Link } from "next-view-transitions";
import { useRouter } from "next/navigation";
import { LineChart, BarChart } from "@mui/x-charts";

/* ===================== Types (Account) ===================== */
type Customer = {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  birthday?: string; // 生日欄位

  // 可選：如果你 profile API 有回傳角色/權限
  roles?: string[]; 
  role?: string; 
  isAdmin?: boolean;
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

type OrderItem = { name: string; quantity: number };
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
  description?: string;
  expires?: string | null;
  coupon?: any;
};

type TabKey = "profile" | "orders" | "admin";

/* ===================== Types (Admin Analytics) ===================== */
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

  referredCount: number;
  rewardedCount: number;
  referralEarned: number;
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

/* ===================== Utils ===================== */
function cn(...arr: Array<string | false | undefined | null>) {
  return arr.filter(Boolean).join(" ");
}

function formatMoneyNT(n: number) {
  return `NT$ ${Number(n || 0).toLocaleString("zh-TW")}`;
}

const formatNTD = (val: number) =>
  "NT$" + Math.round(val || 0).toLocaleString("zh-TW");

function codeUpper(code?: string) {
  return String(code || "")
    .trim()
    .toUpperCase();
}
function isAmbassadorCoupon(code?: string, kind?: string) {
  const c = codeUpper(code);
  const k = String(kind || "");
  return k === "ref_ambassador_200" || c.startsWith("UFAMB-");
}
function isFriendCoupon(code?: string, kind?: string) {
  const c = codeUpper(code);
  const k = String(kind || "");
  return k === "ref_friend_50" || c.startsWith("UFFRD-");
}
function pickCouponCreatedAt(c: AvailableCoupon) {
  const raw =
    c?.coupon?.date_created ||
    c?.coupon?.date_created_gmt ||
    c?.coupon?.date_modified ||
    c?.coupon?.date_modified_gmt ||
    "";
  const t = raw ? new Date(raw).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
}

/* ===================== UI Atoms ===================== */
function StatusPill({ status }: { status: string }) {
  const s = String(status || "").toLowerCase();
  const tone =
    s === "completed"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : s === "processing"
      ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
      : "bg-slate-50 text-slate-600 ring-1 ring-slate-200";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-[11px] font-semibold",
        tone
      )}
    >
      {status}
    </span>
  );
}

function ShellCard({
  title,
  right,
  children,
  className,
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      {(title || right) && (
        <header className="flex items-center justify-between gap-3 px-5 pt-5">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div>{right}</div>
        </header>
      )}
      <div className={cn("px-5", title || right ? "pb-5 pt-4" : "py-5")}>
        {children}
      </div>
    </section>
  );
}

function MiniField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function SidebarItem({
  active,
  label,
  onClick,
}: {
  active?: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-[#F58A9C] text-slate-900"
          : "text-slate-600 hover:bg-slate-100"
      )}
    >
      {label}
    </button>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-slate-900 text-white"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
      )}
    >
      {label}
    </button>
  );
}

/* ===================== Admin Analytics Components ===================== */
function MemberAnalytics({
  orders,
  customer,
}: {
  orders: AdminOrder[];
  customer: AdminCustomer;
}) {
  if (!orders || orders.length === 0) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-500">
        尚無足夠訂單資料可供分析。
      </div>
    );
  }

  const totalAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const orderCount = orders.length;
  const avgAmount = orderCount > 0 ? totalAmount / orderCount : 0;

  const monthLabels: string[] = [];
  const monthTotalsMap: Record<string, number> = {};

  orders.forEach((o) => {
    const d = new Date(o.date_created);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    if (!monthLabels.includes(key)) monthLabels.push(key);
    monthTotalsMap[key] = (monthTotalsMap[key] || 0) + (o.total || 0);
  });

  monthLabels.sort();
  const monthTotals = monthLabels.map((m) => monthTotalsMap[m] || 0);

  const productMap: Record<string, number> = {};
  orders.forEach((o) =>
    o.line_items.forEach((it) => {
      productMap[it.name] = (productMap[it.name] || 0) + (it.quantity || 0);
    })
  );

  const productEntries = Object.entries(productMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const productLabels = productEntries.map(([name]) => name);
  const productQty = productEntries.map(([, q]) => q);

  return (
    <div className="mt-4 space-y-3">
      {/* 指標卡片 */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border bg-white px-3 py-2">
          <div className="text-[11px] text-slate-500">訂單數</div>
          <div className="mt-1 text-lg font-semibold text-slate-800">
            {orderCount}
          </div>
        </div>
        <div className="rounded-lg border bg-white px-3 py-2">
          <div className="text-[11px] text-slate-500">累計消費</div>
          <div className="mt-1 text-lg font-semibold text-slate-800">
            {formatNTD(totalAmount)}
          </div>
        </div>
        <div className="rounded-lg border bg-white px-3 py-2">
          <div className="text-[11px] text-slate-500">平均客單價</div>
          <div className="mt-1 text-lg font-semibold text-slate-800">
            {orderCount === 0 ? "—" : formatNTD(avgAmount)}
          </div>
        </div>

        <div className="rounded-lg border bg-white px-3 py-2">
          <div className="text-[11px] text-slate-500">推薦註冊人數</div>
          <div className="mt-1 text-lg font-semibold text-amber-700">
            {customer.referredCount || 0}
          </div>
        </div>
        <div className="rounded-lg border bg-white px-3 py-2">
          <div className="text-[11px] text-slate-500">成功首單推薦</div>
          <div className="mt-1 text-lg font-semibold text-amber-700">
            {customer.rewardedCount || 0}
          </div>
        </div>
        <div className="rounded-lg border bg-white px-3 py-2">
          <div className="text-[11px] text-slate-500">已賺推薦金</div>
          <div className="mt-1 text-lg font-semibold text-amber-700">
            {formatNTD(customer.referralEarned || 0)}
          </div>
        </div>
      </div>

      {/* 圖表：左右兩塊 */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border bg-white px-3 py-2">
          <div className="mb-1 text-[11px] font-semibold text-slate-600">
            每月消費金額趨勢
          </div>
          {monthLabels.length === 0 ? (
            <p className="text-xs text-slate-400">尚無可用的時間序列資料。</p>
          ) : (
            <div className="h-52">
              <LineChart
                xAxis={[
                  { scaleType: "point", data: monthLabels, label: "月份" },
                ]}
                series={[
                  {
                    data: monthTotals,
                    label: "消費金額",
                    valueFormatter: (v) => formatNTD(Number(v)),
                  },
                ]}
                margin={{ left: 40, right: 10, top: 20, bottom: 30 }}
              />
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-white px-3 py-2">
          <div className="mb-1 text-[11px] font-semibold text-slate-600">
            最常購買商品 TOP 5
          </div>
          {productLabels.length === 0 ? (
            <p className="text-xs text-slate-400">尚無商品統計資料。</p>
          ) : (
            <div className="h-52">
              <BarChart
                layout="horizontal"
                xAxis={[{ label: "購買次數 / 數量" }]}
                yAxis={[{ scaleType: "band", data: productLabels }]}
                series={[{ data: productQty, label: "數量" }]}
                margin={{ left: 80, right: 10, top: 20, bottom: 30 }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===================== Page ===================== */
export default function AccountPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  // account data
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

  const [claimLoading, setClaimLoading] = useState({
    upgrade: false,
    birthday: false,
  });
  const [claimed, setClaimed] = useState({
    upgrade: false,
    birthday: false,
  });

  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [claimStatus, setClaimStatus] = useState<"success" | "error" | null>(
    null
  );
  const [claimedCode, setClaimedCode] = useState<string | null>(null);

  const [showAllReferralCoupons, setShowAllReferralCoupons] = useState(false);

  // admin visibility
  const [isAdmin, setIsAdmin] = useState(false);

  /* ===== Admin analytics state ===== */
  const [adminData, setAdminData] = useState<AdminCustomer[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminQ, setAdminQ] = useState("");

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<AdminOrder[]>([]);
  const [expandedOrdersLoading, setExpandedOrdersLoading] = useState(false);
  const [expandedOrdersError, setExpandedOrdersError] = useState("");

  const adminLoadedOnceRef = useRef(false);

  // 生日相關 State
  const [birthdayInput, setBirthdayInput] = useState("");
  const [isSettingBirthday, setIsSettingBirthday] = useState(false);
  const [birthdayLoading, setBirthdayLoading] = useState(false);

  /* ===================== Loaders (Account) ===================== */
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

        const roles: string[] = Array.isArray(data?.customer?.roles)
          ? data.customer.roles
          : [];
        const role: string = String(data?.customer?.role || "");
        const adminFlag =
          Boolean(data?.customer?.isAdmin) ||
          Boolean(data?.isAdmin) ||
          roles.includes("administrator") ||
          roles.includes("admin") ||
          role === "administrator" ||
          role === "admin";

        setIsAdmin(adminFlag);
      } else {
        setLoggedIn(false);
        setCustomer(null);
        setMembership(null);
        setIsAdmin(false);
      }
    } catch {
      setError("讀取會員資料失敗，請稍後再試。");
      setLoggedIn(false);
      setCustomer(null);
      setMembership(null);
      setIsAdmin(false);
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

  // 提交生日
  const handleUpdateBirthday = async () => {
    if (!birthdayInput) return alert("請選擇生日");
    
    if (!confirm(`您的生日是 ${birthdayInput} 嗎？\n確認後將無法再次修改。`)) {
      return;
    }

    setBirthdayLoading(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthday: birthdayInput }),
      });
      
      const data = await res.json();
      if (data.ok) {
        alert("生日設定成功！");
        setCustomer((prev) => prev ? { ...prev, birthday: birthdayInput } : null);
        setIsSettingBirthday(false);
        loadProfile(); 
      } else {
        alert(data.message || "更新失敗");
      }
    } catch (e) {
      alert("系統錯誤，請稍後再試");
    } finally {
      setBirthdayLoading(false);
    }
  };

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

  /* ===================== Derived (Account) ===================== */
  const sortedCoupons = useMemo(() => {
    return [...availableCoupons].sort(
      (a, b) => pickCouponCreatedAt(b) - pickCouponCreatedAt(a)
    );
  }, [availableCoupons]);

  const referralCoupons = useMemo(() => {
    return sortedCoupons.filter(
      (c) =>
        isFriendCoupon(c.code, c.kind) || isAmbassadorCoupon(c.code, c.kind)
    );
  }, [sortedCoupons]);

  const ambassadorCoupons = useMemo(
    () => referralCoupons.filter((c) => isAmbassadorCoupon(c.code, c.kind)),
    [referralCoupons]
  );

  const friendCoupons = useMemo(
    () => referralCoupons.filter((c) => isFriendCoupon(c.code, c.kind)),
    [referralCoupons]
  );

  const ambassadorTotal = useMemo(
    () =>
      ambassadorCoupons.reduce((sum, c) => sum + (Number(c.amount) || 0), 0),
    [ambassadorCoupons]
  );

  const friendTotal = useMemo(
    () => friendCoupons.reduce((sum, c) => sum + (Number(c.amount) || 0), 0),
    [friendCoupons]
  );

  const referralTotal = ambassadorTotal + friendTotal;

  const displayName =
    (
      (customer?.first_name || "") +
      (customer?.last_name ? ` ${customer?.last_name}` : "")
    ).trim() ||
    customer?.username ||
    (customer?.email ? customer.email.split("@")[0] : "會員");

  const previewLimit = 6;
  const referralToShow = showAllReferralCoupons
    ? referralCoupons
    : referralCoupons.slice(0, previewLimit);
  
  // ✅ 新增：取得生日月份標籤
  const getBirthMonthLabel = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return `${d.getMonth() + 1}月`;
  };

  // ✅ 新增：檢查是否為當月壽星
  const isCurrentMonthBirthday = useMemo(() => {
    if (!customer?.birthday) return false;
    const d = new Date(customer.birthday);
    const now = new Date();
    // 簡單比較月份 (0-11)
    return d.getMonth() === now.getMonth();
  }, [customer?.birthday]);

  /* ===================== Admin Loaders ===================== */
  const loadAdminCustomers = useCallback(async () => {
    setAdminLoading(true);
    setAdminError("");
    try {
      const res = await fetch("/api/admin/customers", { cache: "no-store" });
      const js = await res.json();

      if (res.status === 401 || res.status === 403) {
        setIsAdmin(false);
        setAdminData([]);
        setAdminError("權限不足（僅管理員可查看）。");
        return;
      }

      if (!res.ok || !js.ok) throw new Error(js.message || "讀取失敗");
      setAdminData(js.customers || []);
      adminLoadedOnceRef.current = true;
    } catch (e: any) {
      setAdminError(e?.message || "讀取失敗");
    } finally {
      setAdminLoading(false);
    }
  }, []);

  const toggleExpand = async (customerId: number, email?: string) => {
    if (expandedId === customerId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(customerId);
    setOrders([]);
    setExpandedOrdersError("");

    setOrdersLoading(true);

    try {
      const qs = new URLSearchParams({
        customerId: String(customerId),
      });

      if (email) qs.set("email", email);

      const res = await fetch(`/api/admin/customer-orders?${qs.toString()}`, {
        cache: "no-store",
      });

      const js = await res.json();
      if (!res.ok || !js.ok) throw new Error(js.message || "讀取訂單失敗");
      setOrders(js.orders || []);
    } catch (e: any) {
      setOrders([]);
      setExpandedOrdersError(e?.message || "讀取訂單失敗");
    } finally {
      setOrdersLoading(false);
    }
  };

  // admin tab 第一次被打開時才載入
  useEffect(() => {
    if (!loggedIn) return;
    if (!isAdmin) return;
    if (activeTab !== "admin") return;
    if (adminLoadedOnceRef.current) return;

    loadAdminCustomers();
  }, [activeTab, isAdmin, loggedIn, loadAdminCustomers]);
  const toggleExpandAdminRow = async (customerId: number, email?: string) => {
    if (expandedId === customerId) {
      setExpandedId(null);
      setExpandedOrders([]);
      setExpandedOrdersError("");
      return;
    }

    setExpandedId(customerId);
    setExpandedOrders([]);
    setExpandedOrdersError("");
    setExpandedOrdersLoading(true);

    try {
      const qs = new URLSearchParams({ customerId: String(customerId) });
      if (email) qs.set("email", email);

      const res = await fetch(`/api/admin/customer-orders?${qs.toString()}`, {
        cache: "no-store",
      });
      const js = await res.json();

      if (res.status === 401 || res.status === 403) {
        setIsAdmin(false);
        throw new Error("權限不足（僅管理員可查看）。");
      }

      if (!res.ok || !js.ok) throw new Error(js.message || "讀取訂單失敗");

      setExpandedOrders(js.orders || []);
    } catch (e: any) {
      setExpandedOrders([]);
      setExpandedOrdersError(e?.message || "讀取訂單失敗");
    } finally {
      setExpandedOrdersLoading(false);
    }
  };

  const adminFiltered = useMemo(() => {
    const keyword = adminQ.trim().toLowerCase();
    if (!keyword) return adminData;
    return adminData.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        c.email.toLowerCase().includes(keyword) ||
        (c.username || "").toLowerCase().includes(keyword)
    );
  }, [adminQ, adminData]);

  const totalMembers = adminData.length;
  const totalRevenue = adminData.reduce((s, c) => s + c.totalSpent, 0);
  const totalReferred = adminData.reduce(
    (s, c) => s + (c.referredCount || 0),
    0
  );
  const totalReferralEarned = adminData.reduce(
    (s, c) => s + (c.referralEarned || 0),
    0
  );

  const renderExpandedOrders = () => {
    if (expandedOrdersLoading) {
      return <p className="text-xs text-slate-500 py-2">載入訂單中…</p>;
    }
    if (expandedOrdersError) {
      return (
        <p className="text-xs text-rose-600 py-2">{expandedOrdersError}</p>
      );
    }
    if (expandedOrders.length === 0) {
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
            {expandedOrders.map((o) => (
              <tr key={o.id} className="border-t last:border-b">
                <td className="px-3 py-1 align-top">#{o.number}</td>
                <td className="px-3 py-1 align-top">
                  {new Date(o.date_created).toLocaleString("zh-TW")}
                </td>
                <td className="px-3 py-1 align-top">{o.status}</td>
                <td className="px-3 py-1 align-top text-right">
                  {formatNTD(o.total)}
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

  /* ===================== UI States ===================== */
  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="animate-pulse rounded-2xl border bg-white p-6 text-slate-500">
            載入中…
          </div>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-[70vh] bg-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">尚未登入</h2>
            <p className="mt-2 text-sm text-slate-600">
              請先登入以檢視會員資料。
            </p>
            <button
              onClick={() =>
                router.push(`/login?next=${encodeURIComponent("/account")}`)
              }
              className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              前往登入
            </button>
            {error && (
              <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ===================== Main Layout ===================== */
  return (
    <div className="min-h-[80vh] bg-slate-100 py-[100px] flex justify-center items-center">
      <div className="  w-[92%] mx-auto max-w-[1920px]  ">
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-2xl bg-slate-900" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Maglo.
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Member Console
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-1">
                <SidebarItem
                  active={activeTab === "profile"}
                  label="Account"
                  onClick={() => setActiveTab("profile")}
                />
                <SidebarItem
                  active={activeTab === "orders"}
                  label="Orders"
                  onClick={() => setActiveTab("orders")}
                />

                {isAdmin && (
                  <SidebarItem
                    active={activeTab === "admin"}
                    label="Admin Analytics"
                    onClick={() => setActiveTab("admin")}
                  />
                )}

                <SidebarItem
                  label="Referral"
                  onClick={() => setActiveTab("profile")}
                />
                <SidebarItem
                  label="Coupons"
                  onClick={() => setActiveTab("profile")}
                />
              </div>
            </div>

            <div className="border-t p-4">
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.replace("/login?next=/account");
                }}
                className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          </aside>

          {/* Main column */}
          <main className="space-y-4">
            {/* Topbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="min-w-0">
                <div className="text-xs text-slate-500">Member Center</div>
                <div className="truncate text-lg font-semibold text-slate-900">
                  {displayName}
                  {isAdmin && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">
                      管理員
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-400">⌕</span>
                  <input
                    className="w-56 bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="Search…"
                  />
                </div>

                <button
                  onClick={() => {
                    loadAvailableCoupons();
                    loadOrders();
                    loadReferral();
                    loadProfile();
                    if (isAdmin && activeTab === "admin") loadAdminCustomers();
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Refresh
                </button>

                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <div className="h-7 w-7 rounded-full bg-slate-200" />
                  <div className="hidden sm:block">
                    <div className="text-xs font-semibold text-slate-900">
                      {displayName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {customer?.email || ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <TabButton
                  active={activeTab === "profile"}
                  label="會員基本資料"
                  onClick={() => setActiveTab("profile")}
                />
                <TabButton
                  active={activeTab === "orders"}
                  label="訂單資訊"
                  onClick={() => setActiveTab("orders")}
                />
                {isAdmin && (
                  <TabButton
                    active={activeTab === "admin"}
                    label="管理員分析"
                    onClick={() => setActiveTab("admin")}
                  />
                )}
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/cooperate"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  合作資訊
                </Link>
              </div>
            </div>

            {/* Content area */}
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              {/* Main tab content */}
              <div className="space-y-4">
                {/* ===== Tab: Profile ===== */}
                {activeTab === "profile" && (
                  <>
                    <ShellCard
                      title="Member Info"
                      right={
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200">
                          ID {customer?.id || "-"}
                        </span>
                      }
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <MiniField label="Name" value={displayName} />
                        <MiniField
                          label="Email"
                          value={customer?.email || "-"}
                        />
                         <MiniField 
                          label="Birthday" 
                          value={customer?.birthday || "未設定"} 
                        />
                        <div className="md:col-span-2">
                          <MiniField
                            label="Username"
                            value={customer?.username || "-"}
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <MiniField
                          label="Tier"
                          value={membership?.tierName || "—"}
                        />
                        <MiniField
                          label="Spend (12m)"
                          value={formatMoneyNT(membership?.totalSpent12m || 0)}
                        />
                        <MiniField
                          label="Referral Total"
                          value={formatMoneyNT(referralTotal)}
                        />
                      </div>

                      {membership?.nextTierName &&
                        membership.nextNeedAmount != null && (
                          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                            再累積消費{" "}
                            <b className="text-slate-900">
                              {formatMoneyNT(membership.nextNeedAmount)}
                            </b>{" "}
                            可升等為{" "}
                            <b className="text-slate-900">
                              {membership.nextTierName}
                            </b>
                          </div>
                        )}
                    </ShellCard>

                    <ShellCard
                      title="Referral Program"
                      right={
                        <span className="text-[12px] text-slate-500">
                          金牌大使推薦
                        </span>
                      }
                    >
                      {referralLoading ? (
                        <div className="text-sm text-slate-500">
                          讀取推薦資訊中…
                        </div>
                      ) : !referral ? (
                        <div className="text-sm text-slate-500">
                          尚無推薦資訊
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-slate-800">
                            親友註冊可得 <b>NT$ {referral.friendReward}</b>{" "}
                            購物金，親友首單完成後你可得{" "}
                            <b>NT$ {referral.ambassadorReward}</b> 抵用金。
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <div className="text-[11px] text-slate-500">
                                Referral Code
                              </div>
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <div className="text-sm font-semibold text-slate-900">
                                  {referral.refCode}
                                </div>
                                <button
                                  onClick={() =>
                                    navigator.clipboard.writeText(
                                      referral.refCode
                                    )
                                  }
                                  className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 md:col-span-2">
                              <div className="text-[11px] text-slate-500">
                                Referral Link
                              </div>
                              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                <input
                                  readOnly
                                  value={referral.referralLink}
                                  className="w-full rounded-xl border bg-slate-50 px-3 py-2 text-xs"
                                />
                                <button
                                  onClick={() =>
                                    navigator.clipboard.writeText(
                                      referral.referralLink
                                    )
                                  }
                                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                                >
                                  Copy Link
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </ShellCard>
                  </>
                )}

                {/* ===== Tab: Orders ===== */}
                {activeTab === "orders" && (
                  <ShellCard
                    title="Orders"
                    right={
                      <button
                        onClick={loadOrders}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                      >
                        重新整理訂單
                      </button>
                    }
                  >
                    {ordersLoading ? (
                      <div className="text-sm text-slate-500">載入訂單中…</div>
                    ) : orders.length === 0 ? (
                      <div className="text-sm text-slate-500">
                        目前尚未有任何訂單紀錄。
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="grid grid-cols-12 gap-2 bg-slate-50 px-4 py-3 text-[11px] font-semibold text-slate-600">
                          <div className="col-span-3">Order</div>
                          <div className="col-span-3">Created</div>
                          <div className="col-span-2">Status</div>
                          <div className="col-span-2 text-right">Total</div>
                          <div className="col-span-2 text-right">Items</div>
                        </div>

                        <div className="divide-y">
                          {orders.map((o) => {
                            const itemsCount = (o.line_items || []).reduce(
                              (sum, it) => sum + (it.quantity || 0),
                              0
                            );
                            return (
                              <div
                                key={o.id}
                                className="grid grid-cols-12 gap-2 px-4 py-3 text-sm"
                              >
                                <div className="col-span-3 font-semibold text-slate-900">
                                  #{o.number}
                                </div>
                                <div className="col-span-3 text-slate-600">
                                  {new Date(o.date_created).toLocaleString(
                                    "zh-TW"
                                  )}
                                </div>
                                <div className="col-span-2">
                                  <StatusPill status={o.status} />
                                </div>
                                <div className="col-span-2 text-right font-semibold text-slate-900">
                                  {formatMoneyNT(Number(o.total))}
                                </div>
                                <div className="col-span-2 text-right text-slate-600">
                                  {itemsCount}
                                </div>

                                {o.line_items?.length > 0 && (
                                  <div className="col-span-12 mt-1 text-[12px] text-slate-500">
                                    {o.line_items.slice(0, 4).map((it, idx) => (
                                      <span key={idx} className="mr-2">
                                        {it.name} × {it.quantity}
                                      </span>
                                    ))}
                                    {o.line_items.length > 4 && <span>…</span>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </ShellCard>
                )}

                {/* ===== Tab: Admin Analytics ===== */}
                {activeTab === "admin" && isAdmin && (
                  <ShellCard
                    title="管理員分析：會員總覽"
                    right={
                      <button
                        onClick={loadAdminCustomers}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                      >
                        重新整理
                      </button>
                    }
                  >
                    <div className="mb-4 grid gap-3 md:grid-cols-4">
                      <div className="rounded-xl bg-white px-4 py-3 shadow-sm border">
                        <div className="text-xs text-slate-500">會員數</div>
                        <div className="text-lg font-semibold">
                          {totalMembers}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white px-4 py-3 shadow-sm border">
                        <div className="text-xs text-slate-500">
                          累計消費總額
                        </div>
                        <div className="text-lg font-semibold">
                          {formatNTD(totalRevenue)}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white px-4 py-3 shadow-sm border">
                        <div className="text-xs text-slate-500">
                          全站推薦註冊數
                        </div>
                        <div className="text-lg font-semibold text-amber-700">
                          {totalReferred}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white px-4 py-3 shadow-sm border">
                        <div className="text-xs text-slate-500">
                          全站推薦金支出
                        </div>
                        <div className="text-lg font-semibold text-amber-700">
                          {formatNTD(totalReferralEarned)}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                      <div className="relative w-full max-w-sm">
                        <input
                          value={adminQ}
                          onChange={(e) => setAdminQ(e.target.value)}
                          placeholder="搜尋姓名 / Email / 使用者名稱…"
                          className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>
                      <div className="text-xs text-slate-500">
                        顯示 {adminFiltered.length} / {adminData.length} 筆
                      </div>
                    </div>

                    {adminLoading && (
                      <div className="mt-6 flex justify-center text-slate-500">
                        載入中…
                      </div>
                    )}

                    {!adminLoading && adminError && (
                      <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {adminError}
                      </div>
                    )}

                    {!adminLoading && !adminError && (
                      <div className="overflow-x-auto w-full max-w-[450px] sm:max-w-[700px] lg:max-w-[1920px] rounded-xl border bg-white shadow-sm">
                        <table className="w-full text-sm">
                          <thead className="bg-[#F58A9C] text-xs uppercase text-slate-500">
                            <tr>
                              <th className="px-4 py-2 text-slate-50 text-left">
                                會員
                              </th>
                              <th className="px-4 py-2 text-slate-50 text-left">
                                Email
                              </th>
                              <th className="px-4 py-2 text-slate-50 text-left">
                                城市
                              </th>
                              <th className="px-4 py-2 text-slate-50 text-right">
                                訂單數
                              </th>
                              <th className="px-4 py-2 text-slate-50 text-right">
                                累計消費
                              </th>
                              <th className="px-4 py-2 text-slate-50 text-right">
                                推薦註冊
                              </th>
                              <th className="px-4 py-2 text-slate-50 text-right">
                                推薦金
                              </th>
                              <th className="px-4 py-2 text-slate-50 text-center">
                                會員等級
                              </th>
                              <th className="px-4 py-2 text-slate-50 text-left">
                                最近訂購
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {adminFiltered.map((c) => (
                              <Fragment key={c.id}>
                                <tr
                                  className="border-t last:border-b hover:bg-slate-50/80 cursor-pointer"
                                  onClick={() =>
                                    toggleExpandAdminRow(c.id, c.email)
                                  }
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
                                    {c.billingCountry || ""}{" "}
                                    {c.billingCity || ""}
                                  </td>
                                  <td className="px-4 py-2 align-middle text-right">
                                    {c.ordersCount}
                                  </td>
                                  <td className="px-4 py-2 align-middle text-right">
                                    {formatNTD(c.totalSpent)}
                                  </td>

                                  <td className="px-4 py-2 align-middle text-right text-amber-700 font-semibold">
                                    {c.referredCount || 0}
                                  </td>
                                  <td className="px-4 py-2 align-middle text-right text-amber-700 font-semibold">
                                    {formatNTD(c.referralEarned || 0)}
                                  </td>

                                  <td className="px-4 py-2 align-middle text-center">
                                    <span
                                      className={cn(
                                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
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
                                      )}
                                    >
                                      {c.tier}
                                    </span>
                                  </td>

                                  <td className="px-4 py-2 align-middle text-xs text-slate-500">
                                    {c.lastOrderDate
                                      ? new Date(
                                          c.lastOrderDate
                                        ).toLocaleDateString("zh-TW")
                                      : "—"}
                                  </td>
                                </tr>

                                {expandedId === c.id && (
                                  <tr className="bg-slate-50/40">
                                    <td colSpan={9} className="px-4 pb-3 pt-0">
                                      <div className="pt-2 text-xs text-slate-500 mb-1">
                                        會員訂單明細
                                      </div>

                                      {renderExpandedOrders()}

                                      {/* analytics */}
                                      <MemberAnalytics
                                        orders={expandedOrders}
                                        customer={c}
                                      />
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </ShellCard>
                )}

                {activeTab === "admin" && !isAdmin && (
                  <ShellCard title="管理員分析">
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      權限不足（僅網站管理員可查看此區塊）。
                    </div>
                  </ShellCard>
                )}
              </div>

              {/* Right panel */}
              <aside className="space-y-4 lg:sticky lg:top-4 h-fit">
                <ShellCard title="Client Details">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {displayName}
                      </div>
                      <div className="truncate text-[12px] text-slate-500">
                        {customer?.email || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="text-[11px] text-slate-500">Tier</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {membership?.tierName || "—"}
                      </div>
                      {membership?.discountLabel && (
                        <div className="mt-1 text-[12px] text-slate-500">
                          {membership.discountLabel}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="text-[11px] text-slate-500">
                        Spend (12m)
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {formatMoneyNT(membership?.totalSpent12m || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={loadProfile}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      Update Profile
                    </button>
                  </div>
                </ShellCard>

                <ShellCard title="Actions & Coupons">
                  <div className="grid gap-2">
                    <button
                      onClick={loadAvailableCoupons}
                      className="w-full rounded-xl bg-[#F58A9C] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#ed788c]"
                    >
                      Refresh Coupons
                    </button>

                    <button
                      onClick={loadOrders}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      Preview Orders
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500">
                            升等禮
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {membership?.upgradeGift ?? 0} 元
                          </div>
                        </div>
                        {membership?.upgradeGift ? (
                          <button
                            onClick={() => handleClaim("upgrade")}
                            disabled={claimLoading.upgrade || claimed.upgrade}
                            className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                          >
                            {claimed.upgrade
                              ? "已領取"
                              : claimLoading.upgrade
                              ? "領取中…"
                              : "領取"}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </div>

                    {/* ✅ 修改：壽星好禮區塊 (加入月份判斷) */}
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500">壽星好禮</div>
                          
                          {/* 判斷是否已有生日資料 */}
                          {!customer?.birthday ? (
                            <div className="mt-1">
                               {isSettingBirthday ? (
                                 <div className="flex flex-col gap-2 mt-1">
                                   <input 
                                     type="date" 
                                     className="rounded border px-2 py-1 text-xs w-full"
                                     value={birthdayInput}
                                     onChange={(e) => setBirthdayInput(e.target.value)}
                                   />
                                   <div className="flex gap-2">
                                     <button 
                                       onClick={handleUpdateBirthday}
                                       disabled={birthdayLoading}
                                       className="text-xs bg-slate-900 text-white px-2 py-1 rounded"
                                     >
                                       {birthdayLoading ? "..." : "確定"}
                                     </button>
                                     <button 
                                       onClick={() => setIsSettingBirthday(false)}
                                       className="text-xs text-slate-500 px-1"
                                     >
                                       取消
                                     </button>
                                   </div>
                                 </div>
                               ) : (
                                 <div className="text-sm font-semibold text-slate-400">
                                   尚未設定生日
                                 </div>
                               )}
                            </div>
                          ) : (
                            // 已有生日，顯示金額
                            <div className="mt-1 text-sm font-semibold text-slate-900">
                              {membership?.birthdayCredit ?? 0} 元
                            </div>
                          )}
                        </div>

                        {/* 右側按鈕區：加入月份判斷 */}
                        <div className="flex flex-col items-end">
                          {!customer?.birthday ? (
                            !isSettingBirthday && (
                              <button
                                onClick={() => setIsSettingBirthday(true)}
                                className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold hover:bg-white hover:border-slate-400"
                              >
                                填寫生日
                              </button>
                            )
                          ) : (
                            // 已經有生日了
                            membership?.birthdayCredit ? (
                              isCurrentMonthBirthday ? (
                                // 1. 是當月壽星 -> 顯示領取按鈕
                                <button
                                  onClick={() => handleClaim("birthday")}
                                  disabled={claimLoading.birthday || claimed.birthday}
                                  className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                                >
                                  {claimed.birthday ? "已領取" : "領取"}
                                </button>
                              ) : (
                                // 2. 不是當月壽星 -> 顯示提示
                                <span className="text-[10px] text-slate-400 border border-slate-100 bg-slate-50 px-2 py-1 rounded-lg">
                                  限 {getBirthMonthLabel(customer.birthday)} 領取
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-slate-400">{customer.birthday}</span>
                            )
                          )}
                        </div>
                      </div>
                      
                      {!customer?.birthday && isSettingBirthday && (
                        <div className="mt-2 text-[10px] text-rose-500">
                          * 生日填寫後將無法再次修改，請確認輸入正確。
                        </div>
                      )}
                    </div>
                  </div>

                  {claimMessage && (
                    <div
                      className={cn(
                        "mt-4 rounded-2xl border px-4 py-3 text-sm",
                        claimStatus === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-rose-200 bg-rose-50 text-rose-800"
                      )}
                    >
                      <div className="font-semibold">{claimMessage}</div>
                      {claimedCode && (
                        <div className="mt-1 text-[12px]">
                          折扣碼：{" "}
                          <span className="font-semibold">{claimedCode}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-[11px] text-slate-500">
                      推薦獎金總額
                    </div>
                    <div className="mt-1 text-base font-semibold text-slate-900">
                      {formatMoneyNT(referralTotal)}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[12px] text-slate-600">
                      <span className="rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">
                        推薦人 200：{formatMoneyNT(ambassadorTotal)}（
                        {ambassadorCoupons.length}）
                      </span>
                      <span className="rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">
                        被推薦人 50：{formatMoneyNT(friendTotal)}（
                        {friendCoupons.length}）
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    {availableLoading ? (
                      <div className="text-sm text-slate-500">
                        讀取可用購物金中…
                      </div>
                    ) : referralCoupons.length === 0 ? (
                      <div className="text-sm text-slate-500">
                        目前尚無推薦獎金折扣碼
                      </div>
                    ) : (
                      <div className="divide-y overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        {referralToShow.map((c) => (
                          <div
                            key={c.code}
                            className="flex items-center justify-between gap-3 px-4 py-3"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-1 text-[11px] font-semibold",
                                    isAmbassadorCoupon(c.code, c.kind)
                                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                      : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                                  )}
                                >
                                  {isAmbassadorCoupon(c.code, c.kind)
                                    ? "推薦人 200"
                                    : "被推薦人 50"}
                                </span>
                                <span className="text-sm font-semibold text-slate-900">
                                  {formatMoneyNT(c.amount)}
                                </span>
                              </div>
                              <div className="mt-1 truncate text-[12px] text-slate-600">
                                Code：{" "}
                                <span className="font-semibold text-slate-900">
                                  {c.code}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(c.code)
                              }
                              className="shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                            >
                              Copy
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {referralCoupons.length > previewLimit && (
                      <button
                        onClick={() => setShowAllReferralCoupons((v) => !v)}
                        className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                      >
                        {showAllReferralCoupons ? "收合" : "顯示全部"}（
                        {referralCoupons.length}）
                      </button>
                    )}
                  </div>
                </ShellCard>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}