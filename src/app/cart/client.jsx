"use client";

import React, { useState, useEffect, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  Truck,
  CreditCard,
  ShoppingBag,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  ExternalLink,
} from "lucide-react";

function makeBarsFromString(str, count = 28) {
  // 用字串轉出穩定的 pseudo-random bar pattern（不是真 EAN，但長得像條碼）
  const s = String(str || "");
  let seed = 0;
  for (let i = 0; i < s.length; i++) seed = (seed * 31 + s.charCodeAt(i)) >>> 0;

  const bars = [];
  for (let i = 0; i < count; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const w = seed % 3 === 0 ? 2 : 1; // 1 or 2
    const h = 34 + (seed % 10); // 34~43
    const gap = seed % 4 === 0 ? 2 : 1;
    bars.push({ w, h, gap });
  }
  return bars;
}

/* ================== 工具函數 ================== */
const currency = (n) =>
  `NT$${(Math.round((Number(n) || 0) * 100) / 100).toLocaleString("zh-TW")}`;

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

/**
 * 折價券：固定金額折抵
 * shipping 免運門檻：以「折扣後商品小計」計算（較符合常見電商規則）
 */
function calcPricing(
  items,
  { shippingBase = 80, freeShipThreshold = 1800 },
  discount = 0
) {
  const subtotal = items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0),
    0
  );
  const safeDiscount = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const discountedSubtotal = Math.max(0, subtotal - safeDiscount);

  const shipping =
    discountedSubtotal >= freeShipThreshold || discountedSubtotal === 0
      ? 0
      : shippingBase;

  const total = discountedSubtotal + shipping;

  return {
    subtotal,
    discount: safeDiscount,
    discountedSubtotal,
    shipping,
    total,
  };
}

