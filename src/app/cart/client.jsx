// app/cart/client.jsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  Truck,
  CreditCard,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Crown,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/lib/cartStore";

// ✅ 內建輕量版：台灣縣市與鄉鎮區字典
const TW_CITIES = {
  基隆市: [
    "仁愛區",
    "信義區",
    "中正區",
    "中山區",
    "安樂區",
    "暖暖區",
    "七堵區",
  ],
  臺北市: [
    "中正區",
    "大同區",
    "中山區",
    "松山區",
    "大安區",
    "萬華區",
    "信義區",
    "士林區",
    "北投區",
    "內湖區",
    "南港區",
    "文山區",
  ],
  新北市: [
    "板橋區",
    "三重區",
    "中和區",
    "永和區",
    "新莊區",
    "新店區",
    "樹林區",
    "鶯歌區",
    "三峽區",
    "淡水區",
    "汐止區",
    "瑞芳區",
    "土城區",
    "蘆洲區",
    "五股區",
    "泰山區",
    "林口區",
    "深坑區",
    "石碇區",
    "坪林區",
    "三芝區",
    "石門區",
    "八里區",
    "平溪區",
    "雙溪區",
    "貢寮區",
    "金山區",
    "萬里區",
    "烏來區",
  ],
  桃園市: [
    "桃園區",
    "中壢區",
    "大溪區",
    "楊梅區",
    "蘆竹區",
    "大園區",
    "龜山區",
    "八德區",
    "平鎮區",
    "新屋區",
    "觀音區",
    "復興區",
  ],
  新竹市: ["東區", "北區", "香山區"],
  新竹縣: [
    "竹北市",
    "竹東鎮",
    "新埔鎮",
    "關西鎮",
    "湖口鄉",
    "新豐鄉",
    "芎林鄉",
    "橫山鄉",
    "北埔鄉",
    "寶山鄉",
    "五峰鄉",
    "尖石鄉",
    "峨眉鄉",
  ],
  苗栗縣: [
    "苗栗市",
    "苑裡鎮",
    "通霄鎮",
    "竹南鎮",
    "頭份市",
    "後龍鎮",
    "卓蘭鎮",
    "大湖鄉",
    "公館鄉",
    "銅鑼鄉",
    "南庄鄉",
    "頭屋鄉",
    "三義鄉",
    "西湖鄉",
    "造橋鄉",
    "三灣鄉",
    "獅潭鄉",
    "泰安鄉",
  ],
  臺中市: [
    "中區",
    "東區",
    "南區",
    "西區",
    "北區",
    "西屯區",
    "南屯區",
    "北屯區",
    "豐原區",
    "東勢區",
    "大甲區",
    "清水區",
    "沙鹿區",
    "梧棲區",
    "后里區",
    "神岡區",
    "潭子區",
    "大雅區",
    "新社區",
    "石岡區",
    "外埔區",
    "大安區",
    "烏日區",
    "大肚區",
    "龍井區",
    "霧峰區",
    "太平區",
    "大里區",
    "和平區",
  ],
  彰化縣: [
    "彰化市",
    "鹿港鎮",
    "和美鎮",
    "線西鄉",
    "伸港鄉",
    "福興鄉",
    "秀水鄉",
    "花壇鄉",
    "芬園鄉",
    "員林市",
    "大村鄉",
    "埔鹽鄉",
    "埔心鄉",
    "永靖鄉",
    "社頭鄉",
    "二水鄉",
    "田尾鄉",
    "埤頭鄉",
    "芳苑鄉",
    "二林鎮",
    "大城鄉",
    "竹塘鄉",
    "溪州鄉",
    "田中鎮",
    "北斗鎮",
    "溪湖鎮",
  ],
  南投縣: [
    "南投市",
    "埔里鎮",
    "草屯鎮",
    "竹山鎮",
    "集集鎮",
    "名間鄉",
    "鹿谷鄉",
    "中寮鄉",
    "魚池鄉",
    "國姓鄉",
    "水里鄉",
    "信義鄉",
    "仁愛鄉",
  ],
  雲林縣: [
    "斗六市",
    "斗南鎮",
    "虎尾鎮",
    "西螺鎮",
    "土庫鎮",
    "北港鎮",
    "古坑鄉",
    "大埤鄉",
    "莿桐鄉",
    "林內鄉",
    "二崙鄉",
    "崙背鄉",
    "麥寮鄉",
    "東勢鄉",
    "褒忠鄉",
    "臺西鄉",
    "元長鄉",
    "四湖鄉",
    "口湖鄉",
    "水林鄉",
  ],
  嘉義市: ["東區", "西區"],
  嘉義縣: [
    "太保市",
    "朴子市",
    "布袋鎮",
    "大林鎮",
    "民雄鄉",
    "溪口鄉",
    "新港鄉",
    "六腳鄉",
    "東石鄉",
    "義竹鄉",
    "鹿草鄉",
    "水上鄉",
    "中埔鄉",
    "竹崎鄉",
    "梅山鄉",
    "番路鄉",
    "大埔鄉",
    "阿里山鄉",
  ],
  臺南市: [
    "新營區",
    "鹽水區",
    "白河區",
    "柳營區",
    "後壁區",
    "東山區",
    "麻豆區",
    "下營區",
    "六甲區",
    "官田區",
    "大內區",
    "佳里區",
    "學甲區",
    "西港區",
    "七股區",
    "將軍區",
    "北門區",
    "新化區",
    "善化區",
    "新市區",
    "安定區",
    "山上區",
    "玉井區",
    "楠西區",
    "南化區",
    "左鎮區",
    "仁德區",
    "歸仁區",
    "關廟區",
    "龍崎區",
    "永康區",
    "東區",
    "南區",
    "北區",
    "安南區",
    "安平區",
    "中西區",
  ],
  高雄市: [
    "鹽埕區",
    "鼓山區",
    "左營區",
    "楠梓區",
    "三民區",
    "新興區",
    "前金區",
    "苓雅區",
    "前鎮區",
    "前鎮區",
    "旗津區",
    "小港區",
    "鳳山區",
    "林園區",
    "大寮區",
    "大樹區",
    "大社區",
    "仁武區",
    "鳥松區",
    "岡山區",
    "橋頭區",
    "燕巢區",
    "田寮區",
    "阿蓮區",
    "路竹區",
    "湖內區",
    "茄萣區",
    "永安區",
    "彌陀區",
    "梓官區",
    "旗山區",
    "美濃區",
    "六龜區",
    "甲仙區",
    "杉林區",
    "內門區",
    "茂林區",
    "桃源區",
    "那瑪夏區",
  ],
  屏東縣: [
    "屏東市",
    "潮州鎮",
    "東港鎮",
    "恆春鎮",
    "萬丹鄉",
    "長治鄉",
    "麟洛鄉",
    "九如鄉",
    "里港鄉",
    "鹽埔鄉",
    "高樹鄉",
    "萬巒鄉",
    "內埔鄉",
    "竹田鄉",
    "新埤鄉",
    "枋寮鄉",
    "新園鄉",
    "崁頂鄉",
    "林邊鄉",
    "南州鄉",
    "佳冬鄉",
    "琉球鄉",
    "車城鄉",
    "滿州鄉",
    "枋山鄉",
    "三地門鄉",
    "霧臺鄉",
    "瑪家鄉",
    "泰武鄉",
    "來義鄉",
    "春日鄉",
    "獅子鄉",
    "牡丹鄉",
  ],
  宜蘭縣: [
    "宜蘭市",
    "羅東鎮",
    "蘇澳鎮",
    "頭城鎮",
    "礁溪鄉",
    "壯圍鄉",
    "員山鄉",
    "冬山鄉",
    "五結鄉",
    "三星鄉",
    "大同鄉",
    "南澳鄉",
  ],
  花蓮縣: [
    "花蓮市",
    "鳳林鎮",
    "玉里鎮",
    "新城鄉",
    "吉安鄉",
    "壽豐鄉",
    "光復鄉",
    "豐濱鄉",
    "瑞穗鄉",
    "富里鄉",
    "秀林鄉",
    "萬榮鄉",
    "卓溪鄉",
  ],
  臺東縣: [
    "臺東市",
    "成功鎮",
    "關山鎮",
    "卑南鄉",
    "鹿野鄉",
    "池上鄉",
    "東河鄉",
    "長濱鄉",
    "太麻里鄉",
    "大武鄉",
    "綠島鄉",
    "海端鄉",
    "延平鄉",
    "金峰鄉",
    "達仁鄉",
    "蘭嶼鄉",
  ],
  澎湖縣: ["馬公市", "湖西鄉", "白沙鄉", "西嶼鄉", "望安鄉", "七美鄉"],
  金門縣: ["金城鎮", "金湖鎮", "金沙鎮", "金寧鄉", "烈嶼鄉", "烏坵鄉"],
  連江縣: ["南竿鄉", "北竿鄉", "莒光鄉", "東引鄉"],
};

