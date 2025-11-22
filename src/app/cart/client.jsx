// app/cart/page.jsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ================== 假資料（保底；會被動態載入覆蓋） ================== */
const INIT_ITEMS = [
  {
    id: "",
    title: "",
    variant: "L",
    img: "https://images.unsplash.com/photo-1596755094514-f87e3eaf8d15?q=80&w=600&auto=format&fit=crop",
    list: 2360,
    price: 1038,
    compareAt: 1180,
    qty: 2,
  },
];

/* ================== 小工具 ================== */
const currency = (n) =>
  `NT$${(Math.round(n * 100) / 100).toLocaleString("zh-TW")}`;

function calcPricing(items, { shippingBase = 80, freeShipThreshold = 1800 }) {
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const saveFromSale = items.reduce(
    (s, it) => s + Math.max(0, (it.compareAt || it.price) - it.price) * it.qty,
    0
  );
  const shipping = subtotal >= freeShipThreshold ? 0 : shippingBase;
  const total = subtotal + shipping;
  return { subtotal, shipping, discount: 0, total, saveFromSale };
}

// 依 Woo coupon 型態計算折扣
function computeDiscountByCoupon(pricing, couponObj) {
  if (!couponObj) return 0;
  const base = pricing.subtotal + pricing.shipping;
  const type = String(couponObj.discount_type || "").toLowerCase();
  const amountNum = Number(couponObj.amount || 0);

  if (type === "fixed_cart") {
    return Math.min(base, amountNum);
  }

  if (type === "percent") {
    const cut = Math.round(base * (amountNum / 100));
    return Math.min(base, cut);
  }

  // 其他型態先不算（避免錯）
  return 0;
}

/* ================== 共用 UI 小元件 ================== */
function Field({ label, required, error, help, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {!error && help && help.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">{help}</p>
      )}
    </div>
  );
}

function RadioRow({ checked, onChange, label, right, children }) {
  return (
    <label className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="mt-1"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium">{label}</p>
          {right}
        </div>
        {children && (
          <div className="mt-2 text-sm text-gray-600">{children}</div>
        )}
      </div>
    </label>
  );
}