/* ================== 折價券 UI（改成 CodePen 同款結構 + 內嵌 style） ================== */
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
  const fmtValid = (c) => {
    // 你若沒 expires，就固定顯示「TAP TO APPLY」比較像你目前 UI
    if (!c?.expires) return "TAP TO APPLY";
    try {
      const d = new Date(c.expires);
      return `VALID UNTIL ${d
        .toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
        .toUpperCase()}`;
    } catch {
      return "TAP TO APPLY";
    }
  };

  const toLeftText = (displayName) => {
    // displayName: "升等禮 - NT$100" -> 取左邊 "升等禮"
    const parts = String(displayName || "").split("-");
    return (parts[0] || "ENJOY YOUR GIFT").trim();
  };

  const toMainText = (c, displayName) => {
    // 主標：固定金額券 -> 用 NT$100 / NT$150
    const amt = Number(c?.amount) || 0;
    return amt ? `NT$${amt}` : (displayName || "").toUpperCase();
  };

  return (
    <div className="mb-6">
      {/* ✅ 內嵌樣式：只作用在這個 CouponPicker */}
      <style jsx>{`
        .cp-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .cp-title {
          font-size: 14px;
          font-weight: 900;
          color: #111;
          letter-spacing: 0.02em;
        }
        .cp-subtitle {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }
        .cp-clear {
          font-size: 12px;
          font-weight: 900;
          color: #6b7280;
          text-decoration: underline;
          text-underline-offset: 4px;
          background: transparent;
          border: 0;
          cursor: pointer;
        }
        .cp-clear:hover {
          color: #111;
        }

        .cp-grid {
          display: grid;
          gap: 12px;
        }

        /* ======= Coupon Ticket (CodePen-like) ======= */
        .couponBtn {
          border: 0;
          padding: 0;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }
        .coupon {
          width: 100%;
          height: 120px;
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          align-items: stretch;
          position: relative;
          text-transform: uppercase;
          filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.08));
        }

        /* 左右切口 */
        .coupon::before,
        .coupon::after {
          content: "";
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          z-index: -1;
        }
        .coupon::before {
          left: 0;
          background-image: radial-gradient(
            circle at 0 50%,
            transparent 22px,
            var(--coupon-left, #f7d25f) 23px
          );
        }
        .coupon::after {
          right: 0;
          background-image: radial-gradient(
            circle at 100% 50%,
            transparent 22px,
            var(--coupon-left, #f7d25f) 23px
          );
        }

        .coupon > div {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .left {
          width: 20%;
          background: var(--coupon-left, #f7d25f);
          border-right: 2px dashed rgba(0, 0, 0, 0.18);
          position: relative;
        }
        .left .leftText {
          transform: rotate(-90deg);
          white-space: nowrap;
          font-weight: 900;
          letter-spacing: 0.18em;
          font-size: 11px;
          color: rgba(0, 0, 0, 0.9);
        }

        .center {
          flex-grow: 1;
          background: var(--coupon-left, #f7d25f);
          text-align: center;
          padding: 10px 10px;
        }

        .mainLine {
          display: inline-block;
          background: #000;
          color: var(--coupon-left, #f7d25f);
          padding: 2px 12px;
          font-weight: 900;
          font-size: 22px;
          border-radius: 0;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .subLine {
          margin-top: 6px;
          font-weight: 900;
          font-size: 22px;
          letter-spacing: 0.04em;
          color: #000;
        }
        .smallLine {
          margin-top: 4px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: rgba(0, 0, 0, 0.7);
        }

        .right {
          width: 118px;
          background: #fff;
          position: relative;
        }

        .right::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            circle at 100% 50%,
            transparent 22px,
            #fff 23px
          );
          z-index: 0;
        }

        .barcodeWrap {
          position: relative;
          z-index: 1;
          transform: rotate(-90deg);
          display: flex;
          align-items: flex-end;
          gap: 2px;
        }

        .codeText {
          position: absolute;
          right: 10px;
          bottom: 10px;
          z-index: 2;
          transform: rotate(-90deg);
          transform-origin: right bottom;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.28em;
          color: rgba(0, 0, 0, 0.65);
          white-space: nowrap;
        }

        .appliedBadge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #000;
          color: #fff;
          font-size: 11px;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 999px;
          z-index: 5;
        }

        .couponBtn:active .coupon {
          transform: scale(0.995);
        }
        .couponBtn:hover .coupon {
          filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.1));
        }

        .coupon.isActive {
          outline: 2px solid #000;
          outline-offset: 2px;
        }
      `}</style>

      {/* Header */}
      <div className="cp-header">
        <div>
          <div className="cp-title">{title}</div>
          {subtitle ? <div className="cp-subtitle">{subtitle}</div> : null}
        </div>

        {applied ? (
          <button type="button" className="cp-clear" onClick={onClear}>
            取消套用
          </button>
        ) : null}
      </div>

      {/* Body */}
      {loading ? (
        <div className="text-xs text-gray-400">讀取中…</div>
      ) : coupons.length === 0 ? (
        <div className="text-xs text-gray-400">{emptyText}</div>
      ) : (
        <div className="cp-grid">
          {coupons.map((c) => {
            const isActive =
              String(applied?.code || "").toLowerCase() ===
              String(c.code || "").toLowerCase();

            const displayName = c.title || couponTitleByKindOrCode(c);
            const leftText = toLeftText(displayName);
            const mainText = toMainText(c, displayName);
            const validText = fmtValid(c);

            const bars = makeBarsFromString(c.code, 26);

            return (
              <button
                key={c.code}
                type="button"
                className="couponBtn"
                onClick={() => onApply(c)}
                title={displayName}
              >
                <div
                  className={`coupon ${isActive ? "isActive" : ""}`}
                  style={{ "--coupon-left": "#F7D25F" }}
                >
                  <div className="left">
                    <div className="leftText">{leftText}</div>
                  </div>

                  <div className="center">
                    <div>
                      <div className="mainLine">{mainText}</div>
                      <div className="subLine">COUPON</div>
                      <div className="smallLine">{validText}</div>
                      <div
                        className="smallLine"
                        style={{ letterSpacing: "0.18em" }}
                      >
                        {isActive ? "APPLIED" : "TAP TO APPLY"}
                      </div>
                    </div>
                  </div>

                  <div className="right">
                    <div className="barcodeWrap" style={{ marginTop: 6 }}>
                      {bars.map((b, i) => (
                        <span
                          key={i}
                          style={{
                            width: `${b.w}px`,
                            height: `${36 + (i % 9)}px`,
                            background: "#000",
                            display: "inline-block",
                          }}
                        />
                      ))}
                    </div>

                    <div className="codeText">
                      {String(c.code || "").toUpperCase()}
                    </div>
                  </div>

                  {isActive ? (
                    <div className="appliedBadge">APPLIED</div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Applied summary */}
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

/* ================== UI 元件 ================== */
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
        } rounded-lg px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-black/5 focus:border-black outline-none`}
      />

      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}

/* ================== Step 1：購物車清單 ================== */
function CartStep({
  items,
  onUpdateQty,
  onRemove,
  onNext,
  pricing,

  // 一般折價券
  coupons,
  couponLoading,

  // 推薦折扣金
  referralCoupons,
  referralLoading,

  // 套用狀態（共用）
  appliedCoupon,
  onApplyCoupon,
  onClearCoupon,
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
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          購物車 ({items.length})
        </h1>

        <div className="space-y-6">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex gap-6 pb-6 border-b border-gray-100 group"
            >
              <div className="w-24 h-32 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                <img
                  src={it.img}
                  className="w-full h-full object-cover"
                  alt={it.title}
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 leading-tight pr-4">
                      {it.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => onRemove(it.id)}
                      className="text-gray-300 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
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
          {/* ✅ 可用折價券 */}
          <CouponPicker
            title="可用折價券"
            subtitle="升等禮 / 生日禮金"
            coupons={coupons}
            applied={appliedCoupon}
            onApply={onApplyCoupon}
            onClear={onClearCoupon}
            loading={couponLoading}
            emptyText="目前沒有可用折價券"
          />

          {/* ✅ 推薦折扣金（新增） */}
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

            {pricing.discount > 0 ? (
              <div className="flex justify-between text-gray-500">
                <span>折扣</span>
                <span className="font-black text-black">
                  - {currency(pricing.discount)}
                </span>
              </div>
            ) : null}

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
            {pricing.discount > 0 ? (
              <p className="mt-2 text-[11px] text-gray-400">
                折扣後小計：{currency(pricing.discountedSubtotal)}
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

/* ================== Step 2：結帳區域 ================== */
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
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const searchParams = useSearchParams();

  useEffect(() => {
    const storeName = searchParams.get("storeName");
    const storeId = searchParams.get("storeId");
    const storeAddr = searchParams.get("storeAddr");

    if (storeId && storeName) {
      setShipMethod("CVS");
      setAddr((prev) => ({
        ...prev,
        line1: `${storeName} (${storeId})`,
        storeId,
        storeName,
        storeAddr: storeAddr || "",
      }));
      // 回來後把 query 清掉
      window.history.replaceState({}, document.title, window.location.pathname);
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

  const validate = () => {
    const e = {};
    if (!contact.email || !contact.email.includes("@"))
      e.email = "請輸入有效的電子郵件";
    if (!addr.firstName) e.firstName = "必填";
    if (!addr.lastName) e.lastName = "必填";
    if (!addr.line1) e.line1 = "請提供配送地址或門市資訊";
    if (!addr.phone || addr.phone.length < 9) e.phone = "請輸入正確手機號碼";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((it) => ({
            wcProductId: it.wcProductId,
            qty: it.qty,
            price: it.price,
            title: it.title,
          })),
          contact,
          addr,
          shipMethod,
          payMethod,
          coupon: appliedCoupon
            ? { code: appliedCoupon.code, amount: appliedCoupon.amount }
            : null,
          total: pricing.total,
        }),
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
      setIsSubmitting(false);
      alert("連線失敗，請稍後再試");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
      <div className="flex-1 space-y-10">
        {/* 1. 聯絡資訊 */}
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

        {/* 2. 運送方式 */}
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
                setAddr({ ...addr, line1: "" });
              }}
              className={`flex flex-col p-4 border-2 rounded-2xl text-left transition-all hover:border-black ${
                shipMethod === "000"
                  ? "border-black bg-gray-50 shadow-inner"
                  : "border-gray-100"
              }`}
            >
              <Truck className="mb-2 w-4 h-4 text-gray-400" />
              <span className="font-bold text-xs">宅配速送</span>
            </button>

            <button
              type="button"
              onClick={openEzShipMap}
              className={`flex flex-col p-4 border-2 rounded-2xl text-left transition-all hover:border-black ${
                shipMethod === "CVS"
                  ? "border-black bg-gray-50 shadow-inner"
                  : "border-gray-100"
              }`}
            >
              <MapPin className="mb-2 w-4 h-4 text-green-600" />
              <span className="font-bold text-xs">全家/萊爾富/OK</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShipMethod("711");
                setAddr({ ...addr, line1: "" });
              }}
              className={`flex flex-col p-4 border-2 rounded-2xl text-left transition-all hover:border-black ${
                shipMethod === "711"
                  ? "border-black bg-gray-50 shadow-inner"
                  : "border-gray-100"
              }`}
            >
              <MapPin className="mb-2 w-4 h-4 text-red-600" />
              <span className="font-bold text-xs">7-11 手動輸入</span>
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
              {shipMethod === "711" ? (
                <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 mb-4">
                  <p className="text-[11px] text-red-800 font-bold mb-2 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> 請手動填寫 7-11
                    門市資訊
                  </p>
                  <p className="text-[10px] text-red-600 mb-3 leading-relaxed">
                    請至{" "}
                    <a
                      href="https://emap.pcsc.com.tw/"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-black"
                    >
                      7-11 電子地圖
                    </a>{" "}
                    查詢您的門市「店號」與「店名」。
                  </p>
                  <Input
                    label="7-11 門市名稱與店號"
                    required
                    value={addr.line1}
                    onChange={(e) =>
                      setAddr({ ...addr, line1: e.target.value })
                    }
                    error={errors.line1}
                    placeholder="例：敦禾門市 (181130)"
                  />
                </div>
              ) : (
                <Input
                  label={shipMethod === "000" ? "配送地址" : "已選擇之門市"}
                  required
                  readOnly={shipMethod === "CVS"}
                  value={addr.line1}
                  onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
                  error={errors.line1}
                  placeholder={
                    shipMethod === "000"
                      ? "請輸入完整街道路名與門牌"
                      : "請點選上方地圖選擇門市"
                  }
                />
              )}
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

        {/* 3. 付款方式 */}
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
          {/* ✅ 右側：可用折價券 */}
          <CouponPicker
            title="可用折價券"
            subtitle="升等禮 / 生日禮金"
            coupons={coupons}
            applied={appliedCoupon}
            onApply={onApplyCoupon}
            onClear={onClearCoupon}
            loading={couponLoading}
            emptyText="目前沒有可用折價券"
          />

          {/* ✅ 右側：推薦折扣金（新增） */}
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
                    src={it.img}
                    className="w-full h-full object-cover"
                    alt={it.title}
                  />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {it.qty}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate text-gray-800">
                    {it.title}
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

            {pricing.discount > 0 ? (
              <div className="flex justify-between text-gray-400">
                <span>折扣</span>
                <span className="font-black text-black">
                  - {currency(pricing.discount)}
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
              <span>總金額</span>
              <span>{currency(pricing.total)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ================== 主頁面入口 ================== */
function CartContent() {
  const searchParams = useSearchParams();

  const [items, setItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [step, setStep] = useState(1);

  // ✅ 一般折價券
  const [couponLoading, setCouponLoading] = useState(false);
  const [coupons, setCoupons] = useState([]); // [{code, amount, label|title, kind}]

  // ✅ 推薦折扣金
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralCoupons, setReferralCoupons] = useState([]);

  // ✅ 共用套用狀態（一次只能套用一張）
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [pricing, setPricing] = useState({
    subtotal: 0,
    discount: 0,
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

  // ✅ 讀取購物車 & step + 還原結帳表單（修正：門市回跳後資料被清空）
  useEffect(() => {
    // items
    const raw = sessionStorage.getItem("cart_items");
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {
        setItems([]);
      }
    }

    // step：優先網址，其次 session
    const s = searchParams.get("step");
    const savedStep = sessionStorage.getItem("checkout_step");
    if (s) setStep(parseInt(s, 10));
    else if (savedStep) setStep(parseInt(savedStep, 10));

    // coupon
    const savedCoupon = sessionStorage.getItem("cart_coupon");
    if (savedCoupon) {
      try {
        const parsed = JSON.parse(savedCoupon);
        if (parsed?.code) setAppliedCoupon(parsed);
      } catch {}
    }

    // ✅ restore contact / addr / ship / pay
    const savedContact = sessionStorage.getItem("checkout_contact");
    if (savedContact) {
      try {
        setContact(JSON.parse(savedContact));
      } catch {}
    }

    const savedAddr = sessionStorage.getItem("checkout_addr");
    if (savedAddr) {
      try {
        setAddr(JSON.parse(savedAddr));
      } catch {}
    }

    const savedShip = sessionStorage.getItem("checkout_shipMethod");
    if (savedShip) setShipMethod(savedShip);

    const savedPay = sessionStorage.getItem("checkout_payMethod");
    if (savedPay) setPayMethod(savedPay);

    setItemsLoaded(true);
  }, [searchParams]);

  // ✅ 持久化：結帳表單/步驟（避免門市回跳後被清空）
  useEffect(() => {
    if (!itemsLoaded) return;

    sessionStorage.setItem("checkout_contact", JSON.stringify(contact));
    sessionStorage.setItem("checkout_addr", JSON.stringify(addr));
    sessionStorage.setItem("checkout_shipMethod", shipMethod);
    sessionStorage.setItem("checkout_payMethod", payMethod);
    sessionStorage.setItem("checkout_step", String(step));
  }, [itemsLoaded, contact, addr, shipMethod, payMethod, step]);

  // 讀取可用折價券 & 推薦折扣金（同一支 API 拿回來後分流）
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

        // 一般券 wanted
        const wantedNormal = ["ufup-2025", "ufbd-12"];

        const normal = arr
          .filter(
            (c) =>
              c?.code && wantedNormal.includes(String(c.code).toLowerCase())
          )
          .map((c) => ({
            code: c.code,
            amount: Number(c.amount) || 0,
            kind: c.kind || "",
            title: couponTitleByKindOrCode(c),
          }));

        const referral = arr
          .filter((c) => {
            const code = String(c?.code || "").toLowerCase();
            const kind = String(c?.kind || "").toLowerCase();
            return (
              code.startsWith("ufamb-") ||
              code.startsWith("uffrd-") ||
              kind === "ref_ambassador_200" ||
              kind === "ref_friend_50"
            );
          })
          .map((c) => ({
            code: c.code,
            amount: Number(c.amount) || 0,
            kind: c.kind || "",
            title: couponTitleByKindOrCode(c),
          }));

        // fallback：一般券你原本維持（避免未登入時空白）
        const finalNormal =
          normal.length > 0
            ? normal
            : [
                {
                  code: "ufup-2025",
                  amount: 100,
                  kind: "upgrade",
                  title: `升等禮 - ${currency(100)}`,
                },
                {
                  code: "ufbd-12",
                  amount: 150,
                  kind: "birthday",
                  title: `生日禮金 - ${currency(150)}`,
                },
              ];

        setCoupons(finalNormal);
        setReferralCoupons(referral); // 推薦折扣金不做假資料，避免亂顯示

        // 如果已套用券不在「兩群任何一群」裡，就取消
        setAppliedCoupon((prev) => {
          if (!prev?.code) return null;
          const code = String(prev.code).toLowerCase();
          const ok =
            finalNormal.some((c) => String(c.code).toLowerCase() === code) ||
            referral.some((c) => String(c.code).toLowerCase() === code);
          return ok ? prev : null;
        });
      } catch {
        setCoupons([
          {
            code: "ufup-2025",
            amount: 100,
            kind: "upgrade",
            title: `升等禮 - ${currency(100)}`,
          },
          {
            code: "ufbd-12",
            amount: 150,
            kind: "birthday",
            title: `生日禮金 - ${currency(150)}`,
          },
        ]);
        setReferralCoupons([]);
      } finally {
        setCouponLoading(false);
        setReferralLoading(false);
      }
    };

    loadAllCoupons();
  }, []);

  // pricing recalculation
  useEffect(() => {
    if (!itemsLoaded) return;

    sessionStorage.setItem("cart_items", JSON.stringify(items));
    sessionStorage.setItem(
      "cart_coupon",
      appliedCoupon ? JSON.stringify(appliedCoupon) : ""
    );

    const discount = appliedCoupon?.amount || 0;

    setPricing(
      calcPricing(items, { shippingBase: 0, freeShipThreshold: 1800 }, discount)
    );
  }, [items, itemsLoaded, appliedCoupon]);

  const updateQty = (id, newQty) => {
    if (newQty < 1) return;
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: newQty } : it))
    );
  };

  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const clearCart = () => {
    setItems([]);
    sessionStorage.removeItem("cart_items");
    sessionStorage.removeItem("cart_coupon");

    // ✅ 清掉結帳暫存
    sessionStorage.removeItem("checkout_contact");
    sessionStorage.removeItem("checkout_addr");
    sessionStorage.removeItem("checkout_shipMethod");
    sessionStorage.removeItem("checkout_payMethod");
    sessionStorage.removeItem("checkout_step");

    setAppliedCoupon(null);
    setContact({ email: "" });
    setAddr({
      firstName: "",
      lastName: "",
      line1: "",
      phone: "",
      storeId: "",
      storeName: "",
      storeAddr: "",
    });
    setShipMethod("000");
    setPayMethod("card");
    setStep(1);
  };

  const applyCoupon = (c) => {
    if (!c?.code) return;
    setAppliedCoupon({
      code: c.code,
      amount: Number(c.amount) || 0,
      kind: c.kind || "",
      title: c.title || couponTitleByKindOrCode(c),
    });
  };

  const clearCoupon = () => setAppliedCoupon(null);

  if (!itemsLoaded) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

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
          UFLOW
        </div>
      }
    >
      <CartContent />
    </Suspense>
  );
}