const currency = (n) =>
  `NT$${(Math.round((Number(n) || 0) * 100) / 100).toLocaleString("zh-TW")}`;

// 會員折扣表
const TIER_DISCOUNTS = {
  U銅貴賓: 1,
  U銀貴賓: 0.98,
  U金貴賓: 0.95,
  UVIP貴賓: 0.9,
  UVVIP貴賓: 0.88,
};

// 工具函數
function isUpgradeCode(code) {
  return String(code || "")
    .toLowerCase()
    .startsWith("ufup-");
}
function isBirthdayCode(code) {
  return String(code || "")
    .toLowerCase()
    .startsWith("ufbd-");
}
function isReferralAmbCode(code) {
  return String(code || "")
    .toLowerCase()
    .startsWith("ufamb-");
}
function isReferralFriendCode(code) {
  return String(code || "")
    .toLowerCase()
    .startsWith("uffrd-");
}

function couponTitleByKindOrCode(c) {
  const code = String(c?.code || "");
  const kind = String(c?.kind || "").toLowerCase();
  const amount = Number(c?.amount) || 0;
  if (kind === "upgrade" || isUpgradeCode(code))
    return `升等禮金 - ${currency(amount)}`;
  if (kind === "birthday" || isBirthdayCode(code))
    return `專屬生日禮 - ${currency(amount)}`;
  if (kind === "ref_ambassador_200" || isReferralAmbCode(code))
    return `推薦回饋金 - ${currency(amount)}`;
  if (kind === "ref_friend_50" || isReferralFriendCode(code))
    return `新客註冊禮 - ${currency(amount)}`;
  return `專屬折扣碼 - ${currency(amount)}`;
}

// 核心計算邏輯
function calcPricing(
  items,
  { shippingBase = 80, freeShipThreshold = 1500 },
  couponDiscount = 0,
  tierDiscountRate = 1,
) {
  const subtotal = items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0),
    0,
  );
  let memberDiscountAmount = 0;
  if (tierDiscountRate < 1 && subtotal > 0)
    memberDiscountAmount = Math.round(subtotal * (1 - tierDiscountRate));

  const subtotalAfterMember = Math.max(0, subtotal - memberDiscountAmount);
  const safeCouponDiscount = Math.min(
    Math.max(Number(couponDiscount) || 0, 0),
    subtotalAfterMember,
  );
  const finalSubtotal = Math.max(0, subtotalAfterMember - safeCouponDiscount);
  // 如果小計大於等於免運門檻，或購物車為空，則運費為 0
  const shipping =
    finalSubtotal >= freeShipThreshold || finalSubtotal === 0
      ? 0
      : shippingBase;
  const total = finalSubtotal + shipping;
  const needForFreeShip = Math.max(0, freeShipThreshold - finalSubtotal);

  return {
    subtotal,
    memberDiscountAmount,
    couponDiscount: safeCouponDiscount,
    discountedSubtotal: finalSubtotal,
    shipping,
    total,
    needForFreeShip,
    freeShipThreshold,
  };
}

