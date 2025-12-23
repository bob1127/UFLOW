"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
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

/* ================== 工具函數 ================== */
const currency = (n) =>
  `NT$${(Math.round(n * 100) / 100).toLocaleString("zh-TW")}`;

function calcPricing(items, { shippingBase = 80, freeShipThreshold = 1800 }) {
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping =
    subtotal >= freeShipThreshold || subtotal === 0 ? 0 : shippingBase;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
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
function CartStep({ items, onUpdateQty, onRemove, onNext }) {
  const subtotal = useMemo(
    () => items.reduce((s, it) => s + it.price * it.qty, 0),
    [items]
  );

  if (items.length === 0)
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
                      className="px-3 py-2 hover:bg-gray-50 transition"
                      onClick={() => onUpdateQty(it.id, it.qty - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold">
                      {it.qty}
                    </span>
                    <button
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
          <h2 className="text-lg font-bold mb-6">訂單小計</h2>
          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>商品總計</span>
              <span>{currency(subtotal)}</span>
            </div>
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
              <span className="font-black text-2xl">{currency(subtotal)}</span>
            </div>
          </div>
          <button
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
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const searchParams = useSearchParams();

  // 接收 ezShip 地圖回傳
  useEffect(() => {
    const storeName = searchParams.get("storeName");
    const storeId = searchParams.get("storeId");
    const storeAddr = searchParams.get("storeAddr");
    if (storeId && storeName) {
      setShipMethod("CVS"); // ezShip 回傳的一律歸類為 CVS
      setAddr((prev) => ({
        ...prev,
        line1: `${storeName} (${storeId})`,
        storeId,
        storeName,
        storeAddr,
      }));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, setShipMethod, setAddr]);

  // ezShip 地圖調用函數 (用於全家/萊爾富/OK)
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
          shipMethod, // "000":宅配, "CVS":全家..., "711":手動輸入7-11
          payMethod,
          total: pricing.total,
        }),
      });
      const data = await res.json();
      if (data.html) {
        onClearCart();
        const div = document.createElement("div");
        div.innerHTML = data.html;
        document.body.appendChild(div);
        document.getElementById("_form_ecpay").submit();
      } else {
        alert(data.message || "建立訂單失敗");
        setIsSubmitting(false);
      }
    } catch (err) {
      setIsSubmitting(false);
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
            onClick={onPrev}
            className="text-sm font-bold flex items-center gap-2 text-gray-400 hover:text-black transition group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
            返回購物車
          </button>
          <button
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
  const [pricing, setPricing] = useState({
    subtotal: 0,
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

  useEffect(() => {
    const raw = sessionStorage.getItem("cart_items");
    if (raw) setItems(JSON.parse(raw));
    const s = searchParams.get("step");
    if (s) setStep(parseInt(s));
    setItemsLoaded(true);
  }, [searchParams]);

  useEffect(() => {
    if (itemsLoaded) {
      sessionStorage.setItem("cart_items", JSON.stringify(items));
      setPricing(
        calcPricing(items, { shippingBase: 80, freeShipThreshold: 1800 })
      );
    }
  }, [items, itemsLoaded]);

  const updateQty = (id, newQty) => {
    if (newQty < 1) return;
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: newQty } : it))
    );
  };
  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };
  const clearCart = () => {
    setItems([]);
    sessionStorage.removeItem("cart_items");
  };

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