function SummaryPanel({
  items,
  pricing,
  code,
  codeMsg,
  onCodeChange,
  onApplyCode,
  availableCoupons = [],
  availableLoading = false,
  selectedCouponCode,
  onSelectCoupon,
}) {
  return (
    <aside className=" sm:w-[80%] w-full mx-auto lg:w-1/2 bg-slate-50 ">
      <div className="lg:sticky max-w-xl top-0 lg:top-24 mx-auto  rounded-xl p-5 lg:p-6 shadow-sm">
        {/* 商品清單 */}
        <div className="space-y-4">
          {items.map((it) => (
            <div key={it.id} className="flex gap-3">
              <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                <img
                  src={it.img}
                  alt={it.title}
                  className="w-full h-full object-cover"
                />
                {it.qty > 1 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs px-1.5 py-0.5 rounded">
                    {it.qty}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight line-clamp-2">
                      {it.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {it.variant ? `尺寸 ${it.variant}` : null}
                    </p>
                  </div>
                  <div className="text-sm font-medium whitespace-nowrap">
                    {currency(it.price * it.qty)}
                  </div>
                </div>
                {it.compareAt && it.compareAt > it.price && (
                  <p className="text-[12px] text-emerald-600 mt-0.5">
                    已節省 {currency((it.compareAt - it.price) * it.qty)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 折扣碼 + 可用券下拉 */}
        <div className="mt-5 space-y-2">
          {availableLoading ? (
            <div className="text-xs text-gray-500">讀取可用折扣碼中…</div>
          ) : availableCoupons.length > 0 ? (
            <select
              value={selectedCouponCode || ""}
              onChange={(e) => onSelectCoupon(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 bg-white"
            >
              <option value="">選擇可用折扣碼</option>
              {availableCoupons.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}（{Number(c.amount) || 0}）
                </option>
              ))}
            </select>
          ) : null}

          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              type="text"
              placeholder="折扣碼"
              className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            />
            <button
              onClick={onApplyCode}
              className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
            >
              套用
            </button>
          </div>
          {codeMsg && <p className="text-xs mt-2 text-gray-500">{codeMsg}</p>}
        </div>

        {/* 金額明細 */}
        <div className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">小計</span>
            <span>{currency(pricing.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">運送</span>
            <span>
              {pricing.shipping === 0 ? (
                <>
                  <span className="line-through mr-1 text-gray-400">
                    {currency(80)}
                  </span>
                  <span className="inline-flex items-center text-emerald-700">
                    免運
                  </span>
                </>
              ) : (
                currency(pricing.shipping)
              )}
            </span>
          </div>
          {pricing.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">折扣</span>
              <span className="text-emerald-700">
                - {currency(pricing.discount)}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t pt-3 text-base font-semibold">
            <span>總計</span>
            <span>{currency(pricing.total)}</span>
          </div>
        </div>

        {/* 節省總額 */}
        {pricing.saveFromSale + pricing.discount > 0 && (
          <div className="mt-3 text-xs text-gray-600 flex items-center gap-2">
            <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
              總節省金額
            </span>
            <span className="font-medium">
              {currency(pricing.saveFromSale + pricing.discount)}
            </span>
          </div>
        )}

        {/* 免運提示 */}
        {pricing.shipping === 0 ? (
          <p className="mt-3 text-xs text-gray-500">
            台灣地區消費滿 NT$1,800 免運 ✅
          </p>
        ) : (
          <p className="mt-3 text-xs text-gray-500">
            台灣地區消費滿 NT$1,800 即享免運
          </p>
        )}
      </div>
    </aside>
  );
}

/* ================== Step 1：購物車 ================== */
function CartStep({ items, setItems, onNext }) {
  const [note, setNote] = useState("");

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + it.price * it.qty, 0),
    [items]
  );
  const shippingFee = 0; // 示意：免運
  const total = subtotal + shippingFee;

  const setQty = (id, q) =>
    setItems((arr) =>
      arr.map((x) => (x.id === id ? { ...x, qty: Math.max(1, q) } : x))
    );
  const remove = (id) => setItems((arr) => arr.filter((x) => x.id !== id));

  return (
    <div className="max-w-7xl mx-auto px-4 pt-10 pb-16">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Your cart
        </h1>
        <button
          type="button"
          className="text-sm text-gray-600 hover:text-gray-900 underline-offset-4 hover:underline"
        >
          繼續購物
        </button>
      </div>

      <div className="hidden md:grid grid-cols-12 text-xs tracking-wide text-gray-500 px-4 mb-2">
        <div className="col-span-6">PRODUCT</div>
        <div className="col-span-2">PRICE</div>
        <div className="col-span-2">QUANTITY</div>
        <div className="col-span-2 text-right">TOTAL</div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <section className="lg:col-span-8">
          <div className="divide-y border-t border-b rounded-none md:rounded-xl bg-white">
            {items.map((it) => {
              const rowTotal = it.price * it.qty;
              return (
                <div key={it.id} className="grid grid-cols-12 gap-4 p-4">
                  <div className="col-span-12 md:col-span-6 flex gap-4">
                    <img
                      src={it.img}
                      alt={it.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover border"
                    />
                    <div className="flex-1 text-sm">
                      <div className="font-medium text-gray-900">
                        {it.title}
                      </div>
                      {it.variant && (
                        <div className="mt-1 text-xs text-gray-500">
                          Color / Size：{it.variant}
                        </div>
                      )}
                      <button
                        onClick={() => remove(it.id)}
                        className="mt-3 inline-flex items-center text-xs text-gray-500 hover:text-gray-900"
                      >
                        移除
                      </button>
                    </div>
                  </div>

                  <div className="col-span-6 md:col-span-2 flex md:block items-center gap-2 text-sm">
                    {it.list && (
                      <span className="text-gray-400 line-through mr-1">
                        {currency(it.list)}
                      </span>
                    )}
                    <br />
                    <span className="font-semibold text-gray-900">
                      {currency(it.price)}
                    </span>
                  </div>

                  <div className="col-span-6 md:col-span-2 flex md:block items-center">
                    <div className="inline-flex items-center border rounded-full text-sm">
                      <button
                        className="px-3 py-1.5"
                        aria-label="decrease"
                        onClick={() => setQty(it.id, Math.max(1, it.qty - 1))}
                      >
                        –
                      </button>
                      <div className="px-4 py-1.5 border-x min-w-[2.5rem] text-center">
                        {it.qty}
                      </div>
                      <button
                        className="px-3 py-1.5"
                        aria-label="increase"
                        onClick={() => setQty(it.id, it.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-2 md:text-right flex md:block items中心 justify-between md:justify-end text-sm font-semibold">
                    <span className="md:hidden text-gray-500">小計</span>
                    <span>{currency(rowTotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-gray-500">
            稅金與運費將於結帳時計算。
          </p>
        </section>

        <aside className="lg:col-span-4 lg:pl-4">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border rounded-xl p-4 sm:p-5 text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{currency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Shipping</span>
                <span>計算於結帳頁面</span>
              </div>
              <div className="flex justify-between pt-3 mt-1 border-t text-base font-semibold">
                <span>Total</span>
                <span>{currency(total)}</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Taxes and shipping will be calculated at checkout.
              </p>
            </div>

            <button
              onClick={onNext}
              className="w-full h-11 sm:h-12 bg-black text-white font-semibold rounded-md hover:opacity-90 text-sm"
            >
              Check out
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ================== Step 2：結帳 ================== */
function CheckoutStep({
  items,
  pricing,
  setPricing,
  code,
  setCode,
  codeMsg,
  setCodeMsg,
  contact,
  setContact,
  addr,
  setAddr,
  shipMethod,
  setShipMethod,
  payMethod,
  setPayMethod,
  onPrev,
  onSubmitOk,

  // ✅ 新增
  availableCoupons,
  availableLoading,
  selectedCouponCode,
  onSelectCoupon,
}) {
  const onApplyCode = () => {
    const v = code.trim().toUpperCase();
    if (!v) {
      setCodeMsg("請輸入折扣碼");
      setPricing((p) => ({
        ...p,
        discount: 0,
        total: p.subtotal + p.shipping,
      }));
      return;
    }

    // ✅ 1) 優先套用「可用券」規則
    const found = (availableCoupons || []).find(
      (c) => String(c.code || "").toUpperCase() === v
    );
    if (found && found.coupon) {
      const discount = computeDiscountByCoupon(pricing, found.coupon);
      setCodeMsg(`已套用折扣碼：${found.code}`);
      setPricing((p) => ({
        ...p,
        discount,
        total: Math.max(0, p.subtotal + p.shipping - discount),
      }));
      return;
    }

    // ✅ 2) 保底：你原本的 hardcode
    if (v === "ST35") {
      setCodeMsg("已套用折扣碼：ST35（-NT$35）");
      setPricing((p) => ({
        ...p,
        discount: 35,
        total: Math.max(0, p.subtotal + p.shipping - 35),
      }));
    } else if (v === "TW8") {
      setCodeMsg("已套用 92 折");
      setPricing((p) => {
        const cut = Math.round((p.subtotal + p.shipping) * 0.08);
        return {
          ...p,
          discount: cut,
          total: Math.max(0, p.subtotal + p.shipping - cut),
        };
      });
    } else {
      setCodeMsg("折扣碼無效");
      setPricing((p) => ({
        ...p,
        discount: 0,
        total: p.subtotal + p.shipping,
      }));
    }
  };

  // 驗證
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (!/.+@.+\..+/.test(contact.email)) e.email = "請輸入正確的 Email";
    if (!addr.firstName) e.firstName = "必填";
    if (!addr.lastName) e.lastName = "必填";
    if (!addr.line1) e.line1 = "必填";
    if (!addr.city) e.city = "請輸入正確的城市";
    if (!addr.phone) e.phone = "必填";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

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
            img: it.img,
            variant: it.variant,
          })),
          contact,
          addr,
          shipMethod,
          payMethod,
          couponCode: code.trim() || null, // ✅ 送去後端
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        console.log("checkout error:", res.status, data);
        alert(data.message || "建立 WooCommerce 訂單失敗");
        return;
      }

      const mergedOrder = {
        id: data.order.id,
        number: data.order.number,
        items,
        pricing,
        contact,
        addr,
        shipMethod,
        payMethod,
        createdAt: Date.now(),
      };

      onSubmitOk(mergedOrder);
    } catch (err) {
      console.error(err);
      alert("系統錯誤，請稍後再試。");
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className=" px-4 pt-8 pb-12 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左側：表單 */}
          <section className=" w-full sm:w-[80%] mx-auto lg:w-1/2 flex justify-center lg:justify-end pr-0 lg:pr-10 space-y-8">
            <div className="max-w-2xl">
              {/* 聯絡方式 */}
              <div className="bg-white border rounded-xl my-5 p-5 lg:p-6 shadow-sm">
                <h2 className="text-lg font-semibold">聯絡方式</h2>
                <div className="mt-4 grid gap-4">
                  <Field
                    label="電子郵件"
                    required
                    error={errors.email}
                    help={
                      contact.lockedEmail
                        ? "已從會員帳號帶入，若要修改請到「會員中心→我的帳戶」變更 Email。"
                        : ""
                    }
                  >
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) =>
                        setContact((s) => ({ ...s, email: e.target.value }))
                      }
                      disabled={contact.lockedEmail}
                      className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 ${
                        errors.email ? "border-red-500" : ""
                      } ${
                        contact.lockedEmail
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={contact.newsletter}
                      onChange={(e) =>
                        setContact((s) => ({
                          ...s,
                          newsletter: e.target.checked,
                        }))
                      }
                    />
                    以電子郵件傳送最新消息和優惠活動給我
                  </label>
                </div>
              </div>

              {/* 配送地址 */}
              <div className="bg-white my-5 border rounded-xl p-5 lg:p-6 shadow-sm">
                <h2 className="text-lg font-semibold">配送</h2>
                <div className="mt-4 grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="國家/地區">
                      <select
                        value={addr.country}
                        onChange={(e) =>
                          setAddr((s) => ({ ...s, country: e.target.value }))
                        }
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                      >
                        <option>台灣</option>
                        <option>香港</option>
                        <option>日本</option>
                      </select>
                    </Field>
                    <Field label="名字" required error={errors.firstName}>
                      <input
                        value={addr.firstName}
                        onChange={(e) =>
                          setAddr((s) => ({ ...s, firstName: e.target.value }))
                        }
                        className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 ${
                          errors.firstName ? "border-red-500" : ""
                        }`}
                        placeholder="名字"
                      />
                    </Field>
                    <Field label="姓氏" required error={errors.lastName}>
                      <input
                        value={addr.lastName}
                        onChange={(e) =>
                          setAddr((s) => ({ ...s, lastName: e.target.value }))
                        }
                        className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 ${
                          errors.lastName ? "border-red-500" : ""
                        }`}
                        placeholder="姓氏"
                      />
                    </Field>
                  </div>

                  <Field
                    label="地址（區域＋路名）"
                    required
                    error={errors.line1}
                  >
                    <input
                      value={addr.line1}
                      onChange={(e) =>
                        setAddr((s) => ({ ...s, line1: e.target.value }))
                      }
                      className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 ${
                        errors.line1 ? "border-red-500" : ""
                      }`}
                      placeholder="例：板橋區重慶路 〇號"
                    />
                  </Field>
                  <Field label="地址 2（選填）">
                    <input
                      value={addr.line2}
                      onChange={(e) =>
                        setAddr((s) => ({ ...s, line2: e.target.value }))
                      }
                      className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                      placeholder="樓層、公司…"
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field
                      label="城市（必填）"
                      required
                      error={errors.city}
                      help="例：台北市、新竹縣…"
                    >
                      <input
                        value={addr.city}
                        onChange={(e) =>
                          setAddr((s) => ({ ...s, city: e.target.value }))
                        }
                        className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 ${
                          errors.city ? "border-red-500" : ""
                        }`}
                      />
                    </Field>
                    <Field label="郵遞區號（選填）">
                      <input
                        value={addr.zip}
                        onChange={(e) =>
                          setAddr((s) => ({ ...s, zip: e.target.value }))
                        }
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                      />
                    </Field>
                    <Field label="電話" required error={errors.phone}>
                      <input
                        value={addr.phone}
                        onChange={(e) =>
                          setAddr((s) => ({ ...s, phone: e.target.value }))
                        }
                        className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 ${
                          errors.phone ? "border-red-500" : ""
                        }`}
                        placeholder="09xxxxxxxx"
                      />
                    </Field>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={addr.saveInfo || false}
                      onChange={(e) =>
                        setAddr((s) => ({ ...s, saveInfo: e.target.checked }))
                      }
                    />
                    儲存此資訊供下次使用
                  </label>
                </div>
              </div>

              {/* 運送方式 */}
              <div className="bg白 my-5 border rounded-xl p-5 lg:p-6 shadow-sm">
                <h2 className="text-lg font-semibold">運送方式</h2>
                <div className="mt-4 grid gap-3">
                  <RadioRow
                    checked={shipMethod === "000"}
                    onChange={() => setShipMethod("000")}
                    label="000「宅配速送」新竹物流"
                    right={
                      pricing.shipping === 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-gray-400">
                            {currency(80)}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs">
                            免費
                          </span>
                        </div>
                      ) : (
                        <span>{currency(80)}</span>
                      )
                    }
                  >
                    運送至：{addr.city || "—"}
                  </RadioRow>
                </div>
              </div>

              {/* 付款 */}
              <div className="bg-white border rounded-xl p-5 lg:p-6 shadow-sm">
                <h2 className="text-lg font-semibold">付款</h2>
                <p className="text-sm text-gray-500 mt-1">
                  所有交易都受安全加密保護。{" "}
                  <span className="inline-block ml-1">🔒</span>
                </p>

                <div className="mt-4 grid gap-3">
                  <RadioRow
                    checked={payMethod === "card"}
                    onChange={() => setPayMethod("card")}
                    label="信用卡支付"
                    right={
                      <div className="flex items-center gap-1 opacity-70">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                          alt="VISA"
                          className="h-4 w-auto"
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                          alt="Mastercard"
                          className="h-4 w-auto"
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/3/30/Amex_logo.svg"
                          alt="AMEX"
                          className="h-4 w-auto"
                        />
                      </div>
                    }
                  >
                    <div className="grid sm:grid-cols-2 gap-3 pt-2">
                      <input
                        className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                        placeholder="卡號 •••• •••• •••• ••••"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                          placeholder="MM/YY"
                        />
                        <input
                          className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                          placeholder="CVC"
                        />
                      </div>
                    </div>
                  </RadioRow>

                  <RadioRow
                    checked={payMethod === "linepay"}
                    onChange={() => setPayMethod("linepay")}
                    label="LINE Pay"
                    right={
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/2/2a/LINE_logo.svg"
                        alt="LINE"
                        className="h-4 w-auto"
                      />
                    }
                  />
                </div>
              </div>

              {/* 送出 */}
              <div className="flex my-5 items-center justify-between">
                <button
                  onClick={onPrev}
                  className="text-sm text-gray-600 hover:underline"
                >
                  ← 返回購物車
                </button>
                <button
                  onClick={submit}
                  className="px-6 py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-900"
                >
                  立即付款
                </button>
              </div>
            </div>
          </section>

          {/* 右側：摘要（含下拉券） */}
          <SummaryPanel
            items={items}
            pricing={pricing}
            code={code}
            codeMsg={codeMsg}
            onCodeChange={setCode}
            onApplyCode={onApplyCode}
            availableCoupons={availableCoupons}
            availableLoading={availableLoading}
            selectedCouponCode={selectedCouponCode}
            onSelectCoupon={onSelectCoupon}
          />
        </div>
      </div>
    </div>
  );
}

/* ================== Step 3：感謝頁 ================== */
// 你原本 ThankYouStep / Stepper 不動
function ThankYouStep({ order, onBackToShop }) {
  if (!order) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-2xl font-bold">感謝您的訂購！</h1>
        <p className="text-gray-600">找不到訂單資料，您可以回到首頁。</p>
        <button
          onClick={onBackToShop}
          className="px-4 py-2 rounded bg-black text-white"
        >
          回首頁
        </button>
      </main>
    );
  }

  return (
    <main className="w-full max-w-[1500px] mx-auto px-4 pt-8 pb-16 grid lg:grid-cols-12 gap-8">
      <section className="lg:col-span-8 space-y-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full border grid place-items-center">
                ✓
              </div>
              <div>
                <div className="text-sm text-gray-500">確認 #{order.id}</div>
                <h1 className="text-xl font-semibold">已送出，感謝您！</h1>
              </div>
            </div>

            <div className="mt-4 rounded-lg overflow-hidden border">
              <img
                src="https://maps.googleapis.com/maps/api/staticmap?center=Taichung&zoom=12&size=800x300&scale=2&maptype=roadmap&markers=color:red%7CTaichung"
                alt="選送地址地圖（示意）"
                className="w-full h-auto"
              />
            </div>

            <p className="mt-4 text-sm text-gray-700">
              您很快就會收到確認電子郵件。
            </p>
          </div>
          <div className="bg-white border rounded-xl mt-8 p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">訂單詳細資訊</h2>
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-gray-500 mb-1">聯絡資訊</div>
                <div>{order.contact?.email || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">付款方式</div>
                <div>
                  {order.payMethod === "card" ? "信用卡" : "LINE Pay"} —{" "}
                  <span className="font-medium">
                    {currency(order.pricing.total)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">運送地址</div>
                <div className="whitespace-pre-line">
                  {order.addr?.zip ? `${order.addr.zip}\n` : ""}
                  {order.addr?.country} {order.addr?.city}
                  {order.addr?.line1 ? `\n${order.addr.line1}` : ""}
                  {order.addr?.line2 ? `\n${order.addr.line2}` : ""}
                  {order.addr?.phone ? `\n${order.addr.phone}` : ""}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">運送方式</div>
                <div>000「宅配速送」新竹物流</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="lg:col-span-4">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="space-y-4">
            {order.items.map((it) => (
              <div key={it.id} className="flex gap-3">
                <div className="w-14 h-14 rounded-md overflow-hidden border">
                  <img
                    src={it.img}
                    alt={it.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium line-clamp-2">
                      {it.title}
                    </p>
                    <div className="text-sm whitespace-nowrap">
                      {currency(it.price * it.qty)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    尺寸 {it.variant} × {it.qty}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">小計</span>
              <span>{currency(order.pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">運送</span>
              <span>
                {order.pricing.shipping === 0
                  ? "免費"
                  : currency(order.pricing.shipping)}
              </span>
            </div>
            {order.pricing.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">折扣</span>
                <span className="text-emerald-700">
                  - {currency(order.pricing.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>總計</span>
              <span>{currency(order.pricing.total)}</span>
            </div>
          </div>

          <button
            onClick={onBackToShop}
            className="mt-6 w-full text-center px-4 py-3 rounded-lg bg-black text-white"
          >
            繼續購物
          </button>
        </div>
      </aside>
    </main>
  );
}

function Stepper({ step }) {
  const steps = ["購物車", "填寫資料", "感謝頁"];
  return (
    <div className="flex items-center justify-center w-full mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const isActive = step === idx;
        const isDone = step > idx;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center text-center">
              <span
                className={`text-sm font-semibold transition-colors ${
                  isDone
                    ? "text-pink-500"
                    : isActive
                    ? "text-black"
                    : "text-gray-400"
                }`}
              >
                STEP-{idx}
              </span>
              <span
                className={`text-lg font-bold mt-1 transition-colors ${
                  isActive || isDone ? "text-black" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 h-px mx-3 mt-6 sm:w-16 sm:mx-4 transition-colors ${
                  isDone ? "bg-pink-500" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ================== 主頁面 ================== */
export default function CartIntegratedPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [items, setItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);

  const basePricing = useMemo(
    () => calcPricing(items, { shippingBase: 80, freeShipThreshold: 1800 }),
    [items]
  );
  const [pricing, setPricing] = useState(basePricing);

  const [code, setCode] = useState("");
  const [codeMsg, setCodeMsg] = useState("");

  const [contact, setContact] = useState({
    email: "",
    newsletter: true,
    lockedEmail: false,
  });
  const [addr, setAddr] = useState({
    country: "台灣",
    firstName: "",
    lastName: "",
    line1: "",
    line2: "",
    city: "",
    zip: "",
    phone: "",
    saveInfo: false,
  });

  const [shipMethod, setShipMethod] = useState("000");
  const [payMethod, setPayMethod] = useState("card");

  const [order, setOrder] = useState(null);

  // ✅ 可用折扣碼
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [selectedCouponCode, setSelectedCouponCode] = useState("");

  useEffect(() => {
    async function loadCartItems() {
      try {
        const fromSS = sessionStorage.getItem("cart_items");
        if (fromSS) {
          const parsed = JSON.parse(fromSS);
          if (Array.isArray(parsed) && parsed.length) {
            setItems(parsed);
            setItemsLoaded(true);
            return;
          }
        }
      } catch {}

      try {
        const res = await fetch("/api/cart", { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length) {
            setItems(data);
            setItemsLoaded(true);
            return;
          }
        }
      } catch {}

      setItems(INIT_ITEMS);
      setItemsLoaded(true);
    }

    loadCartItems();
  }, []);

  useEffect(() => {
    async function loadSessionEmail() {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) return;
        const data = await res.json();
        if (data?.user?.email) {
          setContact((prev) => ({
            ...prev,
            email: data.user.email,
            lockedEmail: true,
          }));
        }
      } catch (err) {
        console.error("載入登入會員 email 失敗", err);
      }
    }
    loadSessionEmail();
  }, []);

  useEffect(() => {
    const next = calcPricing(items, {
      shippingBase: 80,
      freeShipThreshold: 1800,
    });
    setPricing(next);
    setCode("");
    setCodeMsg("");
    setSelectedCouponCode("");
  }, [items]);

  // ✅ 讀取可用折扣碼（登入會員）
  useEffect(() => {
    async function loadAvailableCoupons() {
      setAvailableLoading(true);
      try {
        const res = await fetch("/api/account/coupons/available", {
          credentials: "include",
          cache: "no-store",
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
    }
    loadAvailableCoupons();
  }, []);

  const nextStep = () => {
    setDirection(1);
    setStep((s) => Math.min(3, s + 1));
  };
  const prevStep = () => {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  };

  const variants = {
    enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d < 0 ? 40 : -40, opacity: 0 }),
  };

  // ✅ 選到券：自動帶入 code + 自動套用
  const handleSelectCoupon = (couponCode) => {
    setSelectedCouponCode(couponCode);
    setCode(couponCode || "");
    setCodeMsg("");
    if (couponCode) {
      const found = availableCoupons.find(
        (c) =>
          String(c.code || "").toUpperCase() ===
          String(couponCode).toUpperCase()
      );
      if (found && found.coupon) {
        const discount = computeDiscountByCoupon(pricing, found.coupon);
        setCodeMsg(`已套用折扣碼：${found.code}`);
        setPricing((p) => ({
          ...p,
          discount,
          total: Math.max(0, p.subtotal + p.shipping - discount),
        }));
      }
    } else {
      // 清空
      setPricing((p) => ({
        ...p,
        discount: 0,
        total: p.subtotal + p.shipping,
      }));
    }
  };

  return (
    <div className="h-auto bg-white pb-10">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <img
            src="/images/logo/logo-y.png"
            alt="ARDOAK"
            className="h-7 w-auto"
          />
        </div>
      </header>

      <main className="w-full mx-auto px-4 pt-8">
        <Stepper step={step} />

        <div className="relative min-h-[60vh] overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.section
              key={itemsLoaded ? step : "loading"}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", ease: "easeInOut", duration: 0.32 }}
              layout
            >
              {!itemsLoaded && (
                <div className="py-20 text-center text-gray-500">載入中…</div>
              )}

              {itemsLoaded && step === 1 && (
                <CartStep items={items} setItems={setItems} onNext={nextStep} />
              )}

              {itemsLoaded && step === 2 && (
                <CheckoutStep
                  items={items}
                  pricing={pricing}
                  setPricing={setPricing}
                  code={code}
                  setCode={setCode}
                  codeMsg={codeMsg}
                  setCodeMsg={setCodeMsg}
                  contact={contact}
                  setContact={setContact}
                  addr={addr}
                  setAddr={setAddr}
                  shipMethod={shipMethod}
                  setShipMethod={setShipMethod}
                  payMethod={payMethod}
                  setPayMethod={setPayMethod}
                  onPrev={prevStep}
                  onSubmitOk={(ord) => {
                    setOrder(ord);
                    nextStep();
                  }}
                  // ✅ 新增傳入
                  availableCoupons={availableCoupons}
                  availableLoading={availableLoading}
                  selectedCouponCode={selectedCouponCode}
                  onSelectCoupon={handleSelectCoupon}
                />
              )}

              {itemsLoaded && step === 3 && (
                <ThankYouStep
                  order={order}
                  onBackToShop={() => {
                    setStep(1);
                  }}
                />
              )}
            </motion.section>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
