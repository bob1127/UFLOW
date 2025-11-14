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
      title: it.name,
      // 直接從 options 組一個 variant 字串
      variant: it.options
        ? Object.values(it.options).filter(Boolean).join(" / ")
        : "",
      img: it.image,
      price: it.price,
      list: it.price, // 先用售價當原價
      compareAt: it.price, // 先用售價當比較價
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
          <motion.div
            className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed right-0 top-0 bottom-0 z-[9999999999999] w-full max-w-md bg-white shadow-xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="font-semibold">購物車</div>
              <button
                onClick={clear}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                清空
              </button>
            </div>

            {/* Items */}
            <div className="flex-1  overflow-auto p-4 space-y-4">
              {items.length === 0 && (
                <p className="text-slate-500 text-sm">目前尚無商品</p>
              )}

              {items.map((it) => {
                const k = keyOf(it);
                return (
                  <div
                    key={k}
                    className="flex gap-3 rounded-xl border p-3 hover:shadow-sm transition bg-white"
                  >
                    {it.image && (
                      <Image
                        src={it.image}
                        alt={it.name}
                        width={72}
                        height={72}
                        className="rounded-lg rounded-xl max-w-[120px]  object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{it.name}</div>
                      {it.options && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {Object.entries(it.options)
                            .map(([k, v]) => `${k}:${v}`)
                            .join(" ｜ ")}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          className="h-8 w-8 flex items-center justify-center border rounded-full"
                          onClick={() => dec(k)}
                          aria-label="decrease"
                        >
                          −
                        </button>
                        <span className="w-6 text-center">{it.qty}</span>
                        <button
                          className="h-8 w-8 flex items-center justify-center border rounded-full"
                          onClick={() => inc(k)}
                          aria-label="increase"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="font-semibold">
                        {jpy.format(it.price * it.qty)}
                      </div>
                      <button
                        onClick={() => remove(k)}
                        className="text-xs text-slate-500 hover:text-rose-600"
                      >
                        移除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600">小計</span>
                <span className="text-lg font-semibold">
                  {jpy.format(subtotal)}
                </span>
              </div>
              <button
                disabled={items.length === 0}
                onClick={goCheckout}
                className={`w-full h-12 rounded-full text-white font-semibold transition
                ${
                  items.length === 0
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-black hover:bg-slate-900"
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
