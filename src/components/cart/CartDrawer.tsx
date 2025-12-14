// components/cart/CartSheet.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCartStore,
  selectOpen,
  selectItems,
  selectSubtotal,
  keyOf,
} from "@/lib/cartStore";

const jpy = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

export default function CartSheet() {
  const open = useCartStore(selectOpen);
  const close = useCartStore((s) => s.closeCart);
  const items = useCartStore(selectItems);
  const subtotal = useCartStore(selectSubtotal);

  const inc = useCartStore((s) => s.inc);
  const dec = useCartStore((s) => s.dec);
  const remove = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const router = useRouter();

  // 點擊「前往結帳」
  const goCheckout = () => {
    if (!items.length) return;

    const mapped = items.map((it) => ({
      id: it.id,
      wcProductId: (it as any).wcProductId ?? it.id,
      title: it.name,
      variant: it.options
        ? Object.values(it.options).filter(Boolean).join(" / ")
        : "",
      img: it.image,
      price: it.price,
      list: it.price,
      compareAt: it.price,
      qty: it.qty,
    }));

    try {
      sessionStorage.setItem("cart_items", JSON.stringify(mapped));
    } catch (err) {
      console.error("寫入 cart_items 失敗：", err);
    }

    close();
    router.push("/cart");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 背景遮罩 (點擊也可關閉) */}
          <motion.div
            className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          {/* 側邊欄 */}
          <motion.aside
            className="fixed right-0 top-0 bottom-0 z-[9999999999999] w-full max-w-md bg-white shadow-xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {/* Header: 修改處 */}
            <div className="flex items-center justify-between p-4 border-b bg-white z-10">
              <div className="font-bold text-lg">購物車</div>

              <div className="flex items-center gap-3">
                {/* 清空按鈕 */}
                <button
                  onClick={clear}
                  className="text-sm text-slate-500 hover:text-red-600 transition px-2"
                >
                  清空
                </button>

                {/* 關閉按鈕 (X) */}
                <button
                  onClick={close}
                  className="p-2 rounded-full hover:bg-slate-100 transition text-slate-600"
                  aria-label="Close cart"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {items.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <p>目前尚無商品</p>
                  <button
                    onClick={close}
                    className="text-sm underline underline-offset-4 text-black"
                  >
                    去逛逛
                  </button>
                </div>
              )}

              {items.map((it) => {
                const k = keyOf(it);
                return (
                  <div
                    key={k}
                    className="flex gap-3 rounded-xl border p-3 hover:shadow-sm transition bg-white"
                  >
                    {it.image && (
                      <div className="relative w-[72px] h-[72px] flex-shrink-0">
                        <Image
                          src={it.image}
                          alt={it.name}
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate pr-4">{it.name}</div>
                      {it.options && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {Object.entries(it.options)
                            .map(([k, v]) => `${v}`) // 簡化顯示，只顯示值
                            .join(" / ")}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          className="h-7 w-7 flex items-center justify-center border rounded-full hover:bg-slate-50"
                          onClick={() => dec(k)}
                          aria-label="decrease"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {it.qty}
                        </span>
                        <button
                          className="h-7 w-7 flex items-center justify-center border rounded-full hover:bg-slate-50"
                          onClick={() => inc(k)}
                          aria-label="increase"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="font-semibold text-sm">
                        {jpy.format(it.price * it.qty)}
                      </div>
                      <button
                        onClick={() => remove(k)}
                        className="text-xs text-slate-400 hover:text-rose-600 underline underline-offset-2"
                      >
                        移除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-600 font-medium">小計</span>
                <span className="text-xl font-bold tracking-tight">
                  {jpy.format(subtotal)}
                </span>
              </div>
              <button
                disabled={items.length === 0}
                onClick={goCheckout}
                className={`w-full h-12 rounded-full text-white font-bold tracking-wide transition shadow-lg
                ${
                  items.length === 0
                    ? "bg-slate-300 cursor-not-allowed shadow-none"
                    : "bg-black hover:bg-slate-800 hover:shadow-xl active:scale-[0.98]"
                }`}
              >
                前往結帳
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
