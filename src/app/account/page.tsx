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
import {
  Home,
  Package,
  Users,
  Tag,
  BarChart2,
  Settings,
  Search,
  Bell,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Circle,
  LogOut,
  X,
  Crown,
  ShieldCheck,
  Zap,
  CreditCard,
  Calendar,
  Info,
  Landmark,
} from "lucide-react";

/* ===================== Types ===================== */
type Customer = {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  birthday?: string;
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
type OrderItem = { name: string; quantity: number; total?: string };
type Order = {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  currency: string;
  line_items: OrderItem[];
  payment_method_title?: string;
  customer_note?: string;
  payment_info?: {
    cvs_code?: string;
    atm_account?: string;
    bank_code?: string;
    expire_date?: string;
  };
  meta_data?: { key: string; value: any }[];
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
  payment_method_title?: string;
  customer_note?: string;
  payment_info?: {
    cvs_code?: string;
    atm_account?: string;
    bank_code?: string;
    expire_date?: string;
  };
  meta_data?: { key: string; value: any }[];
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

function parseMetaDataForPayment(metaData: any[]) {
  const info: any = {};
  if (!Array.isArray(metaData)) return info;
  metaData.forEach((item: any) => {
    const key = String(item.key || "").toLowerCase();
    const val = Array.isArray(item.value)
      ? String(item.value[0])
      : String(item.value || "");
    if (
      key.includes("vaccount") ||
      key.includes("virtual_account") ||
      key.includes("atm_account")
    )
      info.atm_account = val;
    if (
      key.includes("bankcode") ||
      key.includes("bank_code") ||
      key.includes("atm_bank")
    )
      info.bank_code = val;
    if (
      key.includes("paymentno") ||
      key.includes("cvs_payment") ||
      key.includes("cvscode")
    )
      info.cvs_code = val;
    if (
      key.includes("expiredate") ||
      key.includes("expire_date") ||
      key.includes("duedate")
    )
      info.expire_date = val;
  });
  return info;
}

function extractInfoFromNote(note: string) {
  if (!note) return null;
  const result: any = {};
  const bankMatch = note.match(/銀行代碼.*?(\d{3})/);
  if (bankMatch) result.bank_code = bankMatch[1];
  const atmMatch = note.match(/虛擬帳號.*?(\d{12,16})/);
  if (atmMatch) result.atm_account = atmMatch[1];
  const cvsMatch = note.match(/繳費代碼.*?([a-zA-Z0-9]{14})/);
  if (cvsMatch) result.cvs_code = cvsMatch[1];
  return Object.keys(result).length > 0 ? result : null;
}

/* ===================== UI Atoms ===================== */
function StatusPill({
  status,
  type = "order",
}: {
  status: string;
  type?: "order" | "account" | "tier" | "admin";
}) {
  const s = String(status || "").toLowerCase();
  if (type === "order") {
    let label = status;
    let tone = "bg-[#e4e5e7] text-[#202223] border-transparent";
    let dotColor = "fill-[#5c5f62]";
    if (s === "pending" || s === "待付款" || s === "waiting-payment") {
      label = "待付款";
      tone = "bg-[#ffea8a] text-[#8a6116] border-transparent";
      dotColor = "fill-[#8a6116]";
    } else if (s === "processing" || s === "處理中") {
      label = "處理中";
      tone = "bg-[#ffea8a] text-[#8a6116] border-transparent";
      dotColor = "fill-[#8a6116]";
    } else if (s === "completed" || s === "paid" || s === "已完成") {
      label = "已完成";
      tone = "bg-[#cbe5cc] text-[#1c5c27] border-transparent";
      dotColor = "fill-[#1c5c27]";
    } else if (s === "cancelled" || s === "已取消") {
      label = "已取消";
    }
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
          tone,
        )}
      >
        <Circle className={cn("w-1.5 h-1.5", dotColor)} />
        {label}
      </span>
    );
  }
  if (type === "account") {
    const isActive = s === "active" || s === "有效" || s === "正常";
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-sm",
          isActive
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-gray-100 text-gray-600 border-gray-200",
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400",
          )}
        />
        {isActive ? "正常" : status}
      </span>
    );
  }
  const isGold = s.includes("金") || s.includes("gold");
  const isSilver = s.includes("銀") || s.includes("silver");
  const isAdmin = s.includes("管理") || s.includes("admin");
  let theme = "bg-slate-100 text-slate-600 border-slate-200";
  let Icon = Zap;
  if (isGold) {
    theme = "bg-amber-50 text-amber-700 border-amber-200 shadow-sm";
    Icon = Crown;
  } else if (isSilver) {
    theme = "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm";
    Icon = Crown;
  } else if (isAdmin) {
    theme = "bg-[#1a1a1a] text-white border-black shadow-sm";
    Icon = ShieldCheck;
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider",
        theme,
      )}
    >
      <Icon size={12} className={cn(!isAdmin && "text-current")} />
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
        "bg-white border border-[#c9cccf] rounded-lg shadow-sm overflow-hidden",
        className,
      )}
    >
      {(title || right) && (
        <header className="px-5 py-4 border-b border-[#c9cccf] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#202223]">{title}</h2>
          <div>{right}</div>
        </header>
      )}
      <div className="p-5">{children}</div>
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
    <div>
      <p className="text-xs text-[#6d7175] mb-1">{label}</p>
      <div className="text-sm text-[#202223] font-medium">{value}</div>
    </div>
  );
}