// UI Components
function Input({ label, error, ...props }) {
  return (
    <div className="w-full">
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        className={`w-full bg-white border ${
          error ? "border-red-500" : "border-gray-200"
        } rounded-lg px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#008060] outline-none ${
          props.readOnly
            ? "bg-gray-50 text-gray-500 cursor-not-allowed border-dashed" // 🌟 已經自帶漂亮的 ReadOnly 樣式
            : ""
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}

function Select({ label, error, options = [], value, onChange, placeholder }) {
  return (
    <div className="w-full">
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full bg-white border ${
          error ? "border-red-500" : "border-gray-200"
        } rounded-lg px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#008060] outline-none appearance-none`}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}

function CouponPicker({
  title = "可用折價券",
  subtitle,
  coupons,
  applied,
  onApply,
  onClear,
  loading,
  emptyText = "目前沒有可用折價券",
}) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-black text-gray-900 tracking-wide">
            {title}
          </div>
          {subtitle && (
            <div className="text-[11px] text-gray-400 mt-0.5">{subtitle}</div>
          )}
        </div>
        {applied ? (
          <button
            type="button"
            className="text-xs font-black text-gray-500 underline underline-offset-4 hover:text-gray-900"
            onClick={onClear}
          >
            取消套用
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="text-xs text-gray-400 animate-pulse">讀取錢包中…</div>
      ) : coupons.length === 0 ? (
        <div className="text-xs text-gray-400 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
          {emptyText}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {coupons.map((c) => {
            const isActive =
              String(applied?.code || "").toLowerCase() ===
              String(c.code || "").toLowerCase();
            const amount = Number(c.amount) || 0;
            const kind = String(c.kind || "").toLowerCase();
            const code = String(c.code || "").toLowerCase();

            let theme = {
              bar: "bg-gray-800",
              text: "text-gray-800",
              light: "bg-gray-50",
              border: "border-gray-200",
              ring: "ring-gray-800",
              label: "專屬優惠",
            };
            if (kind === "upgrade" || code.startsWith("ufup-"))
              theme = {
                bar: "bg-amber-500",
                text: "text-amber-700",
                light: "bg-amber-50",
                border: "border-amber-200",
                ring: "ring-amber-500",
                label: "升等禮金",
              };
            else if (kind === "birthday" || code.startsWith("ufbd-"))
              theme = {
                bar: "bg-rose-500",
                text: "text-rose-700",
                light: "bg-rose-50",
                border: "border-rose-200",
                ring: "ring-rose-500",
                label: "專屬生日禮",
              };
            else if (
              kind.includes("ref") ||
              code.startsWith("ufamb-") ||
              code.startsWith("uffrd-")
            )
              theme = {
                bar: "bg-[#008060]",
                text: "text-[#008060]",
                light: "bg-emerald-50",
                border: "border-emerald-200",
                ring: "ring-[#008060]",
                label: "購物抵用金",
              };

            return (
              <button
                key={c.code}
                type="button"
                onClick={() => onApply(c)}
                className={`relative w-full flex items-stretch rounded-xl border transition-all overflow-hidden text-left bg-white ${isActive ? `ring-2 ${theme.ring} border-transparent shadow-md scale-[0.98]` : "border-gray-200 hover:shadow-md hover:border-gray-300"}`}
              >
                <div className={`w-3 flex-shrink-0 ${theme.bar}`}></div>
                <div className="flex-1 min-w-0 p-3.5 py-4">
                  <div
                    className={`text-[11px] font-bold ${theme.text} mb-1 tracking-wider truncate`}
                  >
                    {theme.label}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1.5">
                    <span className="text-sm font-bold text-gray-900">NT$</span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight truncate">
                      {amount}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase truncate w-full">
                    {c.code}
                  </div>
                </div>
                <div
                  className={`w-[76px] border-l-[1.5px] border-dashed ${theme.border} ${theme.light} flex flex-col items-center justify-center gap-1 shrink-0 px-2 py-3`}
                >
                  {isActive ? (
                    <>
                      <CheckCircle2 className={`w-5 h-5 ${theme.text}`} />
                      <span className={`text-[11px] font-black ${theme.text}`}>
                        已套用
                      </span>
                    </>
                  ) : (
                    <span className="text-[13px] font-bold text-gray-400 hover:text-gray-700 transition-colors text-center leading-tight">
                      點擊
                      <br />
                      使用
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {applied ? (
        <div className="mt-3 text-[11px] text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 flex justify-between items-center">
          <span>
            已套用：
            <span className="font-bold text-gray-900 uppercase">
              {applied.code}
            </span>
          </span>
          <span className="font-black text-emerald-600">
            - {currency(applied.amount)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function UpgradeBanner({ membership }) {
  if (!membership?.nextTierName || !membership?.nextNeedAmount) return null;
  return (
    <div className="bg-gradient-to-r from-[#fef9c3] to-[#fffbeb] border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl mb-6 flex items-start gap-3 shadow-sm">
      <Crown className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
      <div className="text-sm">
        <p className="font-bold">
          再消費{" "}
          <span className="text-red-600 font-black">
            {currency(membership.nextNeedAmount)}
          </span>{" "}
          即可升等為{" "}
          <span className="text-black font-black">
            {membership.nextTierName}
          </span>
          ！
        </p>
        <p className="text-xs mt-1 opacity-80">
          升等後將享有專屬折扣與更多禮遇。
        </p>
      </div>
    </div>
  );
}

function FreeShippingProgress({ needForFreeShip, freeShipThreshold }) {
  const percentage = Math.min(
    100,
    Math.max(
      0,
      ((freeShipThreshold - needForFreeShip) / freeShipThreshold) * 100,
    ),
  );
  const isFree = needForFreeShip === 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex justify-between items-end mb-2">
        <div className="text-sm font-bold text-gray-800">
          {isFree ? (
            <span className="text-[#008060] flex items-center gap-1">
              <CheckCircle2 size={16} /> 已達免運門檻！
            </span>
          ) : (
            <span>
              再消費{" "}
              <span className="text-rose-600 font-black">
                {currency(needForFreeShip)}
              </span>{" "}
              即可享全館免運
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          滿 {currency(freeShipThreshold)} 免運
        </div>
      </div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${isFree ? "bg-[#008060]" : "bg-rose-500"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ✅ Cart Step 1
function CartStep({
  items,
  onUpdateQty,
  onRemove,
  onNext,
  pricing,
  coupons,
  couponLoading,
  referralCoupons,
  referralLoading,
  appliedCoupon,
  onApplyCoupon,
  onClearCoupon,
  membership,
}) {
  if (items.length === 0) {
    return (
      <div className="py-32 text-center flex flex-col items-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-medium text-gray-900">您的購物車是空的</h2>
        <a
          href="/"
          className="mt-6 text-sm font-bold underline underline-offset-4"
        >
          繼續購物
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-12 gap-12">
      <div className="lg:col-span-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          購物車 ({items.length})
        </h1>
        <FreeShippingProgress
          needForFreeShip={pricing.needForFreeShip}
          freeShipThreshold={pricing.freeShipThreshold}
        />
        <UpgradeBanner membership={membership} />

        <div className="space-y-6">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex gap-6 pb-6 border-b border-gray-100 group"
            >
              <div className="w-24 h-32 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                <img
                  src={it.image || it.img}
                  className="w-full h-full object-cover"
                  alt={it.name || it.title}
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 leading-tight pr-4">
                      {it.name || it.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => onRemove(it.id || it.wcProductId)}
                      className="text-gray-300 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  {it.options && (
                    <div className="mt-1 flex gap-2">
                      {Object.entries(it.options).map(
                        ([key, value]) =>
                          value && (
                            <span
                              key={key}
                              className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100"
                            >
                              {value}
                            </span>
                          ),
                      )}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    單價 {currency(it.price)}
                  </p>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <button
                      type="button"
                      className="px-3 py-2 hover:bg-gray-50 transition"
                      onClick={() =>
                        onUpdateQty(it.id || it.wcProductId, it.qty - 1)
                      }
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold">
                      {it.qty}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-2 hover:bg-gray-50 transition"
                      onClick={() =>
                        onUpdateQty(it.id || it.wcProductId, it.qty + 1)
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-black text-lg">
                    {currency(it.price * it.qty)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="lg:col-span-4">
        <div className="bg-gray-50 rounded-3xl p-8 sticky top-24 border border-gray-100">
          {membership?.tierName && (
            <div className="mb-6 flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-black" />
                <span className="text-sm font-bold">{membership.tierName}</span>
              </div>
              {membership.discountLabel && (
                <span className="text-[10px] bg-black text-white px-2 py-1 rounded-full font-bold">
                  {membership.discountLabel}
                </span>
              )}
            </div>
          )}

          <CouponPicker
            title="可用折價券"
            subtitle="點擊即可套用折扣"
            coupons={[...coupons, ...referralCoupons]}
            applied={appliedCoupon}
            onApply={onApplyCoupon}
            onClear={onClearCoupon}
            loading={couponLoading || referralLoading}
          />

          <h2 className="text-lg font-bold mb-6 pt-4 border-t border-gray-200">
            訂單小計
          </h2>
          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>商品總計</span>
              <span>{currency(pricing.subtotal)}</span>
            </div>
            {pricing.memberDiscountAmount > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>{membership?.tierName} 優惠</span>
                <span className="font-black text-black">
                  - {currency(pricing.memberDiscountAmount)}
                </span>
              </div>
            )}
            {pricing.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span className="font-bold">優惠券折抵</span>
                <span className="font-black">
                  - {currency(pricing.couponDiscount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>預估運費</span>
              <span className="text-xs uppercase font-bold text-gray-400">
                結帳時計算
              </span>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4 mb-8">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-lg">總計</span>
              <span className="font-black text-2xl">
                {currency(pricing.total)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onNext}
            className="w-full py-4 bg-[#008060] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#006e52] transition active:scale-95 shadow-xl shadow-emerald-900/20"
          >
            前往結帳 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </div>
  );
}

// ✅ Cart Step 2 (Checkout)
function CheckoutStep({
  items,
  pricing,
  contact,
  setContact,
  addr,
  setAddr,
  shipMethod,
  setShipMethod,
  payMethod,
  setPayMethod,
  onPrev,
  onClearCart,
  coupons,
  couponLoading,
  referralCoupons,
  referralLoading,
  appliedCoupon,
  onApplyCoupon,
  onClearCoupon,
  membership,
  isLoggedIn, // 🌟 接收是否登入的狀態
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // 🚨 【護城河 1】：前往地圖前，強制手動儲存至 sessionStorage
  const saveStateBeforeMap = () => {
    sessionStorage.setItem("checkout_contact", JSON.stringify(contact));
    sessionStorage.setItem("checkout_addr", JSON.stringify(addr));
    sessionStorage.setItem("checkout_shipMethod", shipMethod);
    sessionStorage.setItem("checkout_payMethod", payMethod);
    sessionStorage.setItem("checkout_step", "2");
    sessionStorage.setItem("checkout_items", JSON.stringify(items));
  };

  const openEzShipMap = () => {
    saveStateBeforeMap();
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://map.ezship.com.tw/ezship_map_web.jsp";
    const params = {
      su_id: "uflow_service",
      processID: `UFLOW${Date.now()}`,
      rtURL: `${window.location.origin}/api/logistics/ezship-callback`,
    };
    Object.entries(params).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  const openEcpay711Map = () => {
    saveStateBeforeMap();
    const merchantID = process.env.NEXT_PUBLIC_ECPAY_MERCHANT_ID;
    if (!merchantID) return alert("錯誤：讀取不到 ECPAY_MERCHANT_ID");
    const isTest = merchantID === "2000132" || merchantID === "2000933";
    const actionUrl = isTest
      ? "https://logistics-stage.ecpay.com.tw/Express/map"
      : "https://logistics.ecpay.com.tw/Express/map";
    const form = document.createElement("form");
    form.method = "POST";
    form.action = actionUrl;
    const params = {
      MerchantID: merchantID,
      LogisticsSubType: "UNIMARTC2C",
      MerchantTradeNo: `UFLOW${Date.now()}`,
      LogisticsType: "CVS",
      IsCollection: "N",
      ServerReplyURL: `${window.location.origin}/api/logistics/ecpay-callback`,
    };
    Object.entries(params).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  const validate = () => {
    const e = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contact.email || !emailRegex.test(contact.email.trim()))
      e.email = "請輸入有效的電子郵件格式";

    if (!addr.lastName || !addr.lastName.trim()) e.lastName = "請填寫姓氏";
    if (!addr.firstName || !addr.firstName.trim()) e.firstName = "請填寫名字";

    const phoneRegex = /^09\d{8}$/;
    if (!addr.phone || !phoneRegex.test(addr.phone.trim())) {
      e.phone = "請輸入有效的台灣手機號碼 (09開頭共10碼)";
    }

    if (shipMethod === "000") {
      if (!addr.city) e.city = "請選擇縣市";
      if (!addr.district) e.district = "請選擇區域";
      if (!addr.street || !addr.street.trim())
        e.street = "請填寫街道門牌等詳細地址";
    } else {
      if (!addr.storeId) e.store = "請選擇配送門市";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setIsSubmitting(true);

    const line1 =
      shipMethod === "000"
        ? `${addr.city}${addr.district}${addr.street.trim()}`
        : `${addr.storeName} (${addr.storeId}) - ${addr.storeAddr}`;

    const payload = {
      // 🚀 關鍵防護：確保 wcProductId 絕對有值
      items: items.map((it) => ({
        wcProductId: it.wcProductId || it.id,
        qty: it.qty,
        price: it.price,
        title: it.name || it.title,
      })),
      contact: { email: contact.email.trim() },
      addr: {
        firstName: addr.firstName.trim(),
        lastName: addr.lastName.trim(),
        line1: line1,
        phone: addr.phone.trim(),
        storeId: addr.storeId,
        storeName: addr.storeName,
        storeAddr: addr.storeAddr,
      },
      shipMethod,
      payMethod,
      coupon: appliedCoupon
        ? { code: appliedCoupon.code, amount: appliedCoupon.amount }
        : null,
      total: pricing.total,
      memberDiscount: pricing.memberDiscountAmount,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.message || "建立訂單失敗");
        setIsSubmitting(false);
        return;
      }
      onClearCart();
      sessionStorage.removeItem("checkout_contact");
      sessionStorage.removeItem("checkout_addr");
      sessionStorage.removeItem("checkout_shipMethod");
      sessionStorage.removeItem("checkout_payMethod");
      sessionStorage.removeItem("checkout_step");
      sessionStorage.removeItem("checkout_items");

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      if (data.html) {
        const div = document.createElement("div");
        div.innerHTML = data.html;
        document.body.appendChild(div);
        document.getElementById("_form_ecpay")?.submit();
        return;
      }
      window.location.href = `/thank-you?orderId=${data.orderId}`;
    } catch (err) {
      setIsSubmitting(false);
      alert("連線失敗，請稍後再試");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
      <div className="flex-1 space-y-10">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-black/20">
              1
            </span>
            <h2 className="text-xl font-bold tracking-tight">聯絡資訊</h2>
          </div>
          {/* 🌟 修改點：判斷如果登入，就鎖住並唯讀 */}
          <Input
            label="電子郵件 (作為訂單通知使用)"
            required
            type="email"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            error={errors.email}
            placeholder="請輸入訂單通知信箱"
            readOnly={isLoggedIn} // ✅ 若已登入則鎖定不可修改
          />
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-black/20">
              2
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              運送方式與收件資料
            </h2>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2 text-blue-800">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold mb-1">物流與配送規則：</p>
                <ul className="list-disc pl-4 space-y-1 opacity-90">
                  <li>
                    全館消費滿{" "}
                    <strong className="text-red-500">NT$1,500</strong>{" "}
                    享免運費。
                  </li>
                  <li>現貨商品依訂單順序於 2-3 日內出貨（遇假日順延）。</li>
                  <li>
                    宅配預計出貨後 2-4 個工作日配達；超取需視門市狀況調整。
                  </li>
                  <li>
                    離島地區（澎湖、金門、馬祖、綠島）請選擇「超商取貨」。
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            <button
              type="button"
              onClick={() => {
                setShipMethod("000");
                setAddr({ ...addr, storeId: "", storeName: "" });
              }}
              className={`flex flex-col justify-between p-4 border-2 rounded-2xl text-left transition-all hover:border-[#008060] min-h-[100px] ${shipMethod === "000" ? "border-[#008060] bg-emerald-50 shadow-inner" : "border-gray-100"}`}
            >
              <div>
                <Truck className="mb-2 w-5 h-5 text-gray-600" />
                <span className="font-bold text-sm block mb-1">宅配速送</span>
                <span className="text-[10px] text-gray-500 block">
                  新竹物流
                </span>
              </div>
              <span
                className={`text-xs font-bold ${pricing.discountedSubtotal >= pricing.freeShipThreshold ? "text-[#008060]" : "text-gray-600"}`}
              >
                {pricing.discountedSubtotal >= pricing.freeShipThreshold
                  ? "免運費"
                  : "運費 NT$105"}
              </span>
            </button>

            <button
              type="button"
              onClick={openEzShipMap}
              className={`flex flex-col justify-between p-4 border-2 rounded-2xl text-left transition-all hover:border-[#008060] min-h-[100px] ${shipMethod === "CVS" ? "border-[#008060] bg-emerald-50 shadow-inner" : "border-gray-100"}`}
            >
              <div>
                <MapPin className="mb-2 w-5 h-5 text-green-600" />
                <span className="font-bold text-sm block mb-1">
                  全家 / 萊爾富 / OK
                </span>
                <span className="text-[10px] text-gray-500 block">
                  點擊選擇門市
                </span>
              </div>
              <span
                className={`text-xs font-bold ${pricing.discountedSubtotal >= pricing.freeShipThreshold ? "text-[#008060]" : "text-gray-600"}`}
              >
                {pricing.discountedSubtotal >= pricing.freeShipThreshold
                  ? "免運費"
                  : "免運費"}
              </span>
            </button>

            <button
              type="button"
              onClick={openEcpay711Map}
              className={`flex flex-col justify-between p-4 border-2 rounded-2xl text-left transition-all hover:border-[#008060] min-h-[100px] ${shipMethod === "711" ? "border-[#008060] bg-emerald-50 shadow-inner" : "border-gray-100"}`}
            >
              <div>
                <MapPin className="mb-2 w-5 h-5 text-red-600" />
                <span className="font-bold text-sm block mb-1">7-11</span>
                <span className="text-[10px] text-gray-500 block">
                  點擊選擇門市
                </span>
              </div>
              <span
                className={`text-xs font-bold ${pricing.discountedSubtotal >= pricing.freeShipThreshold ? "text-[#008060]" : "text-gray-600"}`}
              >
                {pricing.discountedSubtotal >= pricing.freeShipThreshold
                  ? "免運費"
                  : "免運費"}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4  p-6  ">
            <div className="col-span-2 mb-2 border-b-1 border-gray-200 pb-3 font-bold text-gray-800">
              填寫收件資訊
            </div>
            <Input
              label="姓氏"
              required
              value={addr.lastName}
              onChange={(e) => setAddr({ ...addr, lastName: e.target.value })}
              error={errors.lastName}
              placeholder="例: 王"
            />
            <Input
              label="名字"
              required
              value={addr.firstName}
              onChange={(e) => setAddr({ ...addr, firstName: e.target.value })}
              error={errors.firstName}
              placeholder="例: 小明"
            />
            <div className="col-span-2">
              <Input
                label="連絡電話"
                required
                maxLength={10}
                value={addr.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setAddr({ ...addr, phone: val });
                }}
                error={errors.phone}
                placeholder="例: 0912345678"
              />
            </div>

            {shipMethod === "000" ? (
              <>
                <div className="col-span-1">
                  <Select
                    label="縣市"
                    placeholder="選擇縣市"
                    value={addr.city}
                    options={Object.keys(TW_CITIES)}
                    onChange={(e) => {
                      setAddr({ ...addr, city: e.target.value, district: "" });
                    }}
                    error={errors.city}
                  />
                </div>
                <div className="col-span-1">
                  <Select
                    label="鄉鎮市區"
                    placeholder="選擇區域"
                    value={addr.district}
                    options={addr.city ? TW_CITIES[addr.city] : []}
                    onChange={(e) =>
                      setAddr({ ...addr, district: e.target.value })
                    }
                    error={errors.district}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label="詳細地址"
                    required
                    value={addr.street}
                    onChange={(e) =>
                      setAddr({ ...addr, street: e.target.value })
                    }
                    error={errors.street}
                    placeholder="例: 信義路一段1號5樓"
                  />
                </div>
              </>
            ) : (
              <div className="col-span-2">
                <Input
                  label="已選擇門市"
                  required
                  readOnly
                  value={
                    addr.storeName
                      ? `${addr.storeName} (${addr.storeId}) - ${addr.storeAddr}`
                      : ""
                  }
                  error={errors.store}
                  placeholder="請點擊上方物流按鈕選擇門市"
                />
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-black/20">
              3
            </span>
            <h2 className="text-xl font-bold tracking-tight">付款方式</h2>
          </div>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => setPayMethod("card")}
              className={`flex items-center gap-4 p-4 border-2 rounded-2xl text-left transition-all hover:border-[#008060] ${payMethod === "card" ? "border-[#008060] bg-emerald-50 shadow-inner" : "border-gray-100"}`}
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm shrink-0">
                <CreditCard
                  className={`w-5 h-5 ${payMethod === "card" ? "text-[#008060]" : "text-gray-500"}`}
                />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-900">綠界整合金流</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  信用卡 / Apple Pay / ATM / 超商代碼
                </p>
              </div>
              {payMethod === "card" && (
                <CheckCircle2 className="text-[#008060] w-5 h-5 shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setPayMethod("linepay")}
              className={`flex items-center gap-4 p-4 border-2 rounded-2xl text-left transition-all hover:border-[#008060] ${payMethod === "linepay" ? "border-[#008060] bg-emerald-50 shadow-inner" : "border-gray-100"}`}
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm shrink-0 p-1">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2a/LINE_logo.svg"
                  alt="LINE Pay"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-900">LINE Pay</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  透過綠界安全跳轉 LINE Pay
                </p>
              </div>
              {payMethod === "linepay" && (
                <CheckCircle2 className="text-[#008060] w-5 h-5 shrink-0" />
              )}
            </button>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-100">
          <button
            type="button"
            onClick={onPrev}
            className="text-sm font-bold flex items-center gap-2 text-gray-400 hover:text-black transition group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
            返回購物車
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-12 py-4 bg-[#008060] text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-emerald-900/20 hover:bg-[#006e52] transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting
              ? payMethod === "linepay"
                ? "連線至 LINE Pay..."
                : "安全連線中..."
              : "確認付款並下單"}
          </button>
        </div>
      </div>

      <aside className="w-full lg:w-[380px]">
        <div className="bg-slate-50 border border-gray-100 rounded-3xl p-6 shadow-sm lg:sticky lg:top-24">
          <CouponPicker
            title="可用折價券"
            subtitle="點擊即可套用折扣"
            coupons={[...coupons, ...referralCoupons]}
            applied={appliedCoupon}
            onApply={onApplyCoupon}
            onClear={onClearCoupon}
            loading={couponLoading || referralLoading}
          />
          <h3 className="font-bold mb-6 flex items-center gap-2 pt-4 border-t border-gray-200">
            訂單明細{" "}
            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </h3>
          <div className="max-h-[300px] overflow-y-auto mb-6 pr-2 space-y-4">
            {items.map((it) => (
              <div key={it.id} className="flex gap-4">
                <div className="w-14 h-14 bg-gray-50 rounded-xl border border-gray-100 flex-shrink-0 relative overflow-hidden">
                  <img
                    src={it.image || it.img}
                    className="w-full h-full object-cover"
                    alt={it.name || it.title}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate text-gray-800">
                    {it.name || it.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {currency(it.price * it.qty)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t border-gray-50 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>小計</span>
              <span>{currency(pricing.subtotal)}</span>
            </div>
            {pricing.memberDiscountAmount > 0 && (
              <div className="flex justify-between text-gray-400">
                <span>{membership?.tierName} 優惠</span>
                <span className="font-black text-black">
                  - {currency(pricing.memberDiscountAmount)}
                </span>
              </div>
            )}
            {pricing.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span className="font-bold">優惠券折抵</span>
                <span className="font-black">
                  - {currency(pricing.couponDiscount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>運費</span>
              <span>
                {pricing.shipping === 0 ? (
                  <span className="text-[#008060] font-bold">免運</span>
                ) : (
                  currency(pricing.shipping)
                )}
              </span>
            </div>
            <div className="flex justify-between text-base font-black pt-3 border-t border-gray-100 mt-2">
              <span>總金額</span>
              <span className="text-2xl">{currency(pricing.total)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ✅ Main Cart Content
function CartContent() {
  const searchParams = useSearchParams();
  const storeItems = useCartStore((state) => state.items);
  const storeUpdateQty = useCartStore((state) => state.updateQty);
  const storeRemoveItem = useCartStore((state) => state.removeItem);
  const storeClearCart = useCartStore((state) => state.clearCart);

  const [items, setItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [step, setStep] = useState(1);
  const [couponLoading, setCouponLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralCoupons, setReferralCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // 🌟 新增登入狀態
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [pricing, setPricing] = useState({
    subtotal: 0,
    memberDiscountAmount: 0,
    couponDiscount: 0,
    discountedSubtotal: 0,
    shipping: 0,
    total: 0,
    needForFreeShip: 1500,
    freeShipThreshold: 1500,
  });

  const [contact, setContact] = useState({ email: "" });
  const [addr, setAddr] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    district: "",
    street: "",
    storeId: "",
    storeName: "",
    storeAddr: "",
  });

  const [shipMethod, setShipMethod] = useState("000");
  const [payMethod, setPayMethod] = useState("card");
  const [membership, setMembership] = useState(null);
  const [discountRate, setDiscountRate] = useState(1);

  // 🚨 【護城河 2】：載入資料與 URL 判定完美融合
  useEffect(() => {
    // 優先處理跳轉回來的資料還原
    let _addr = { ...addr };
    let _contact = { ...contact };
    let _ship = "000";
    let _pay = "card";
    let _step = 1;
    let _items = [];

    try {
      const sAddr = sessionStorage.getItem("checkout_addr");
      if (sAddr) _addr = { ..._addr, ...JSON.parse(sAddr) };
      const sContact = sessionStorage.getItem("checkout_contact");
      if (sContact) _contact = { ..._contact, ...JSON.parse(sContact) };
      const sShip = sessionStorage.getItem("checkout_shipMethod");
      if (sShip) _ship = sShip;
      const sPay = sessionStorage.getItem("checkout_payMethod");
      if (sPay) _pay = sPay;
      const sStep = sessionStorage.getItem("checkout_step");
      if (sStep) _step = parseInt(sStep, 10);

      // ✅ 從 SessionStorage 撈回原本的商品清單
      const sItems = sessionStorage.getItem("checkout_items");
      if (sItems) {
        _items = JSON.parse(sItems);
      }
    } catch (e) {}

    // 如果 Zustand 有資料，就用 Zustand 的 (代表沒有刷新頁面)
    if (storeItems && storeItems.length > 0) {
      _items = storeItems;
    }

    // 檢查是否從地圖跳轉回來
    const sId = searchParams.get("storeId");
    const sName = searchParams.get("storeName");
    const sAddrUrl = searchParams.get("storeAddr");
    const prov = searchParams.get("provider");
    const urlStep = searchParams.get("step");

    if (sId && sName) {
      _ship = prov === "711" ? "711" : "CVS";
      _addr = {
        ..._addr,
        storeId: sId,
        storeName: sName,
        storeAddr: sAddrUrl || "",
      };
      _step = 2; // 強制進入第二步

      // 清理 URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("storeName");
      newUrl.searchParams.delete("storeId");
      newUrl.searchParams.delete("storeAddr");
      newUrl.searchParams.delete("provider");
      window.history.replaceState({}, "", newUrl.toString());
    } else if (urlStep) {
      _step = parseInt(urlStep, 10);
    }

    setContact(_contact);
    setAddr(_addr);
    setShipMethod(_ship);
    setPayMethod(_pay);
    setStep(_step);
    setItems(_items); // ✅ 設定被保留的商品清單

    const savedCoupon = sessionStorage.getItem("cart_coupon");
    if (savedCoupon) {
      try {
        const parsed = JSON.parse(savedCoupon);
        if (parsed?.code) setAppliedCoupon(parsed);
      } catch {}
    }

    setItemsLoaded(true);

    // 🌟 修正會員資料抓取，同步寫入 Email
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/account/profile");
        const data = await res.json();
        if (data.loggedIn) {
          setIsLoggedIn(true); // 標記為已登入

          if (data.customer?.email) {
            // 自動綁定信箱，並覆蓋掉任何從 sessionStorage 讀到的舊資料
            setContact((prev) => ({ ...prev, email: data.customer.email }));
          }

          if (data.membership) {
            setMembership(data.membership);
            setDiscountRate(TIER_DISCOUNTS[data.membership.tierName] || 1);
          }
        }
      } catch (e) {}
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🚨 當全域的 Zustand 真的有更新時（例如打開另一個分頁加了商品），才同步覆蓋本地
  useEffect(() => {
    if (itemsLoaded && storeItems && storeItems.length > 0) {
      setItems(storeItems);
    }
  }, [storeItems, itemsLoaded]);

  // 🚨 【護城河 3】：任何輸入狀態改變，立刻同步至 SessionStorage
  useEffect(() => {
    if (itemsLoaded) {
      sessionStorage.setItem("checkout_contact", JSON.stringify(contact));
      sessionStorage.setItem("checkout_addr", JSON.stringify(addr));
      sessionStorage.setItem("checkout_shipMethod", shipMethod);
      sessionStorage.setItem("checkout_payMethod", payMethod);
      sessionStorage.setItem("checkout_step", step.toString());
      sessionStorage.setItem("checkout_items", JSON.stringify(items)); // ✅ 商品變更也隨時存
    }
  }, [contact, addr, shipMethod, payMethod, step, items, itemsLoaded]);

  useEffect(() => {
    const loadAllCoupons = async () => {
      setCouponLoading(true);
      setReferralLoading(true);
      try {
        const res = await fetch("/api/account/coupons/available", {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json();
        const arr =
          res.ok && data?.ok && Array.isArray(data.available)
            ? data.available
            : [];
        const referral = [];
        const normal = [];
        arr.forEach((c) => {
          const code = String(c.code || "").toLowerCase();
          const kind = String(c.kind || "").toLowerCase();
          const item = {
            code: c.code,
            amount: Number(c.amount) || 0,
            kind: c.kind || "",
            title: couponTitleByKindOrCode(c),
          };
          if (
            code.startsWith("ufamb-") ||
            code.startsWith("uffrd-") ||
            kind === "ref_ambassador_200" ||
            kind === "ref_friend_50"
          ) {
            referral.push(item);
          } else {
            normal.push(item);
          }
        });
        setCoupons(normal);
        setReferralCoupons(referral);
        setAppliedCoupon((prev) => {
          if (!prev?.code) return null;
          const code = String(prev.code).toLowerCase();
          const isValid = [...normal, ...referral].some(
            (c) => String(c.code).toLowerCase() === code,
          );
          return isValid ? prev : null;
        });
      } catch (err) {
        setCoupons([]);
        setReferralCoupons([]);
      } finally {
        setCouponLoading(false);
        setReferralLoading(false);
      }
    };
    loadAllCoupons();
  }, []);

  useEffect(() => {
    if (!itemsLoaded) return;
    const discount = appliedCoupon?.amount || 0;
    // 🌟 修正運費判斷邏輯：宅配 105，超商 0
    const shippingBase = shipMethod === "000" ? 105 : 0;

    setPricing(
      calcPricing(
        items,
        { shippingBase, freeShipThreshold: 1500 },
        discount,
        discountRate,
      ),
    );
  }, [items, itemsLoaded, appliedCoupon, discountRate, shipMethod]);

  // ✅ 修正數量增減與移除，先更新 Local State，再更新 Store
  const updateQty = (id, newQty) => {
    if (newQty < 1) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === id || it.wcProductId === id ? { ...it, qty: newQty } : it,
      ),
    );
    if (typeof storeUpdateQty === "function") storeUpdateQty(id, newQty);
  };

  const removeItem = (id) => {
    setItems((prev) =>
      prev.filter((it) => it.id !== id && it.wcProductId !== id),
    );
    if (typeof storeRemoveItem === "function") storeRemoveItem(id);
  };

  const clearCart = () => {
    setItems([]);
    sessionStorage.removeItem("checkout_items");
    if (typeof storeClearCart === "function") storeClearCart();
  };

  const applyCoupon = (c) => {
    setAppliedCoupon(c);
    sessionStorage.setItem("cart_coupon", JSON.stringify(c));
  };
  const clearCoupon = () => {
    setAppliedCoupon(null);
    sessionStorage.removeItem("cart_coupon");
  };

  if (!itemsLoaded)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-[#008060] rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white pt-[80px] sm:pt-[150px]">
      <main>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CartStep
                items={items}
                pricing={pricing}
                coupons={coupons}
                couponLoading={couponLoading}
                referralCoupons={referralCoupons}
                referralLoading={referralLoading}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={applyCoupon}
                onClearCoupon={clearCoupon}
                onUpdateQty={updateQty}
                onRemove={removeItem}
                onNext={() => {
                  sessionStorage.setItem("checkout_step", "2");
                  setStep(2);
                }}
                membership={membership}
              />
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CheckoutStep
                items={items}
                pricing={pricing}
                coupons={coupons}
                couponLoading={couponLoading}
                referralCoupons={referralCoupons}
                referralLoading={referralLoading}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={applyCoupon}
                onClearCoupon={clearCoupon}
                contact={contact}
                setContact={setContact}
                addr={addr}
                setAddr={setAddr}
                shipMethod={shipMethod}
                setShipMethod={setShipMethod}
                payMethod={payMethod}
                setPayMethod={setPayMethod}
                onPrev={() => {
                  sessionStorage.setItem("checkout_step", "1");
                  setStep(1);
                }}
                onClearCart={clearCart}
                membership={membership}
                isLoggedIn={isLoggedIn} // 🌟 傳遞登入狀態給 CheckoutStep
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-[#008060] rounded-full animate-spin" />
        </div>
      }
    >
      <CartContent />
    </Suspense>
  );
}
