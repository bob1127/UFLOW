// lib/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price: number;     // 單價（數字）
  qty: number;       // 數量
  image?: string;
  options?: Record<string, string>; // 例如 { 口味: '奶茶', 規格: '8 份' }
};

type CartState = {
  open: boolean;
  items: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  toggle: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;       // 以複合 key 刪除（同 id+options 視為同一列）
  inc: (key: string) => void;
  dec: (key: string) => void;
  clear: () => void;
};

// 以 id + options 序列化，確保同規格被合併
const makeKey = (i: Pick<CartItem, "id" | "options">) =>
  `${i.id}__${JSON.stringify(i.options || {})}`;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      open: false,
      items: [],

      openCart: () => set({ open: true }),
      closeCart: () => set({ open: false }),
      toggle:    () => set((s) => ({ open: !s.open })),

      addItem: (item) => {
        const key = makeKey(item);
        const next = get().items.slice();
        const idx = next.findIndex((x) => makeKey(x) === key);
        if (idx >= 0) {
          next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        } else {
          next.push(item);
        }
        set({ items: next, open: true }); // 加入同時打開側欄
      },

      removeItem: (key) =>
        set((s) => ({ items: s.items.filter((x) => makeKey(x) !== key) })),

      inc: (key) =>
        set((s) => ({
          items: s.items.map((x) =>
            makeKey(x) === key ? { ...x, qty: x.qty + 1 } : x
          ),
        })),

      dec: (key) =>
        set((s) => ({
          items: s.items
            .map((x) =>
              makeKey(x) === key ? { ...x, qty: Math.max(1, x.qty - 1) } : x
            ),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: "cart-v1" }
  )
);

// 👉 推薦：用 selector 直接從 items 算小計（每次 items 變動都會重算 & 觸發重渲染）
export const selectSubtotal = (s: CartState) =>
  s.items.reduce((sum, it) => sum + it.price * it.qty, 0);

// 也常會用到的 key/長度 selector
export const selectItems = (s: CartState) => s.items;
export const selectOpen   = (s: CartState) => s.open;
export const keyOf = (i: CartItem) => `${i.id}__${JSON.stringify(i.options||{})}`;
