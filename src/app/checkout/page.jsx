// app/checkout/page.jsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ====== 假資料（可改成 cartStore 實際資料） ====== */
const INIT_ITEMS = [
  {
    id: "airflex-pants-gray-l",
    title: "AirFlex™ 機能柔韌訓練長褲（鐵灰）",
    variant: "L",
    img: "https://images.unsplash.com/photo-1596755094514-f87e3eaf8d15?q=80&w=600&auto=format&fit=crop",
    price: 1038, // 活動價
    compareAt: 1180, // 原價
    qty: 2,
  },
];

/* ====== 金額工具 ====== */
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

/* ====== 小元件 ====== */
function Field({ label, required, error, help, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {!error && help && <p className="text-xs text-gray-500 mt-1">{help}</p>}
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
}) {
  return (
    <aside className="w-full lg:w-[40%] xl:w-[38%]">
      <div className="lg:sticky lg:top-24 bg-white border rounded-xl p-5 lg:p-6 shadow-sm">
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

        {/* 折扣碼 */}
        <div className="mt-5">
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

export default function CheckoutPage() {
  const router = useRouter();

  // 商品與金額
  const [items] = useState(INIT_ITEMS);
  const base = useMemo(
    () => calcPricing(items, { shippingBase: 80, freeShipThreshold: 1800 }),
    [items]
  );
  const [pricing, setPricing] = useState(base);

  // 折扣碼
  const [code, setCode] = useState("");
  const [codeMsg, setCodeMsg] = useState("");

  // 聯絡/地址
  const [contact, setContact] = useState({ email: "", newsletter: true });
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

  // 運送/付款
  const [shipMethod, setShipMethod] = useState("000");
  const [payMethod, setPayMethod] = useState("card");

  // 每次 items 變更就重算（並清空折扣）
  useEffect(() => {
    const next = calcPricing(items, {
      shippingBase: 80,
      freeShipThreshold: 1800,
    });
    setPricing(next);
    setCode("");
    setCodeMsg("");
  }, [items]);

  // 套用折扣碼（示例規則）
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

  // 驗證（簡化）
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
            wcProductId: it.id, // ⚠️ 若你實際是 WC ID，請改成數字 ID
            qty: it.qty,
            price: it.price,
            title: it.title,
          })),
          contact: {
            email: contact.email,
          },
          addr: {
            firstName: addr.firstName,
            lastName: addr.lastName,
            line1: `${addr.city}${addr.line1}`,
            phone: addr.phone,
          },
          shipMethod,
          payMethod,
          total: pricing.total, // ✅ 關鍵：唯一金額來源
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        alert(data.message || "建立訂單失敗");
        return;
      }

      // 綠界會回傳一段 html form（你後端已經做好）
      if (data.html) {
        const div = document.createElement("div");
        div.innerHTML = data.html;
        document.body.appendChild(div);
        document.getElementById("_form_ecpay")?.submit();
        return;
      }

      // fallback
      router.push(`/thank-you?orderId=${data.orderId}`);
    } catch (err) {
      alert("連線失敗，請稍後再試");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 頂部品牌列 */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <img
            src="/images/logo/logo-y.png"
            alt="ARDOAK"
            className="h-7 w-auto"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左側：表單 */}
          <section className="w-full lg:w-[60%] xl:w-[62%] space-y-8">
            {/* 聯絡方式 */}
            <div className="bg-white border rounded-xl p-5 lg:p-6 shadow-sm">
              <h2 className="text-lg font-semibold">聯絡方式</h2>
              <div className="mt-4 grid gap-4">
                <Field label="電子郵件" required error={errors.email}>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) =>
                      setContact((s) => ({ ...s, email: e.target.value }))
                    }
                    className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 ${
                      errors.email ? "border-red-500" : ""
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
            <div className="bg-white border rounded-xl p-5 lg:p-6 shadow-sm">
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

                <Field label="地址（區域＋路名）" required error={errors.line1}>
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
                    checked={addr.saveInfo}
                    onChange={(e) =>
                      setAddr((s) => ({ ...s, saveInfo: e.target.checked }))
                    }
                  />
                  儲存此資訊供下次使用
                </label>
              </div>
            </div>

            {/* 運送方式 */}
            <div className="bg-white border rounded-xl p-5 lg:p-6 shadow-sm">
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
                  {/* 這裡接 Stripe/藍新；先放示意欄位 */}
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
            <div className="flex items-center justify-between">
              <a href="/cart" className="text-sm text-gray-600 hover:underline">
                ← 返回購物車
              </a>
              <button
                onClick={submit}
                className="px-6 py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-900"
              >
                立即付款
              </button>
            </div>
          </section>

          {/* 右側：摘要 */}
          <SummaryPanel
            items={items}
            pricing={pricing}
            code={code}
            codeMsg={codeMsg}
            onCodeChange={setCode}
            onApplyCode={onApplyCode}
          />
        </div>
      </main>
    </div>
  );
}
