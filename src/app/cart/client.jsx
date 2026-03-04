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
} from "lucide-react";
import { useCartStore } from "@/lib/cartStore";

// ✅ 【除錯開關】
const DEBUG_MODE = true;

const log = (label, data) => {
  if (DEBUG_MODE) {
    console.log(
      `%c[Cart Debug] ${label}:`,
      "color: #0ea5e9; font-weight: bold;",
      data,
    );
  }
};

const currency = (n) =>
  `NT$${(Math.round((Number(n) || 0) * 100) / 100).toLocaleString("zh-TW")}`;

// ✅ 會員折扣表
const TIER_DISCOUNTS = {
  銅貴賓: 0.95,
  銀貴賓: 0.9,
  金貴賓: 0.88,
  "VIP 貴賓": 0.85,
  "VVIP 貴賓": 0.8,
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
    return `升等禮 - ${currency(amount)}`;
  if (kind === "birthday" || isBirthdayCode(code))
    return `生日禮金 - ${currency(amount)}`;
  if (kind === "ref_ambassador_200" || isReferralAmbCode(code))
    return `推薦折扣金 - ${currency(amount)}`;
  if (kind === "ref_friend_50" || isReferralFriendCode(code))
    return `推薦折扣金 - ${currency(amount)}`;
  return `${code.toUpperCase()} - ${currency(amount)}`;
}

// ✅ 判斷要顯示哪一張圖片的邏輯
function getCouponImage(c) {
  const code = String(c?.code || "");
  const kind = String(c?.kind || "").toLowerCase();

  if (kind === "upgrade" || isUpgradeCode(code))
    return "/images/折扣券/升等禮折扣.png";
  if (kind === "birthday" || isBirthdayCode(code))
    return "/images/折扣券/生日禮金折扣券.png";
  if (kind === "ref_ambassador_200" || isReferralAmbCode(code))
    return "/images/折扣券/推薦禮折扣200.png";
  if (kind === "ref_friend_50" || isReferralFriendCode(code))
    return "/images/折扣券/推薦禮折扣50.png";

  // 預設圖片 (若無對應則先放這張)
  return "/images/折扣券/推薦禮折扣50.png";
}

// ✅ 核心計算邏輯
function calcPricing(
  items,
  { shippingBase = 80, freeShipThreshold = 1800 },
  couponDiscount = 0,
  tierDiscountRate = 1, // 預設不打折
) {
  // 1. 商品小計
  const subtotal = items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0),
    0,
  );

  // 2. 計算會員折扣金額 (無條件捨去，避免小數點)
  let memberDiscountAmount = 0;
  if (tierDiscountRate < 1 && subtotal > 0) {
    memberDiscountAmount = Math.round(subtotal * (1 - tierDiscountRate));
  }

  // 3. 扣除會員折扣
  const subtotalAfterMember = Math.max(0, subtotal - memberDiscountAmount);

  // 4. 扣除優惠券
  const safeCouponDiscount = Math.min(
    Math.max(Number(couponDiscount) || 0, 0),
    subtotalAfterMember,
  );

  // 5. 最終商品金額
  const finalSubtotal = Math.max(0, subtotalAfterMember - safeCouponDiscount);

  // 6. 運費計算 (通常是用折抵後的金額判斷免運)
  const shipping =
    finalSubtotal >= freeShipThreshold || finalSubtotal === 0
      ? 0
      : shippingBase;

  const total = finalSubtotal + shipping;

  return {
    subtotal,
    memberDiscountAmount,
    couponDiscount: safeCouponDiscount,
    discountedSubtotal: finalSubtotal,
    shipping,
    total,
  };
}

