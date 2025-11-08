"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Icon Components (無需修改) ---
const DiscountIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-500"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);
const LockIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-500"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);
const DeliveryIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);
const PickupIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);
const CreditCardIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

// --- 【修改】頂部進度條，使其狀態動態化 ---
function CheckoutStepper({ currentStep }) {
  const steps = ["購物車", "填寫資料", "結帳"];
  return (
    <div className="flex items-center justify-center w-full mb-12">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center text-center">
              <span
                className={`text-sm font-semibold transition-colors ${
                  isCompleted
                    ? "text-pink-500"
                    : isActive
                    ? "text-black"
                    : "text-gray-400"
                }`}
              >
                STEP-{stepNumber}
              </span>
              <span
                className={`text-lg font-bold mt-1 transition-colors ${
                  isActive || isCompleted ? "text-black" : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-px mx-3 mt-6 sm:w-16 sm:mx-4 transition-colors ${
                  isCompleted ? "bg-pink-500" : "bg-gray-300"
                }`}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// --- 【重構】將原始組件拆分為步驟組件 ---

/** 步驟 1: 購物車摘要 */
function CartReviewStep({ items, onNext }) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 5.0;
  const discount = -10.0;
  const total = subtotal + shipping + discount;

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Review your cart</h2>
      <div className="space-y-4">
        {/* ... 商品列表 ... */}
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover border rounded-md"
              />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">x{item.quantity}</p>
              </div>
            </div>
            <p className="font-medium">${item.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-b my-6 py-4">
        <div className="flex items-center gap-2">
          <DiscountIcon />
          <input
            type="text"
            placeholder="Discount code"
            className="text-sm focus:outline-none"
          />
        </div>
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Apply
        </button>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Discount</span>
          <span className="text-green-600">${discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      <button
        onClick={onNext}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg mt-8 hover:bg-blue-700 transition-colors"
      >
        下一步：填寫資料
      </button>
    </div>
  );
}

/** 步驟 2: 運送資訊表單 */
function ShippingStep({ onPrev, onNext }) {
  const [shippingMethod, setShippingMethod] = useState("delivery");
  return (
    <div className="w-full max-w-lg mx-auto bg-white p-8 border-2  rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* ... Delivery / Pickup buttons ... */}
        <button
          onClick={() => setShippingMethod("delivery")}
          className={`flex items-center justify-center gap-2 py-3 border rounded-lg transition-colors ${
            shippingMethod === "delivery"
              ? "bg-blue-50 text-blue-600 "
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <DeliveryIcon />
          <span className="font-medium">Delivery</span>
        </button>
        <button
          onClick={() => setShippingMethod("pickup")}
          className={`flex items-center justify-center gap-2 py-3 border rounded-lg transition-colors ${
            shippingMethod === "pickup"
              ? "bg-blue-50 text-blue-600 "
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <PickupIcon />
          <span className="font-medium">Pick up</span>
        </button>
      </div>
      <form className="space-y-4">
        {/* ... 表單欄位 ... */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full name *
          </label>
          <input
            type="text"
            defaultValue="Brandon Johnson"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email address *
          </label>
          <input
            type="email"
            defaultValue="brandonjohnson@gmail.com"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone number *
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 border border-r-0 rounded-l-lg bg-gray-50 text-sm">
              🇺🇸
            </span>
            <input
              type="tel"
              defaultValue="+1 425 151 231"
              className="w-full border rounded-r-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center pt-4">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            I have read and agree to the Terms and Conditions.
          </label>
        </div>
      </form>
      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
        >
          上一步
        </button>
        <button
          onClick={onNext}
          className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          下一步：結帳
        </button>
      </div>
    </div>
  );
}

/** 步驟 3: 結帳/付款 */
function PaymentStep({ onPrev, total }) {
  return (
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="flex items-center gap-3">
        <CreditCardIcon />
        <h2 className="text-xl font-semibold">Payment Details</h2>
      </div>
      <p className="text-gray-600 mt-2 mb-6">
        Enter your credit card information below.
      </p>

      {/* 這裡是您放置真實付款表單（如 Stripe Elements）的地方 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <input
            type="text"
            placeholder="•••• •••• •••• ••••"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              placeholder="MM / YY"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVC
            </label>
            <input
              type="text"
              placeholder="123"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t mt-8 pt-4">
        <span className="text-lg font-semibold">Total to Pay:</span>
        <span className="text-2xl font-bold text-blue-600">
          ${total.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
        >
          上一步
        </button>
        <button
          onClick={() => alert("付款成功！")}
          className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
        >
          確認付款
        </button>
      </div>
    </div>
  );
}

// --- 【主要】 Checkout Page Component ---
export default function CheckoutPage() {
  // 【核心】使用 state 來管理當前步驟
  const [step, setStep] = useState(1);
  // 【核心】管理切換方向，用於決定動畫是向左還是向右
  const [direction, setDirection] = useState(1);

  // 模擬的購物車商品資料
  const cartItems = [
    {
      id: 1,
      name: "DuoComfort Sofa Premium",
      quantity: 1,
      price: 20.0,
      image: "https://via.placeholder.com/150/E2E8F0/8D9AAF?text=Sofa",
    },
    {
      id: 2,
      name: "IronOne Desk",
      quantity: 1,
      price: 25.0,
      image: "https://via.placeholder.com/150/E2E8F0/8D9AAF?text=Desk",
    },
  ];
  const total =
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) +
    5.0 -
    10.0;

  // 切換到下一步的函式
  const handleNext = () => {
    setDirection(1); // 設置方向為前進
    if (step < 3) setStep(step + 1);
  };

  // 切換回上一步的函式
  const handlePrev = () => {
    setDirection(-1); // 設置方向為後退
    if (step > 1) setStep(step - 1);
  };

  // 【核心】Framer Motion 的動畫變體
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50, // 根據方向從右或左進入
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 50 : -50, // 根據方向向右或左退出
      opacity: 0,
    }),
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-[140px] pb-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <CheckoutStepper currentStep={step} />
        <div className="relative h-[650px]">
          {" "}
          {/* 使用相對定位容器來包裹動畫 */}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={step} // 【重要】key 必須是唯一的，Framer Motion 靠它來偵測組件變化
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
              className="absolute w-full"
            >
              {step === 1 && (
                <CartReviewStep items={cartItems} onNext={handleNext} />
              )}
              {step === 2 && (
                <ShippingStep onPrev={handlePrev} onNext={handleNext} />
              )}
              {step === 3 && <PaymentStep onPrev={handlePrev} total={total} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