function SidebarItem({
  active,
  label,
  icon,
  onClick,
}: {
  active?: boolean;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-1.5 w-full text-left rounded-md transition-colors text-sm",
        active
          ? "bg-[#f6f6f7] text-[#202223] font-semibold shadow-sm"
          : "text-[#5c5f62] hover:bg-[#f1f2f4]",
      )}
    >
      <span className={active ? "text-[#202223]" : "text-[#8c9196]"}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function MetricBlock({
  title,
  value,
  subtext,
}: {
  title: string;
  value: React.ReactNode;
  subtext?: string;
}) {
  return (
    <div className="flex flex-col flex-1">
      <span className="text-xs font-medium text-[#6d7175] mb-1">{title}</span>
      <div className="text-xl font-bold text-[#202223] flex items-center gap-2">
        {value}
        {subtext && (
          <span className="text-xs font-normal text-[#6d7175]">{subtext}</span>
        )}
      </div>
    </div>
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
  if (!orders || orders.length === 0)
    return (
      <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-500">
        尚無足夠訂單資料可供分析。
      </div>
    );
  const totalAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const orderCount = orders.length;
  const avgAmount = orderCount > 0 ? totalAmount / orderCount : 0;
  const monthLabels: string[] = [];
  const monthTotalsMap: Record<string, number> = {};
  orders.forEach((o) => {
    const d = new Date(o.date_created);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthLabels.includes(key)) monthLabels.push(key);
    monthTotalsMap[key] = (monthTotalsMap[key] || 0) + (o.total || 0);
  });
  monthLabels.sort();
  const monthTotals = monthLabels.map((m) => monthTotalsMap[m] || 0);
  const productMap: Record<string, number> = {};
  orders.forEach((o) =>
    o.line_items.forEach((it) => {
      productMap[it.name] = (productMap[it.name] || 0) + (it.quantity || 0);
    }),
  );
  const productEntries = Object.entries(productMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const productLabels = productEntries.map(([name]) => name);
  const productQty = productEntries.map(([, q]) => q);

  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border bg-white px-3 py-2 shadow-sm">
          <div className="text-[11px] text-slate-500">訂單數</div>
          <div className="mt-1 text-lg font-semibold text-slate-800">
            {orderCount}
          </div>
        </div>
        <div className="rounded-lg border bg-white px-3 py-2 shadow-sm">
          <div className="text-[11px] text-slate-500">累計消費</div>
          <div className="mt-1 text-lg font-semibold text-slate-800">
            {formatNTD(totalAmount)}
          </div>
        </div>
        <div className="rounded-lg border bg-white px-3 py-2 shadow-sm">
          <div className="text-[11px] text-slate-500">平均客單價</div>
          <div className="mt-1 text-lg font-semibold text-slate-800">
            {orderCount === 0 ? "—" : formatNTD(avgAmount)}
          </div>
        </div>
        <div className="rounded-lg border bg-white px-3 py-2 shadow-sm">
          <div className="text-[11px] text-slate-500">推薦註冊人數</div>
          <div className="mt-1 text-lg font-semibold text-amber-700">
            {customer.referredCount || 0}
          </div>
        </div>
        <div className="rounded-lg border bg-white px-3 py-2 shadow-sm">
          <div className="text-[11px] text-slate-500">成功首單推薦</div>
          <div className="mt-1 text-lg font-semibold text-amber-700">
            {customer.rewardedCount || 0}
          </div>
        </div>
        <div className="rounded-lg border bg-white px-3 py-2 shadow-sm">
          <div className="text-[11px] text-slate-500">已賺推薦金</div>
          <div className="mt-1 text-lg font-semibold text-amber-700">
            {formatNTD(customer.referralEarned || 0)}
          </div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border bg-white px-3 py-2 shadow-sm">
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
        <div className="rounded-lg border bg-white px-3 py-2 shadow-sm">
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
                series={[{ data: productQty, label: "數量", color: "#008060" }]}
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
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [membership, setMembership] = useState<MembershipInfo | null>(null);
  const [error, setError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersDebug, setOrdersDebug] = useState<any>(null); // 💡 新增除錯狀態

  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>(
    [],
  );
  const [availableLoading, setAvailableLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState({
    upgrade: false,
    birthday: false,
  });
  const [claimed, setClaimed] = useState({ upgrade: false, birthday: false });
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [claimStatus, setClaimStatus] = useState<"success" | "error" | null>(
    null,
  );
  const [claimedCode, setClaimedCode] = useState<string | null>(null);
  const [showAllReferralCoupons, setShowAllReferralCoupons] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState<AdminCustomer[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedUserOrderId, setExpandedUserOrderId] = useState<number | null>(
    null,
  );
  const [expandedOrders, setExpandedOrders] = useState<AdminOrder[]>([]);
  const [expandedOrdersLoading, setExpandedOrdersLoading] = useState(false);
  const [expandedOrdersError, setExpandedOrdersError] = useState("");
  const adminLoadedOnceRef = useRef(false);

  const [birthdayInput, setBirthdayInput] = useState("");
  const [isSettingBirthday, setIsSettingBirthday] = useState(false);
  const [birthdayLoading, setBirthdayLoading] = useState(false);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [modalBirthdayInput, setModalBirthdayInput] = useState("");

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
          roles.includes("網站管理員") ||
          role === "administrator" ||
          role === "admin" ||
          role === "網站管理員";
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
      setOrdersDebug(data.debug || null); // 儲存除錯資訊
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
      if (res.ok && data?.ok && Array.isArray(data.available))
        setAvailableCoupons(data.available);
      else setAvailableCoupons([]);
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
  useEffect(() => {
    if (!loading && loggedIn && customer && !customer.birthday) {
      const hasPrompted = sessionStorage.getItem("birthdayPrompted");
      if (!hasPrompted) {
        setShowBirthdayModal(true);
        sessionStorage.setItem("birthdayPrompted", "true");
      }
    }
  }, [loading, loggedIn, customer]);

  const handleUpdateBirthday = async () => {
    if (!birthdayInput) return alert("請選擇生日");
    if (!confirm(`您的生日是 ${birthdayInput} 嗎？\n確認後將無法再次修改。`))
      return;
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
        setCustomer((prev) =>
          prev ? { ...prev, birthday: birthdayInput } : null,
        );
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

  const handleModalSubmit = async () => {
    if (!modalBirthdayInput) return alert("請選擇生日");
    if (
      !confirm(`您的生日是 ${modalBirthdayInput} 嗎？\n確認後將無法再次修改。`)
    )
      return;
    setBirthdayLoading(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthday: modalBirthdayInput }),
      });
      const data = await res.json();
      if (data.ok) {
        alert("生日設定成功！");
        setCustomer((prev) =>
          prev ? { ...prev, birthday: modalBirthdayInput } : null,
        );
        setShowBirthdayModal(false);
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
          data?.message || data?.detail || "領取失敗，請稍後再試。",
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

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.number.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q) ||
        o.total.includes(q),
    );
  }, [orders, searchQuery]);

  const sortedCoupons = useMemo(() => {
    return [...availableCoupons].sort(
      (a, b) => pickCouponCreatedAt(b) - pickCouponCreatedAt(a),
    );
  }, [availableCoupons]);
  const referralCoupons = useMemo(() => {
    return sortedCoupons.filter(
      (c) =>
        isFriendCoupon(c.code, c.kind) || isAmbassadorCoupon(c.code, c.kind),
    );
  }, [sortedCoupons]);
  const filteredCoupons = useMemo(() => {
    let base = referralCoupons;
    if (searchQuery && activeTab === "profile") {
      const q = searchQuery.toLowerCase();
      base = base.filter(
        (c) => c.code.toLowerCase().includes(q) || String(c.amount).includes(q),
      );
    }
    const previewLimit = 6;
    return showAllReferralCoupons || (searchQuery && activeTab === "profile")
      ? base
      : base.slice(0, previewLimit);
  }, [referralCoupons, showAllReferralCoupons, searchQuery, activeTab]);

  const ambassadorCoupons = useMemo(
    () => referralCoupons.filter((c) => isAmbassadorCoupon(c.code, c.kind)),
    [referralCoupons],
  );
  const friendCoupons = useMemo(
    () => referralCoupons.filter((c) => isFriendCoupon(c.code, c.kind)),
    [referralCoupons],
  );
  const ambassadorTotal = useMemo(
    () =>
      ambassadorCoupons.reduce((sum, c) => sum + (Number(c.amount) || 0), 0),
    [ambassadorCoupons],
  );
  const friendTotal = useMemo(
    () => friendCoupons.reduce((sum, c) => sum + (Number(c.amount) || 0), 0),
    [friendCoupons],
  );
  const referralTotal = ambassadorTotal + friendTotal;

  const displayName =
    (
      (customer?.first_name || "") +
      (customer?.last_name ? ` ${customer?.last_name}` : "")
    ).trim() ||
    customer?.username ||
    (customer?.email ? customer.email.split("@")[0] : "會員");
  const getBirthMonthLabel = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return `${d.getMonth() + 1}月`;
  };
  const isCurrentMonthBirthday = useMemo(() => {
    if (!customer?.birthday) return false;
    const d = new Date(customer.birthday);
    const now = new Date();
    return d.getMonth() === now.getMonth();
  }, [customer?.birthday]);

  const loadAdminCustomers = useCallback(async () => {
    setAdminLoading(true);
    setAdminError("");
    try {
      const res = await fetch("/api/admin/customers", { cache: "no-store" });
      const js = await res.json();
      if (!res.ok || !js.ok) {
        setAdminData([]);
        setAdminError(
          `伺服器拒絕 (${res.status}): ${js?.message || "請檢查後端 API 的權限設定"}`,
        );
        return;
      }
      setAdminData(js.customers || []);
      adminLoadedOnceRef.current = true;
    } catch (e: any) {
      setAdminError(e?.message || "讀取會員名單時發生錯誤");
    } finally {
      setAdminLoading(false);
    }
  }, []);

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
      if (!res.ok || !js.ok)
        throw new Error(`(${res.status}) ${js?.message || "讀取訂單失敗"}`);
      setExpandedOrders(js.orders || []);
    } catch (e: any) {
      setExpandedOrders([]);
      setExpandedOrdersError(e?.message || "讀取訂單失敗");
    } finally {
      setExpandedOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (
      !loggedIn ||
      !isAdmin ||
      activeTab !== "admin" ||
      adminLoadedOnceRef.current
    )
      return;
    loadAdminCustomers();
  }, [activeTab, isAdmin, loggedIn, loadAdminCustomers]);

  const adminFiltered = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword || activeTab !== "admin") return adminData;
    return adminData.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        c.email.toLowerCase().includes(keyword) ||
        (c.username || "").toLowerCase().includes(keyword),
    );
  }, [searchQuery, adminData, activeTab]);

  const totalMembers = adminData.length;
  const totalRevenue = adminData.reduce((s, c) => s + c.totalSpent, 0);
  const totalReferred = adminData.reduce(
    (s, c) => s + (c.referredCount || 0),
    0,
  );
  const totalReferralEarned = adminData.reduce(
    (s, c) => s + (c.referralEarned || 0),
    0,
  );

  const renderExpandedOrdersAdmin = () => {
    if (expandedOrdersLoading)
      return <p className="text-xs text-slate-500 py-2">載入訂單中…</p>;
    if (expandedOrdersError)
      return (
        <p className="text-xs text-rose-600 py-2">{expandedOrdersError}</p>
      );
    if (expandedOrders.length === 0)
      return <p className="text-xs text-slate-500 py-2">目前尚無任何訂單。</p>;

    return (
      <div className="mt-1 rounded-lg border bg-slate-50">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-100 text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">訂單編號</th>
              <th className="px-3 py-2 text-left font-semibold">日期</th>
              <th className="px-3 py-2 text-left font-semibold">狀態</th>
              <th className="px-3 py-2 text-left font-semibold">付款資訊</th>
              <th className="px-3 py-2 text-right font-semibold">金額</th>
              <th className="px-3 py-2 text-left font-semibold w-1/4">品項</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expandedOrders.map((o) => {
              const parsedMeta = parseMetaDataForPayment(o.meta_data || []);
              const noteInfo = extractInfoFromNote(o.customer_note || "");
              const cvsCode =
                parsedMeta.cvs_code ||
                o.payment_info?.cvs_code ||
                noteInfo?.cvs_code;
              const atmAccount =
                parsedMeta.atm_account ||
                o.payment_info?.atm_account ||
                noteInfo?.atm_account;
              const bankCode =
                parsedMeta.bank_code ||
                o.payment_info?.bank_code ||
                noteInfo?.bank_code;
              const expireDate =
                parsedMeta.expire_date ||
                o.payment_info?.expire_date ||
                noteInfo?.expire_date ||
                "依綠界規定";
              const pTitle = o.payment_method_title || "標準支付";

              return (
                <tr key={o.id} className="hover:bg-gray-100 transition-colors">
                  <td className="px-3 py-2 align-top font-medium text-slate-700">
                    #{o.number}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-500">
                    {new Date(o.date_created).toLocaleString("zh-TW")}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <StatusPill status={o.status} type="order" />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="font-semibold text-slate-700">{pTitle}</div>
                    {atmAccount && (
                      <div className="mt-1 text-[11px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 w-fit">
                        ATM: {bankCode} - {atmAccount}
                      </div>
                    )}
                    {cvsCode && (
                      <div className="mt-1 text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-fit">
                        CVS: {cvsCode}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top text-right font-semibold">
                    {formatNTD(o.total)}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="flex flex-col gap-1">
                      {o.line_items.slice(0, 3).map((it, idx) => (
                        <span
                          key={idx}
                          className="text-slate-600 truncate"
                          title={it.name}
                        >
                          {it.name}{" "}
                          <span className="text-slate-400">×{it.quantity}</span>
                        </span>
                      ))}
                      {o.line_items.length > 3 && (
                        <span className="text-slate-400">
                          ...等 {o.line_items.length} 項
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#f6f6f7] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#008060] border-t-transparent animate-spin"></div>
          <p className="text-[#6d7175] text-sm font-medium">載入中...</p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="h-screen bg-[#f6f6f7] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-[#c9cccf] rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-bold text-[#202223] mb-2">尚未登入</h2>
          <p className="text-sm text-[#6d7175] mb-6">
            請先登入以檢視您的會員中心與專屬優惠。
          </p>
          <button
            onClick={() =>
              router.push(`/login?next=${encodeURIComponent("/account")}`)
            }
            className="w-full bg-[#008060] hover:bg-[#006e52] text-white py-2.5 rounded-md text-sm font-medium transition-colors shadow-[0_1px_0_rgba(0,0,0,0.15)]"
          >
            前往登入
          </button>
          {error && (
            <p className="mt-4 text-xs text-rose-600 bg-rose-50 p-2 rounded">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  const getSearchPlaceholder = () => {
    if (activeTab === "orders") return "搜尋訂單編號或狀態...";
    if (activeTab === "admin") return "搜尋會員姓名、Email...";
    return "搜尋優惠券代碼...";
  };

  return (
    <div className="min-h-screen flex flex-col pt-20 mt-10 bg-[#f6f6f7] text-[#202223] font-sans">
      <header className="h-14 bg-[#1a1a1a] flex items-center justify-between px-4 shrink-0 z-10 border-b border-[#000]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
            <div className="w-7 h-7 bg-[#95bf47] rounded flex items-center justify-center text-white">
              <span className="text-sm">U</span>
            </div>
            UFLOW{" "}
            <span className="text-[#a6a6a6] font-normal text-sm ml-1 hidden sm:inline">
              後台
            </span>
          </div>
        </div>
        <div className="flex-1 max-w-2xl px-4 hidden md:block">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3 text-[#8c9196] w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getSearchPlaceholder()}
              className="w-full bg-[#2c2c2c] text-white placeholder-[#8c9196] text-sm border-none rounded-md pl-10 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#95bf47]"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 justify-end">
          <button className="text-[#a6a6a6] hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 bg-[#2c2c2c] px-2 py-1 rounded-md cursor-pointer hover:bg-[#333] transition-colors border border-[#404040]">
            <div className="w-6 h-6 bg-[#ffc453] rounded-sm flex items-center justify-center text-[#8a6116] text-xs font-bold uppercase">
              {displayName.substring(0, 2)}
            </div>
            <span className="text-sm text-white hidden sm:block truncate max-w-[100px]">
              {displayName}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-60 bg-[#ebebeb] border-r border-[#d2d5d8] flex flex-col hidden md:flex shrink-0">
          <div className="p-3 flex flex-col gap-1">
            <SidebarItem
              active={activeTab === "profile"}
              label="帳戶"
              icon={<Users size={18} />}
              onClick={() => {
                setActiveTab("profile");
                setSearchQuery("");
              }}
            />
            <div className="mt-4 mb-1 px-3 text-xs font-semibold text-[#6d7175]">
              訂單與銷售
            </div>
            <SidebarItem
              active={activeTab === "orders"}
              label="訂單"
              icon={<Package size={18} />}
              onClick={() => {
                setActiveTab("orders");
                setSearchQuery("");
              }}
            />
            <SidebarItem
              label="優惠券"
              icon={<Tag size={18} />}
              onClick={() => {
                setActiveTab("profile");
                setSearchQuery("");
              }}
            />
            <SidebarItem
              label="推薦計畫"
              icon={<Users size={18} />}
              onClick={() => {
                setActiveTab("profile");
                setSearchQuery("");
              }}
            />
            {isAdmin && (
              <>
                <div className="mt-4 mb-1 px-3 text-xs font-semibold text-[#6d7175]">
                  進階管理
                </div>
                <SidebarItem
                  active={activeTab === "admin"}
                  label="會員管理與分析"
                  icon={<BarChart2 size={18} />}
                  onClick={() => {
                    setActiveTab("admin");
                    setSearchQuery("");
                  }}
                />
              </>
            )}
          </div>
          <div className="mt-auto p-3 flex flex-col gap-1 border-t border-[#d2d5d8]">
            <SidebarItem
              label="合作洽談"
              icon={<ExternalLink size={18} />}
              onClick={() => router.push("/cooperate")}
            />
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.replace("/login?next=/account");
              }}
              className="flex items-center gap-3 px-3 py-1.5 w-full text-left rounded-md transition-colors text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} /> 登出
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 relative overflow-y-auto w-full">
          <div className="md:hidden mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9196] w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getSearchPlaceholder()}
              className="w-full bg-white border border-[#c9cccf] text-[#202223] text-sm rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#008060]"
            />
          </div>

          <div className="max-w-[1200px] mx-auto flex flex-col gap-5 w-full">
            <div className="flex border-b border-[#c9cccf] overflow-x-auto mb-2">
              <button
                onClick={() => {
                  setActiveTab("profile");
                  setSearchQuery("");
                }}
                className={`px-5 py-3 text-sm font-medium relative whitespace-nowrap transition-colors ${activeTab === "profile" ? "text-[#202223]" : "text-[#6d7175] hover:text-[#202223]"}`}
              >
                帳戶概覽
                {activeTab === "profile" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#008060] rounded-t-md"></div>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab("orders");
                  setSearchQuery("");
                }}
                className={`px-5 py-3 text-sm font-medium relative whitespace-nowrap transition-colors ${activeTab === "orders" ? "text-[#202223]" : "text-[#6d7175] hover:text-[#202223]"}`}
              >
                我的訂單
                {activeTab === "orders" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#008060] rounded-t-md"></div>
                )}
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    setActiveTab("admin");
                    setSearchQuery("");
                  }}
                  className={`px-5 py-3 text-sm font-medium relative whitespace-nowrap transition-colors ${activeTab === "admin" ? "text-[#202223]" : "text-[#6d7175] hover:text-[#202223]"}`}
                >
                  會員管理與分析
                  {activeTab === "admin" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#008060] rounded-t-md"></div>
                  )}
                </button>
              )}
            </div>

            {activeTab !== "admin" && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button className="p-1.5 border border-[#c9cccf] bg-white rounded-md shadow-[0_1px_0_rgba(0,0,0,0.05)] hover:bg-gray-50 text-[#5c5f62] hidden sm:block">
                      <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-[#202223] flex items-center gap-3">
                      {displayName}
                      {isAdmin && <StatusPill status="管理員" type="tier" />}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        loadAvailableCoupons();
                        loadOrders();
                        loadReferral();
                        loadProfile();
                      }}
                      className="bg-white border border-[#c9cccf] shadow-[0_1px_0_rgba(0,0,0,0.05)] text-[#202223] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#f6f6f7] transition-colors"
                    >
                      重新整理
                    </button>
                    <button
                      onClick={loadProfile}
                      className="bg-[#008060] text-white border border-[#008060] shadow-[0_1px_0_rgba(0,0,0,0.15)] rounded-md px-3 py-1.5 text-sm font-medium hover:bg-[#006e52] transition-colors"
                    >
                      更新資料
                    </button>
                  </div>
                </div>

                {activeTab === "profile" && (
                  <div className="bg-white border border-[#c9cccf] rounded-lg shadow-sm p-4 flex gap-4 sm:gap-8 flex-wrap">
                    <MetricBlock
                      title="目前等級"
                      value={
                        membership?.tierName ? (
                          <StatusPill
                            status={membership.tierName}
                            type="tier"
                          />
                        ) : (
                          "—"
                        )
                      }
                    />
                    <div className="hidden sm:block w-px bg-[#e1e3e5] my-2"></div>
                    <MetricBlock
                      title="年度累積消費"
                      value={formatMoneyNT(membership?.totalSpent12m || 0)}
                    />
                    <div className="hidden sm:block w-px bg-[#e1e3e5] my-2"></div>
                    <MetricBlock
                      title="推薦獎金總額"
                      value={formatMoneyNT(referralTotal)}
                    />
                    <div className="hidden sm:block w-px bg-[#e1e3e5] my-2"></div>
                    <MetricBlock
                      title="升級進度"
                      value={
                        membership?.nextNeedAmount
                          ? formatMoneyNT(membership.nextNeedAmount)
                          : "—"
                      }
                      subtext={
                        membership?.nextTierName
                          ? `距離 ${membership.nextTierName} 尚差`
                          : undefined
                      }
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                  <div className="lg:col-span-2 flex flex-col gap-5">
                    {activeTab === "profile" && (
                      <>
                        <ShellCard
                          title="會員資料概覽"
                          right={
                            <span className="text-xs font-mono text-[#6d7175] bg-gray-50 px-2 py-1 rounded">
                              #UID_{customer?.id || "-"}
                            </span>
                          }
                        >
                          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                            <MiniField label="姓名" value={displayName} />
                            <MiniField
                              label="電子信箱"
                              value={customer?.email || "-"}
                            />
                            <MiniField
                              label="生日"
                              value={customer?.birthday || "未設定"}
                            />
                            <MiniField
                              label="使用者名稱"
                              value={customer?.username || "-"}
                            />
                          </div>
                        </ShellCard>

                        <ShellCard
                          title="推薦計畫"
                          right={
                            <StatusPill status="金牌大使推薦" type="tier" />
                          }
                        >
                          {referralLoading ? (
                            <p className="text-sm text-[#6d7175]">
                              讀取推薦資訊中...
                            </p>
                          ) : !referral ? (
                            <p className="text-sm text-[#6d7175]">
                              尚無推薦資訊
                            </p>
                          ) : (
                            <div className="space-y-5">
                              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 text-sm text-emerald-900">
                                親友註冊可得{" "}
                                <strong className="text-emerald-700">
                                  NT$ {referral.friendReward}
                                </strong>{" "}
                                購物金，親友首單完成後你可得{" "}
                                <strong className="text-emerald-700">
                                  NT$ {referral.ambassadorReward}
                                </strong>{" "}
                                抵用金。
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-[#6d7175] mb-1">
                                    您的推薦碼
                                  </p>
                                  <div className="flex items-center justify-between border border-[#c9cccf] rounded-md px-3 py-2 bg-[#f9fafb]">
                                    <code className="text-sm font-mono font-bold text-[#008060]">
                                      {referral.refCode}
                                    </code>
                                    <button
                                      onClick={() =>
                                        navigator.clipboard.writeText(
                                          referral.refCode,
                                        )
                                      }
                                      className="text-[#5c5f62] hover:text-[#008060] transition-colors"
                                    >
                                      <Copy size={16} />
                                    </button>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-[#6d7175] mb-1">
                                    推薦連結
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <input
                                      readOnly
                                      value={referral.referralLink}
                                      className="flex-1 border border-[#c9cccf] rounded-md px-3 py-2 text-sm bg-[#f9fafb] outline-none font-mono text-xs"
                                    />
                                    <button
                                      onClick={() =>
                                        navigator.clipboard.writeText(
                                          referral.referralLink,
                                        )
                                      }
                                      className="bg-white border border-[#c9cccf] shadow-sm text-[#202223] px-3 py-2 rounded-md hover:bg-[#f6f6f7] transition-colors font-medium text-sm"
                                    >
                                      複製
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </ShellCard>
                      </>
                    )}

                    {activeTab === "orders" && (
                      <ShellCard
                        title={
                          searchQuery
                            ? `搜尋結果: "${searchQuery}"`
                            : "我的訂單紀錄"
                        }
                      >
                        {ordersLoading ? (
                          <p className="text-sm text-[#6d7175]">
                            載入訂單中...
                          </p>
                        ) : (
                          <>
                            {/* 💡 永遠顯示的 API 除錯黑盒子 */}
                            {ordersDebug && (
                              <div className="mb-4 p-4 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg overflow-auto max-h-64 text-left border border-emerald-900">
                                <div className="text-white mb-2 font-bold flex justify-between">
                                  <span>🛠️ API 搜尋軌跡偵錯報告</span>
                                </div>
                                <pre>
                                  {JSON.stringify(ordersDebug, null, 2)}
                                </pre>
                              </div>
                            )}

                            {filteredOrders.length === 0 ? (
                              <div className="py-4 text-center border border-dashed border-[#c9cccf] rounded bg-[#f9fafb]">
                                <p className="text-sm text-[#6d7175] mb-4">
                                  {searchQuery
                                    ? "找不到符合條件的訂單。"
                                    : "目前尚未有任何訂單紀錄。"}
                                </p>
                              </div>
                            ) : (
                              <div className="-mx-5 -mb-5 mt-2 overflow-x-auto">
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                  <thead className="bg-[#f9fafb] text-[#6d7175] border-y border-[#c9cccf]">
                                    <tr>
                                      <th className="px-5 py-3 font-medium">
                                        訂單號碼
                                      </th>
                                      <th className="px-5 py-3 font-medium">
                                        下單日期
                                      </th>
                                      <th className="px-5 py-3 font-medium">
                                        訂單狀態
                                      </th>
                                      <th className="px-5 py-3 font-medium text-right">
                                        總金額
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#ebebeb]">
                                    {filteredOrders.map((o) => {
                                      const parsedMeta =
                                        parseMetaDataForPayment(
                                          o.meta_data || [],
                                        );
                                      const noteInfo = extractInfoFromNote(
                                        o.customer_note || "",
                                      );
                                      const cvsCode =
                                        parsedMeta.cvs_code ||
                                        o.payment_info?.cvs_code ||
                                        noteInfo?.cvs_code;
                                      const atmAccount =
                                        parsedMeta.atm_account ||
                                        o.payment_info?.atm_account ||
                                        noteInfo?.atm_account;
                                      const bankCode =
                                        parsedMeta.bank_code ||
                                        o.payment_info?.bank_code ||
                                        noteInfo?.bank_code;
                                      const expireDate =
                                        parsedMeta.expire_date ||
                                        o.payment_info?.expire_date ||
                                        noteInfo?.expire_date ||
                                        "依綠界規定";
                                      const pTitle =
                                        o.payment_method_title || "標準支付";

                                      return (
                                        <Fragment key={o.id}>
                                          <tr
                                            onClick={() =>
                                              setExpandedUserOrderId(
                                                expandedUserOrderId === o.id
                                                  ? null
                                                  : o.id,
                                              )
                                            }
                                            className="hover:bg-[#f9fafb] cursor-pointer transition-colors"
                                          >
                                            <td className="px-5 py-4 font-semibold text-[#202223] flex items-center gap-2">
                                              {expandedUserOrderId === o.id ? (
                                                <ChevronUp size={14} />
                                              ) : (
                                                <ChevronDown size={14} />
                                              )}{" "}
                                              #{o.number}
                                            </td>
                                            <td className="px-5 py-4 text-[#6d7175]">
                                              {new Date(
                                                o.date_created,
                                              ).toLocaleDateString("zh-TW")}
                                            </td>
                                            <td className="px-5 py-4">
                                              <StatusPill
                                                status={o.status}
                                                type="order"
                                              />
                                            </td>
                                            <td className="px-5 py-4 font-bold text-[#202223] text-right">
                                              {formatMoneyNT(Number(o.total))}
                                            </td>
                                          </tr>

                                          {expandedUserOrderId === o.id && (
                                            <tr className="bg-gray-50/50">
                                              <td
                                                colSpan={4}
                                                className="px-8 py-6 border-b border-[#c9cccf]"
                                              >
                                                <div className="grid md:grid-cols-2 gap-8">
                                                  <div className="flex flex-col gap-4">
                                                    <h4 className="font-bold text-[#202223] flex items-center gap-2">
                                                      <CreditCard
                                                        size={18}
                                                        className="text-blue-600"
                                                      />{" "}
                                                      付款詳情
                                                    </h4>

                                                    {cvsCode ? (
                                                      <div className="bg-blue-600 text-white rounded-lg p-5 shadow-lg animate-in zoom-in-95 duration-200">
                                                        <p className="text-xs opacity-80 mb-1">
                                                          超商繳費代碼 (CVS)
                                                        </p>
                                                        <div className="text-2xl font-mono font-black tracking-widest flex items-center justify-between">
                                                          {cvsCode}
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              navigator.clipboard.writeText(
                                                                cvsCode,
                                                              );
                                                            }}
                                                            className="hover:scale-110 active:scale-95 transition-transform"
                                                          >
                                                            <Copy size={20} />
                                                          </button>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                                                          <div className="flex items-center gap-2 text-xs">
                                                            <Calendar
                                                              size={14}
                                                            />{" "}
                                                            繳費期限:{" "}
                                                            {expireDate}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    ) : atmAccount ? (
                                                      <div className="bg-indigo-600 text-white rounded-lg p-5 shadow-lg animate-in zoom-in-95 duration-200">
                                                        <div className="flex justify-between items-start mb-4">
                                                          <div>
                                                            <p className="text-xs opacity-80 mb-1">
                                                              銀行代碼
                                                            </p>
                                                            <div className="text-xl font-bold tracking-wider flex items-center gap-2">
                                                              <Landmark
                                                                size={20}
                                                              />
                                                              {bankCode ||
                                                                "請見綠界通知信"}
                                                            </div>
                                                          </div>
                                                          <div className="text-right">
                                                            <p className="text-xs opacity-80 mb-1">
                                                              繳費期限
                                                            </p>
                                                            <div className="text-sm font-medium flex items-center gap-1 justify-end">
                                                              <Calendar
                                                                size={14}
                                                              />{" "}
                                                              {expireDate}
                                                            </div>
                                                          </div>
                                                        </div>
                                                        <p className="text-xs opacity-80 mb-1">
                                                          ATM 專屬虛擬帳號
                                                        </p>
                                                        <div className="text-2xl font-mono font-black tracking-widest flex items-center justify-between bg-white/10 px-3 py-2 rounded-md">
                                                          {atmAccount}
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              navigator.clipboard.writeText(
                                                                atmAccount,
                                                              );
                                                            }}
                                                            className="hover:scale-110 active:scale-95 transition-transform bg-white/20 p-1.5 rounded"
                                                          >
                                                            <Copy size={18} />
                                                          </button>
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <div className="text-sm text-gray-500 bg-white border border-gray-200 p-4 rounded-md">
                                                        付款方式:{" "}
                                                        <span className="font-medium text-gray-900">
                                                          {pTitle}
                                                        </span>
                                                        <p className="mt-1 text-xs opacity-70">
                                                          此訂單目前無須額外代碼，請依系統指示操作。
                                                        </p>
                                                      </div>
                                                    )}
                                                  </div>

                                                  <div className="flex flex-col gap-4">
                                                    <h4 className="font-bold text-[#202223] flex items-center gap-2">
                                                      <Info
                                                        size={18}
                                                        className="text-gray-600"
                                                      />{" "}
                                                      訂單品項
                                                    </h4>
                                                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                      {o.line_items.map(
                                                        (item, idx) => (
                                                          <div
                                                            key={idx}
                                                            className="px-4 py-3 flex justify-between border-b border-gray-100 last:border-0 hover:bg-gray-50"
                                                          >
                                                            <div>
                                                              <p className="text-sm font-bold text-gray-900">
                                                                {item.name}
                                                              </p>
                                                              <p className="text-xs text-gray-500">
                                                                數量:{" "}
                                                                {item.quantity}
                                                              </p>
                                                            </div>
                                                            <p className="text-sm font-mono font-medium">
                                                              {item.total
                                                                ? formatMoneyNT(
                                                                    Number(
                                                                      item.total,
                                                                    ),
                                                                  )
                                                                : ""}
                                                            </p>
                                                          </div>
                                                        ),
                                                      )}
                                                      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center font-black">
                                                        <span>總計金額</span>
                                                        <span className="text-lg text-emerald-700">
                                                          {formatMoneyNT(
                                                            Number(o.total),
                                                          )}
                                                        </span>
                                                      </div>
                                                    </div>

                                                    <div className="mt-4 p-4 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg overflow-auto max-h-48">
                                                      <div className="text-white mb-2 font-bold flex items-center gap-2">
                                                        🛠️
                                                        系統偵錯：尋找綠界隱藏欄位
                                                      </div>
                                                      <div className="mb-2 text-yellow-400 border-b border-white/20 pb-2">
                                                        [Customer Note]:
                                                        <br />
                                                        {o.customer_note ||
                                                          "無備註內容"}
                                                      </div>
                                                      <pre className="whitespace-pre-wrap leading-relaxed">
                                                        {JSON.stringify(
                                                          o.meta_data,
                                                          null,
                                                          2,
                                                        )}
                                                      </pre>
                                                    </div>
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          )}
                                        </Fragment>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </>
                        )}
                      </ShellCard>
                    )}
                  </div>

                  <div className="lg:col-span-1 flex flex-col gap-5">
                    <ShellCard title="狀態與詳情">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-[#ebebeb] pb-3">
                          <span className="text-[#6d7175] text-sm">
                            帳戶狀態
                          </span>
                          <StatusPill status="正常運作" type="account" />
                        </div>
                        <div className="flex justify-between items-center border-b border-[#ebebeb] pb-3">
                          <span className="text-[#6d7175] text-sm">
                            折扣優惠
                          </span>
                          <span className="font-bold text-emerald-600 text-sm">
                            {membership?.discountLabel || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#6d7175] text-sm block mb-2">
                            生日
                          </span>
                          {!customer?.birthday ? (
                            !isSettingBirthday ? (
                              <button
                                onClick={() => setIsSettingBirthday(true)}
                                className="w-full border border-dashed border-[#c9cccf] bg-[#f9fafb] hover:bg-white text-[#202223] py-1.5 rounded-md text-sm font-medium transition-colors"
                              >
                                設定生日
                              </button>
                            ) : (
                              <div className="flex flex-col gap-2">
                                <input
                                  type="date"
                                  value={birthdayInput}
                                  onChange={(e) =>
                                    setBirthdayInput(e.target.value)
                                  }
                                  className="w-full border border-[#c9cccf] rounded-md px-3 py-1.5 text-sm outline-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleUpdateBirthday}
                                    disabled={birthdayLoading}
                                    className="flex-1 bg-[#008060] text-white text-sm py-1.5 rounded-md hover:bg-[#006e52]"
                                  >
                                    {birthdayLoading ? "..." : "儲存"}
                                  </button>
                                  <button
                                    onClick={() => setIsSettingBirthday(false)}
                                    className="flex-1 bg-white border border-[#c9cccf] text-[#202223] text-sm py-1.5 rounded-md hover:bg-[#f6f6f7]"
                                  >
                                    取消
                                  </button>
                                </div>
                                <p className="text-[10px] text-rose-500 italic">
                                  * 生日填寫後將無法修改
                                </p>
                              </div>
                            )
                          ) : (
                            <div className="font-bold text-[#202223] text-sm bg-gray-50 px-3 py-1.5 rounded border border-gray-100 flex items-center gap-2">
                              <span className="text-rose-400">🎂</span>{" "}
                              {customer.birthday}
                            </div>
                          )}
                        </div>
                      </div>
                    </ShellCard>

                    <ShellCard title="獎勵與優惠券">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-[#ebebeb] pb-3">
                          <div>
                            <p className="text-sm font-medium text-[#202223]">
                              升等禮
                            </p>
                            <p className="text-xs font-bold text-amber-600">
                              {membership?.upgradeGift ?? 0} 元
                            </p>
                          </div>
                          {membership?.upgradeGift ? (
                            <button
                              onClick={() => handleClaim("upgrade")}
                              disabled={claimLoading.upgrade || claimed.upgrade}
                              className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-bold transition-all border shadow-sm",
                                claimed.upgrade
                                  ? "bg-gray-100 text-gray-400 border-gray-200"
                                  : "bg-white text-[#202223] border-[#c9cccf] hover:bg-[#f6f6f7] hover:border-[#9c9ea1]",
                              )}
                            >
                              {claimed.upgrade ? "已領取" : "領取禮物"}
                            </button>
                          ) : (
                            <span className="text-xs text-[#6d7175]">—</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between border-b border-[#ebebeb] pb-3">
                          <div>
                            <p className="text-sm font-medium text-[#202223]">
                              生日禮
                            </p>
                            <p className="text-xs font-bold text-rose-600">
                              {membership?.birthdayCredit ?? 0} 元
                            </p>
                          </div>
                          {customer?.birthday && membership?.birthdayCredit ? (
                            isCurrentMonthBirthday ? (
                              <button
                                onClick={() => handleClaim("birthday")}
                                disabled={
                                  claimLoading.birthday || claimed.birthday
                                }
                                className={cn(
                                  "px-3 py-1.5 rounded-md text-xs font-bold transition-all border shadow-sm",
                                  claimed.birthday
                                    ? "bg-gray-100 text-gray-400 border-gray-200"
                                    : "bg-white text-[#202223] border-[#c9cccf] hover:bg-[#f6f6f7] hover:border-[#9c9ea1]",
                                )}
                              >
                                {claimed.birthday ? "已領取" : "領取好禮"}
                              </button>
                            ) : (
                              <span className="text-[10px] bg-[#f9fafb] border border-[#e1e3e5] text-[#6d7175] px-2 py-1 rounded">
                                限 {getBirthMonthLabel(customer.birthday)} 領取
                              </span>
                            )
                          ) : null}
                        </div>

                        {claimMessage && (
                          <div
                            className={cn(
                              "p-3 rounded-md border text-sm animate-in fade-in slide-in-from-top-1",
                              claimStatus === "success"
                                ? "bg-[#cbe5cc]/30 border-[#1c5c27]/20 text-[#1c5c27]"
                                : "bg-rose-50 border-rose-200 text-rose-700",
                            )}
                          >
                            <p className="font-bold">{claimMessage}</p>
                            {claimedCode && (
                              <p className="text-xs mt-1 font-mono bg-white/50 px-1.5 py-0.5 rounded border border-current w-fit">
                                折扣碼: {claimedCode}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-[#202223]">
                              可用優惠券
                            </span>
                            <button
                              onClick={loadAvailableCoupons}
                              className="text-xs text-[#2c6ecb] hover:underline"
                            >
                              刷新清單
                            </button>
                          </div>
                          {availableLoading ? (
                            <p className="text-xs text-[#6d7175]">讀取中...</p>
                          ) : filteredCoupons.length === 0 ? (
                            <p className="text-xs text-[#6d7175] bg-[#f9fafb] p-3 rounded-md border border-[#e1e3e5]">
                              找不到可用折扣碼
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {filteredCoupons.map((c) => (
                                <div
                                  key={c.code}
                                  className="border border-[#c9cccf] rounded-md p-3 flex justify-between items-center bg-[#f9fafb] hover:shadow-sm"
                                >
                                  <div>
                                    <span className="font-bold text-rose-600 text-sm">
                                      {formatMoneyNT(c.amount)}
                                    </span>
                                    <p className="text-[11px] text-[#6d7175] mt-0.5 font-medium">
                                      {isAmbassadorCoupon(c.code, c.kind)
                                        ? "推薦大使獎勵"
                                        : "新會員首購獎勵"}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() =>
                                      navigator.clipboard.writeText(c.code)
                                    }
                                    className="text-[#5c5f62] hover:text-[#008060] bg-white border border-[#c9cccf] p-1.5 rounded shadow-sm hover:border-[#008060]"
                                  >
                                    <Copy size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </ShellCard>
                  </div>
                </div>
              </>
            )}

            {activeTab === "admin" && (
              <div className="w-full">
                {!isAdmin && (
                  <ShellCard title="權限不足">
                    <p className="text-sm text-rose-600 bg-rose-50 p-4 rounded-md border border-rose-200">
                      權限不足或是後端尚未開放，目前僅可瀏覽這段錯誤訊息。
                      <br />
                      如果仍顯示此錯誤，請檢查您的{" "}
                      <code>/api/admin/customers</code> 是否正確驗證 JWT 權限。
                    </p>
                  </ShellCard>
                )}

                {isAdmin && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white border border-[#c9cccf] rounded-lg p-5 shadow-sm flex flex-col gap-1 hover:border-[#8c9196] transition-colors">
                        <span className="text-xs text-[#6d7175] font-medium uppercase tracking-wider">
                          總會員數
                        </span>
                        <span className="text-2xl font-bold text-[#202223]">
                          {totalMembers}
                        </span>
                      </div>
                      <div className="bg-white border border-[#c9cccf] rounded-lg p-5 shadow-sm flex flex-col gap-1 hover:border-[#8c9196] transition-colors">
                        <span className="text-xs text-[#6d7175] font-medium uppercase tracking-wider">
                          累計總營收
                        </span>
                        <span className="text-2xl font-bold text-[#202223]">
                          {formatNTD(totalRevenue)}
                        </span>
                      </div>
                      <div className="bg-white border border-[#c9cccf] rounded-lg p-5 shadow-sm flex flex-col gap-1 hover:border-[#8c9196] transition-colors">
                        <span className="text-xs text-[#6d7175] font-medium uppercase tracking-wider">
                          全站推薦註冊數
                        </span>
                        <span className="text-2xl font-bold text-amber-700">
                          {totalReferred}
                        </span>
                      </div>
                      <div className="bg-white border border-[#c9cccf] rounded-lg p-5 shadow-sm flex flex-col gap-1 hover:border-[#8c9196] transition-colors">
                        <span className="text-xs text-[#6d7175] font-medium uppercase tracking-wider">
                          全站推薦金支出
                        </span>
                        <span className="text-2xl font-bold text-amber-700">
                          {formatNTD(totalReferralEarned)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-[#c9cccf] rounded-lg shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-[#c9cccf] flex items-center justify-between bg-[#f9fafb]">
                        <h2 className="text-base font-semibold text-[#202223]">
                          會員列表與詳細分析
                        </h2>
                        <span className="text-xs font-medium text-[#6d7175] bg-[#e4e5e7] px-3 py-1.5 rounded-full">
                          顯示 {adminFiltered.length} / {adminData.length}{" "}
                          筆資料
                        </span>
                      </div>

                      <div className="p-5">
                        {adminLoading && (
                          <p className="text-sm text-[#6d7175] py-4 text-center">
                            載入中...
                          </p>
                        )}
                        {!adminLoading && adminError && (
                          <p className="text-sm text-rose-600 bg-rose-50 p-4 rounded-md border border-rose-200 shadow-sm">
                            <strong>請求拒絕</strong>：{adminError}
                          </p>
                        )}
                        {!adminLoading &&
                          !adminError &&
                          adminFiltered.length === 0 && (
                            <p className="text-sm text-[#6d7175] py-4 text-center border border-dashed border-[#c9cccf] rounded bg-[#f9fafb]">
                              找不到符合條件的會員。
                            </p>
                          )}

                        {!adminLoading &&
                          !adminError &&
                          adminFiltered.length > 0 && (
                            <div className="overflow-x-auto rounded-lg border border-[#c9cccf]">
                              <table className="min-w-full text-sm">
                                <thead className="bg-[#F58A9C] text-xs uppercase text-slate-50 border-b border-[#c9cccf]">
                                  <tr>
                                    <th className="px-5 py-4 text-left font-semibold tracking-wider">
                                      會員
                                    </th>
                                    <th className="px-5 py-4 text-left font-semibold tracking-wider">
                                      Email
                                    </th>
                                    <th className="px-5 py-4 text-left font-semibold tracking-wider">
                                      城市
                                    </th>
                                    <th className="px-5 py-4 text-right font-semibold tracking-wider">
                                      訂單數
                                    </th>
                                    <th className="px-5 py-4 text-right font-semibold tracking-wider">
                                      累計消費
                                    </th>
                                    <th className="px-5 py-4 text-right font-semibold tracking-wider">
                                      推薦註冊
                                    </th>
                                    <th className="px-5 py-4 text-right font-semibold tracking-wider">
                                      推薦金
                                    </th>
                                    <th className="px-5 py-4 text-center font-semibold tracking-wider">
                                      會員等級
                                    </th>
                                    <th className="px-5 py-4 text-center font-semibold tracking-wider">
                                      分析圖表
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#ebebeb]">
                                  {adminFiltered.map((c) => (
                                    <Fragment key={c.id}>
                                      <tr
                                        className="hover:bg-[#f9fafb] cursor-pointer transition-colors group"
                                        onClick={() =>
                                          toggleExpandAdminRow(c.id, c.email)
                                        }
                                      >
                                        <td className="px-5 py-4 align-middle">
                                          <div className="font-semibold text-[#2c6ecb] group-hover:underline">
                                            {c.name || "—"}
                                          </div>
                                          {c.username && (
                                            <div className="text-xs text-[#6d7175] mt-0.5">
                                              @{c.username}
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-5 py-4 align-middle text-slate-700">
                                          {c.email}
                                        </td>
                                        <td className="px-5 py-4 align-middle text-slate-700">
                                          {c.billingCountry || ""}{" "}
                                          {c.billingCity || ""}
                                        </td>
                                        <td className="px-5 py-4 align-middle text-right">
                                          {c.ordersCount}
                                        </td>
                                        <td className="px-5 py-4 align-middle text-right font-bold text-[#202223]">
                                          {formatNTD(c.totalSpent)}
                                        </td>
                                        <td className="px-5 py-4 align-middle text-right font-semibold text-amber-700">
                                          {c.referredCount || 0}
                                        </td>
                                        <td className="px-5 py-4 align-middle text-right font-semibold text-amber-700">
                                          {formatNTD(c.referralEarned || 0)}
                                        </td>
                                        <td className="px-5 py-4 align-middle text-center">
                                          <span
                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${c.tier.includes("VVIP") ? "bg-purple-100 text-purple-700 border border-purple-200 shadow-sm" : c.tier.includes("UVIP") ? "bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm" : c.tier.includes("金") ? "bg-amber-100 text-amber-700 border border-amber-200 shadow-sm" : c.tier.includes("銀") ? "bg-slate-100 text-slate-700 border border-slate-200 shadow-sm" : c.tier.includes("銅") ? "bg-orange-100 text-orange-700 border border-orange-200 shadow-sm" : "bg-slate-50 text-slate-400 border border-slate-200"}`}
                                          >
                                            {c.tier}
                                          </span>
                                        </td>
                                        <td className="px-5 py-4 align-middle text-center">
                                          <button
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded shadow-sm transition-colors ${expandedId === c.id ? "bg-[#1a1a1a] text-white border-black" : "bg-white text-[#202223] border-[#c9cccf] hover:bg-[#f6f6f7] hover:border-[#8c9196]"}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleExpandAdminRow(
                                                c.id,
                                                c.email,
                                              );
                                            }}
                                          >
                                            <BarChart2
                                              size={14}
                                              className={
                                                expandedId === c.id
                                                  ? "text-white"
                                                  : "text-[#008060]"
                                              }
                                            />
                                            {expandedId === c.id
                                              ? "收起"
                                              : "分析"}
                                          </button>
                                        </td>
                                      </tr>
                                      {expandedId === c.id && (
                                        <tr className="bg-slate-50/60">
                                          <td
                                            colSpan={9}
                                            className="p-6 whitespace-normal border-t border-[#c9cccf]"
                                          >
                                            <div className="bg-white border border-[#c9cccf] rounded-lg p-5 shadow-sm">
                                              <div className="font-bold text-[#202223] text-lg mb-2 flex items-center gap-2 border-b border-[#ebebeb] pb-3">
                                                <Users
                                                  size={20}
                                                  className="text-[#008060]"
                                                />
                                                {c.name || c.username}{" "}
                                                的圖表分析與訂單資料
                                              </div>
                                              <MemberAnalytics
                                                orders={expandedOrders}
                                                customer={c}
                                              />
                                              <div className="mt-8 border-t border-[#ebebeb] pt-6">
                                                <div className="font-bold text-[#202223] mb-4 text-base flex items-center gap-2">
                                                  <Package
                                                    size={18}
                                                    className="text-gray-500"
                                                  />
                                                  詳細訂單列表
                                                </div>
                                                {renderExpandedOrdersAdmin()}
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </Fragment>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {showBirthdayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-[#c9cccf] flex justify-between items-center bg-[#f9fafb]">
              <h3 className="text-base font-bold text-[#202223] flex items-center gap-2">
                專屬壽星好禮 🎁
              </h3>
              <button
                onClick={() => setShowBirthdayModal(false)}
                className="text-[#6d7175] hover:text-[#202223]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#202223] mb-2 font-bold">
                您尚未設定生日！
              </p>
              <p className="text-sm text-[#6d7175] mb-5 leading-relaxed">
                填寫生日，即可在生日當月領取專屬購物金。
                <br />
                <span className="text-rose-600 font-bold mt-1 inline-block">
                  * 生日設定後無法修改
                </span>
              </p>
              <input
                type="date"
                value={modalBirthdayInput}
                onChange={(e) => setModalBirthdayInput(e.target.value)}
                className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#008060] mb-6 font-medium text-[#202223]"
              />
              <div className="flex justify-end gap-3 pt-2 border-t border-[#ebebeb]">
                <button
                  onClick={() => setShowBirthdayModal(false)}
                  className="px-4 py-2 border border-[#c9cccf] bg-white rounded-md text-sm font-bold text-[#202223] hover:bg-[#f6f6f7] shadow-sm"
                >
                  稍後再說
                </button>
                <button
                  onClick={handleModalSubmit}
                  disabled={birthdayLoading || !modalBirthdayInput}
                  className="px-4 py-2 bg-[#008060] text-white rounded-md text-sm font-bold hover:bg-[#006e52] shadow-[0_1px_0_rgba(0,0,0,0.15)] disabled:opacity-50"
                >
                  確認送出
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