// UI Components
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
        <div className="text-xs text-gray-400">讀取中…</div>
      ) : coupons.length === 0 ? (
        <div className="text-xs text-gray-400">{emptyText}</div>
      ) : (
        <div className="grid grid-cols-2  gap-3">
          {coupons.map((c) => {
            const isActive =
              String(applied?.code || "").toLowerCase() ===
              String(c.code || "").toLowerCase();
            const displayName = c.title || couponTitleByKindOrCode(c);
            const imgSrc = getCouponImage(c);

            return (
              <button
                key={c.code}
                type="button"
                className={`relative w-full text-left bg-transparent border-0 p-0 cursor-pointer transition-all duration-200 active:scale-[0.99] hover:drop-shadow-lg ${isActive ? "ring-2 ring-black rounded-lg scale-[0.995]" : ""}`}
                onClick={() => onApply(c)}
                title={displayName}
              >
                {/* 套用相對應的圖片 */}
                <img
                  src={imgSrc}
                  alt={displayName}
                  className="w-full h-auto object-contain rounded-lg block"
                />

                {isActive && (
                  <div className="absolute top-2 right-2 bg-black/20 text-white text-[11px] font-black px-2.5 py-1 rounded-full z-10 shadow-md">
                    APPLIED
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {applied ? (
        <div className="mt-3 text-xs text-gray-500">
          已套用：
          <span className="font-black text-gray-900">
            {" "}
            {applied.title || applied.code}
          </span>{" "}
          折抵{" "}
          <span className="font-black text-gray-900">
            {currency(applied.amount)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

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
        } rounded-lg px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-black/5 focus:border-black outline-none ${props.readOnly ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
      />
      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}

// ✅ 升等提示組件
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

        {/* ✅ 顯示升等提示 */}
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
                      onClick={() => onRemove(it.id)}
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
                      onClick={() => onUpdateQty(it.id, it.qty - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold">
                      {it.qty}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-2 hover:bg-gray-50 transition"
                      onClick={() => onUpdateQty(it.id, it.qty + 1)}
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
          {/* ✅ 會員等級 Badge */}
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
            subtitle="升等禮 / 生日禮金"
            coupons={coupons}
            applied={appliedCoupon}
            onApply={onApplyCoupon}
            onClear={onClearCoupon}
            loading={couponLoading}
          />
          <CouponPicker
            title="推薦折扣金"
            subtitle="推薦回饋 / 註冊購物金"
            coupons={referralCoupons}
            applied={appliedCoupon}
            onApply={onApplyCoupon}
            onClear={onClearCoupon}
            loading={referralLoading}
            emptyText="目前沒有可用推薦折扣金"
          />

          <h2 className="text-lg font-bold mb-6">訂單小計</h2>
          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>商品總計</span>
              <span>{currency(pricing.subtotal)}</span>
            </div>

            {/* ✅ 會員折扣顯示 */}
            {pricing.memberDiscountAmount > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>{membership?.tierName} 優惠</span>
                <span className="font-black text-black">
                  - {currency(pricing.memberDiscountAmount)}
                </span>
              </div>
            )}

            {pricing.couponDiscount > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>折價券</span>
                <span className="font-black text-black">
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
            {pricing.memberDiscountAmount > 0 || pricing.couponDiscount > 0 ? (
              <p className="mt-2 text-[11px] text-gray-400">
                已省下：
                {currency(
                  pricing.memberDiscountAmount + pricing.couponDiscount,
                )}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onNext}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition active:scale-95 shadow-xl shadow-black/10"
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
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const searchParams = useSearchParams();

  // (地圖 Callback 邏輯)
  useEffect(() => {
    const storeName = searchParams.get("storeName");
    const storeId = searchParams.get("storeId");
    const storeAddr = searchParams.get("storeAddr");
    const provider = searchParams.get("provider");
    if (storeId && storeName) {
      setShipMethod(provider === "711" ? "711" : "CVS");
      setAddr((prev) => ({
        ...prev,
        line1: `${storeName} (${storeId})`,
        storeId,
        storeName,
        storeAddr: storeAddr || "",
      }));
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("storeName");
      newUrl.searchParams.delete("storeId");
      newUrl.searchParams.delete("storeAddr");
      newUrl.searchParams.delete("provider");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams, setShipMethod, setAddr]);

  const openEzShipMap = () => {
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
    const merchantID = process.env.NEXT_PUBLIC_ECPAY_MERCHANT_ID;
    if (!merchantID) {
      alert("錯誤：讀取不到 NEXT_PUBLIC_ECPAY_MERCHANT_ID");
      return;
    }
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
    if (!contact.email || !contact.email.includes("@"))
      e.email = "請輸入有效的電子郵件";
    if (!addr.firstName) e.firstName = "必填";
    if (!addr.lastName) e.lastName = "必填";
    if (!addr.line1) e.line1 = "請選擇配送門市或填寫地址";
    if (!addr.phone || addr.phone.length < 9) e.phone = "請輸入正確手機號碼";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      items: items.map((it) => ({
        wcProductId: it.wcProductId,
        qty: it.qty,
        price: it.price,
        title: it.name || it.title,
      })),
      contact,
      addr,
      shipMethod,
      payMethod,
      coupon: appliedCoupon
        ? { code: appliedCoupon.code, amount: appliedCoupon.amount }
        : null,
      total: pricing.total,
      // ✅ 傳送會員折扣金額給後端 (若後端支援)
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
      if (data.html) {
        const div = document.createElement("div");
        div.innerHTML = data.html;
        document.body.appendChild(div);
        document.getElementById("_form_ecpay")?.submit();
        return;
      }
      window.location.href = `/thank-you?orderId=${data.orderId}`;
    } catch (err) {
      console.error(err);
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
          <Input
            label="電子郵件"
            required
            type="email"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            error={errors.email}
            placeholder="您的電子信箱"
          />
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-black/20">
              2
            </span>
            <h2 className="text-xl font-bold tracking-tight">運送方式</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            <button
              type="button"
              onClick={() => {
                setShipMethod("000");
                setAddr({ ...addr, line1: "", storeId: "", storeName: "" });
              }}
              className={`flex flex-col p-4 border-2 rounded-2xl text-left transition-all hover:border-black ${shipMethod === "000" ? "border-black bg-gray-50 shadow-inner" : "border-gray-100"}`}
            >
              <Truck className="mb-2 w-4 h-4 text-gray-400" />
              <span className="font-bold text-xs">宅配速送</span>
            </button>
            <button
              type="button"
              onClick={openEzShipMap}
              className={`flex flex-col p-4 border-2 rounded-2xl text-left transition-all hover:border-black ${shipMethod === "CVS" ? "border-black bg-gray-50 shadow-inner" : "border-gray-100"}`}
            >
              <MapPin className="mb-2 w-4 h-4 text-green-600" />
              <span className="font-bold text-xs">全家/萊爾富/OK</span>
            </button>
            <button
              type="button"
              onClick={openEcpay711Map}
              className={`flex flex-col p-4 border-2 rounded-2xl text-left transition-all hover:border-black ${shipMethod === "711" ? "border-black bg-gray-50 shadow-inner" : "border-gray-100"}`}
            >
              <MapPin className="mb-2 w-4 h-4 text-red-600" />
              <span className="font-bold text-xs">7-11 選擇門市</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="姓氏"
              required
              value={addr.lastName}
              onChange={(e) => setAddr({ ...addr, lastName: e.target.value })}
              error={errors.lastName}
            />
            <Input
              label="名字"
              required
              value={addr.firstName}
              onChange={(e) => setAddr({ ...addr, firstName: e.target.value })}
              error={errors.firstName}
            />
            <div className="col-span-2">
              <Input
                label={shipMethod === "000" ? "配送地址" : "已選擇之門市"}
                required
                readOnly={shipMethod === "CVS" || shipMethod === "711"}
                value={addr.line1}
                onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
                error={errors.line1}
                placeholder={
                  shipMethod === "000"
                    ? "請輸入完整街道路名與門牌"
                    : "請點選上方按鈕選擇門市"
                }
              />
            </div>
            <div className="col-span-2">
              <Input
                label="連絡電話"
                required
                value={addr.phone}
                onChange={(e) => setAddr({ ...addr, phone: e.target.value })}
                error={errors.phone}
              />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-black/20">
              3
            </span>
            <h2 className="text-xl font-bold tracking-tight">付款方式</h2>
          </div>
          <div className="p-6 border-2 border-black bg-gray-50 rounded-2xl flex items-center gap-4 shadow-inner">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">綠界科技 ECPay 安全支付</p>
              <p className="text-[11px] text-gray-500">
                支援信用卡、ATM、超商代碼
              </p>
            </div>
            <CheckCircle2 className="ml-auto text-black w-6 h-6" />
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
            className="w-full sm:w-auto px-12 py-4 bg-black text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-black/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "建立訂單中..." : "確認付款並下單"}
          </button>
        </div>
      </div>

      <aside className="w-full lg:w-[380px]">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm lg:sticky lg:top-24">
          <CouponPicker
            title="可用折價券"
            subtitle="升等禮 / 生日禮金"
            coupons={coupons}
            applied={appliedCoupon}
            onApply={onApplyCoupon}
            onClear={onClearCoupon}
            loading={couponLoading}
          />

          <h3 className="font-bold mb-6 flex items-center gap-2">
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

            {/* ✅ 會員折扣 */}
            {pricing.memberDiscountAmount > 0 && (
              <div className="flex justify-between text-gray-400">
                <span>{membership?.tierName} 優惠</span>
                <span className="font-black text-black">
                  - {currency(pricing.memberDiscountAmount)}
                </span>
              </div>
            )}

            {pricing.couponDiscount > 0 ? (
              <div className="flex justify-between text-gray-400">
                <span>折扣</span>
                <span className="font-black text-black">
                  - {currency(pricing.couponDiscount)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between text-gray-400">
              <span>運費</span>
              <span>
                {pricing.shipping === 0 ? "免運" : currency(pricing.shipping)}
              </span>
            </div>
            <div className="flex justify-between text-base font-black pt-3 border-t border-gray-100 mt-2">
              <span>總金額.</span>
              <span>{currency(pricing.total)}</span>
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
  const [pricing, setPricing] = useState({
    subtotal: 0,
    memberDiscountAmount: 0,
    couponDiscount: 0,
    discountedSubtotal: 0,
    shipping: 0,
    total: 0,
  });
  const [contact, setContact] = useState({ email: "" });
  const [addr, setAddr] = useState({
    firstName: "",
    lastName: "",
    line1: "",
    phone: "",
    storeId: "",
    storeName: "",
    storeAddr: "",
  });
  const [shipMethod, setShipMethod] = useState("000");
  const [payMethod, setPayMethod] = useState("card");

  // ✅ 新增：會員狀態
  const [membership, setMembership] = useState(null);
  const [discountRate, setDiscountRate] = useState(1);

  useEffect(() => {
    setItems(storeItems);

    // ✅ 強制讀取會員資料
    const fetchMembership = async () => {
      try {
        const res = await fetch("/api/account/profile");
        const data = await res.json();
        if (data.loggedIn && data.membership) {
          setMembership(data.membership);
          const rate = TIER_DISCOUNTS[data.membership.tierName] || 1;
          setDiscountRate(rate);
          // 如果有 Email 則自動填入
          if (data.customer?.email) {
            setContact((prev) => ({ ...prev, email: data.customer.email }));
          }
        }
      } catch (e) {
        console.error("Failed to fetch membership in cart", e);
      }
    };
    fetchMembership();

    // URL handling
    const sId = searchParams.get("storeId");
    const sName = searchParams.get("storeName");
    const sAddr = searchParams.get("storeAddr");
    const prov = searchParams.get("provider");
    const urlStep = searchParams.get("step");

    if (sId && sName) {
      setShipMethod(prov === "711" ? "711" : "CVS");
      setAddr((prev) => ({
        ...prev,
        line1: `${sName} (${sId})`,
        storeId: sId,
        storeName: sName,
        storeAddr: sAddr || "",
      }));
      setStep(2);
    } else {
      const savedAddr = sessionStorage.getItem("checkout_addr");
      if (savedAddr) {
        try {
          setAddr(JSON.parse(savedAddr));
        } catch {}
      }
      const savedShip = sessionStorage.getItem("checkout_shipMethod");
      if (savedShip) setShipMethod(savedShip);
      const savedStep = sessionStorage.getItem("checkout_step");
      if (urlStep) setStep(parseInt(urlStep, 10));
      else if (savedStep) setStep(parseInt(savedStep, 10));
    }

    const savedPay = sessionStorage.getItem("checkout_payMethod");
    if (savedPay) setPayMethod(savedPay);
    const savedCoupon = sessionStorage.getItem("cart_coupon");
    if (savedCoupon) {
      try {
        const parsed = JSON.parse(savedCoupon);
        if (parsed?.code) setAppliedCoupon(parsed);
      } catch {}
    }

    setItemsLoaded(true);
  }, [searchParams, storeItems]);

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
    // ✅ 將 discountRate 傳入計算
    setPricing(
      calcPricing(
        items,
        { shippingBase: 0, freeShipThreshold: 1800 },
        discount,
        discountRate,
      ),
    );
  }, [items, itemsLoaded, appliedCoupon, discountRate]);

  const updateQty = (id, newQty) => storeUpdateQty(id, newQty);
  const removeItem = (id) => storeRemoveItem(id);
  const clearCart = () => storeClearCart();
  const applyCoupon = (c) => setAppliedCoupon(c);
  const clearCoupon = () => setAppliedCoupon(null);

  if (!itemsLoaded)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b sticky top-0 bg-white/90 backdrop-blur-xl z-50">
        <div className="max-w-6xl mx-auto h-20 flex items-center justify-between px-6">
          <a href="/">
            <img src="/images/logo/logo-y.png" alt="Uflow" className="h-7" />
          </a>
          <div className="flex gap-10 items-center text-[10px] font-black tracking-[0.2em] text-gray-300 uppercase">
            <span
              className={
                step === 1
                  ? "text-black border-b-2 border-black pb-2"
                  : "hidden sm:block"
              }
            >
              01 購物清單
            </span>
            <span
              className={
                step === 2
                  ? "text-black border-b-2 border-black pb-2"
                  : "hidden sm:block"
              }
            >
              02 配送付款
            </span>
          </div>
        </div>
      </header>

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
                onNext={() => setStep(2)}
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
                onPrev={() => setStep(1)}
                onClearCart={clearCart}
                membership={membership}
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
        <div className="h-screen flex items-center justify-center font-black tracking-widest text-gray-200">
          UFLO
        </div>
      }
    >
      <CartContent />
    </Suspense>
  );
}
