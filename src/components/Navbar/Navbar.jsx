"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { motion, AnimatePresence } from "framer-motion";

/** 同顆按鈕：漢堡 ⇄ X 流暢變形（Framer Motion） */
function MenuToggleButton({ open, onClick, className = "", buttonRef }) {
  const spring = { type: "spring", stiffness: 260, damping: 20 };
  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label={open ? "關閉選單" : "開啟選單"}
      aria-expanded={open}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/90 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors ${className}`}
    >
      <motion.svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        aria-hidden="true"
        initial={false}
        animate={open ? "open" : "closed"}
        className="text-slate-800"
      >
        <motion.line
          x1="3"
          y1="6"
          x2="21"
          y2="6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          variants={{
            closed: { translateY: 0, rotate: 0, x1: 3, x2: 21 },
            open: { translateY: 6, rotate: 45, x1: 5, x2: 19 },
          }}
          transition={spring}
          style={{ originX: "50%", originY: "50%" }}
        />
        <motion.line
          x1="3"
          y1="12"
          x2="21"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          variants={{
            closed: { opacity: 1, x1: 3, x2: 21 },
            open: { opacity: 0, x1: 12, x2: 12 },
          }}
          transition={{ duration: 0.18 }}
        />
        <motion.line
          x1="3"
          y1="18"
          x2="21"
          y2="18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          variants={{
            closed: { translateY: 0, rotate: 0, x1: 3, x2: 21 },
            open: { translateY: -6, rotate: -45, x1: 5, x2: 19 },
          }}
          transition={spring}
          style={{ originX: "50%", originY: "50%" }}
        />
      </motion.svg>
    </motion.button>
  );
}

/** 簡潔購物車 Icon（含數量徽章） */
function CartButton({ count = 0, onClick }) {
  return (
    <Link
      href="/checkout"
      type="button"
      onClick={onClick}
      aria-label={`購物車，內有 ${count} 件商品`}
      className="relative inline-flex h-10 w-10 items-center justify-center  bg-white/90 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
    >
      {/* 購物車 SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        className="text-slate-800"
      >
        <path
          d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="20" r="1.5" fill="currentColor" />
        <circle cx="17" cy="20" r="1.5" fill="currentColor" />
      </svg>

      {/* 數量徽章 */}
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0, opacity: 0, y: -4 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -4 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-rose-500 px-1.5 text-center text-[11px] font-semibold leading-5 text-white shadow-sm"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

/** 會員按鈕：未登入顯示登入；已登入顯示頭像/縮寫 + 下拉選單 */
function UserMenu({ isLoggedIn, user, onLogin, onLogout }) {
  const [open, setOpen] = useState(false);
  const initials =
    user?.name
      ?.trim()
      ?.split(/\s+/)
      ?.map((w) => w[0])
      .join("")
      .slice(0, 2)
      ?.toUpperCase() || "U";

  // 關閉時機：ESC / 點外面
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={onLogin}
        className="inline-flex items-center gap-2  bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          className="text-slate-800"
        >
          <path
            d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm7 9a7 7 0 0 0-14 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        會員登入
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2  bg-white px-2.5 pl-2 pr-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        {/* 頭像或首字縮寫 */}
        {user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.name || "使用者"}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold tracking-wide text-white">
            {initials}
          </span>
        )}
        <span className="hidden text-sm text-slate-700 sm:inline">
          {user?.name || "會員"}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className={`text-slate-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 下拉選單 */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="user-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 z-[1600] mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            onMouseLeave={() => setOpen(false)}
          >
            <div className="px-4 py-3">
              <p className="text-[13px] text-slate-500">已登入</p>
              <p className="truncate text-sm font-medium text-slate-800">
                {user?.email || "member@example.com"}
              </p>
            </div>
            <div className="border-t border-slate-200" />
            <nav className="p-1">
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm7 9a7 7 0 0 0-14 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                帳戶中心
              </Link>
              <Link
                href="/orders"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                我的訂單
              </Link>
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  className="text-rose-600"
                >
                  <path
                    d="M10 7v-2a2 2 0 0 1 2-2h6v18h-6a2 2 0 0 1-2-2v-2M14 12H3m0 0 3-3m-3 3 3 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                登出
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const openerRef = useRef(null);

  // 假資料（請換成實際的 auth / cart 狀態）
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: "Nina Lee",
    email: "nina@example.com",
    avatarUrl: "",
  });
  const [cartCount, setCartCount] = useState(2);

  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // ESC 關閉 + 鎖捲動 + 回焦觸發鈕
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeMenu();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen && openerRef.current) openerRef.current.focus?.();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen, closeMenu]);

  // 展示用途的事件
  const handleLogin = () => {
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  const openCart = () => {
    /* 導到購物車或開側邊欄 */
  };

  // 【修改】在 hotItems 中加入 imageUrl 屬性
  const hotItems = [
    {
      title: "UP100 極致靜音空氣清淨機",
      href: "/product",
      imageUrl: "images/2491274-cover-Photoroom.png",
    },
    {
      title: "UP200 全域淨化旗艦款",
      href: "/product",
      imageUrl: "images/2491274-cover-Photoroom.png",
    },
    {
      title: "UP-Mini 行動清淨",
      href: "/product",
      imageUrl: "images/2491274-cover-Photoroom.png",
    },
  ];

  return (
    <div className="sticky top-0 z-[1000] w-full">
      {/* Header */}
      <div className="top-navbar py-1 bg-slate-50 ">
        <div className=" w-[87%] mx-auto grid grid-cols-2">
          <div className="text-[13px] text-slate-500 font-light tracking-widest">
            保健食品｜太保健
          </div>
        </div>
      </div>
      <div className="bg-white">
        <div className="h-[.5px] w-[87%] bg-gray-200 mx-auto "></div>
        <div className="mx-auto flex py-4 w-[90%] items-center px-4">
          {/* Left │ 漢堡 + 熱銷產品 */}
          <div className="flex w-[30%] justify-start items-center gap-2">
            <MenuToggleButton
              open={menuOpen}
              onClick={toggleMenu}
              className="h-10 w-10"
              buttonRef={openerRef}
            />
            <button
              type="button"
              onClick={toggleMenu}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              熱銷產品
            </button>

            <Link
              href="/car"
              className="text-[14px] mx-3 text-[#575656] tracking-wider font-semibold"
            >
              關於我們
            </Link>
            <Link
              href="/contact"
              className="text-[14px] mx-3 text-[#575656] tracking-wider font-semibold"
            >
              聯絡我們
            </Link>
            <Link
              href="/blog"
              className="text-[14px] mx-3 text-[#575656] tracking-wider font-semibold"
            >
              Blog
            </Link>
          </div>

          {/* Logo */}
          <div className="flex w-[40%] justify-center">
            <Link href="/" className="text-3xl tracking-wider font-normal">
              <img src="/images/logo-04.png" className="w-[70px]" alt="" />
            </Link>
          </div>

          {/* Right │ 購物車 + 會員 */}
          <div className="flex w-[30%]  items-center justify-end gap-2">
            <CartButton count={cartCount} onClick={openCart} />
            <UserMenu
              isLoggedIn={isLoggedIn}
              user={user}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>

      {/* Fullscreen, 85vh 面板 + 模糊黑遮罩 */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              key="overlay"
              className="fixed inset-0 z-[1199] bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={closeMenu}
            />

            {/* 面板 */}
            <motion.section
              id="full-mega"
              role="dialog"
              aria-modal="true"
              className="fixed left-0 top-0 z-[1200] h-[85vh] w-full bg-white"
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 上方工具列 */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4 md:px-8 bg-white">
                <div>
                  <h2 className="text-lg font-semibold tracking-wide">
                    熱銷產品
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    精選熱門型號與耗材快速導覽
                  </p>
                </div>
                <MenuToggleButton
                  open={menuOpen}
                  onClick={closeMenu}
                  className="h-10 w-10"
                />
              </div>

              {/* 內容網格 */}
              <div className="mx-auto h-[calc(85vh-68px)] max-w-[1200px] overflow-y-auto px-5 pb-10 pt-6 md:px-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {hotItems.map((it, i) => (
                    <motion.div
                      key={it.title}
                      initial={{ y: 8, opacity: 0 }}
                      animate={{
                        y: 0,
                        opacity: 1,
                        transition: { delay: 0.08 + i * 0.04, duration: 0.28 },
                      }}
                    >
                      {/* 【修改】卡片連結，現在包含圖片 */}
                      <Link
                        href={it.href}
                        onClick={closeMenu}
                        className="group block h-full overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-lg"
                      >
                        {/* 圖片容器 */}
                        <div className="aspect-[4/3] overflow-hidden ">
                          <img
                            src={it.imageUrl}
                            alt={it.title}
                            className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                          />
                        </div>

                        {/* 文字內容容器 */}
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <span className="text-[15px] font-medium text-slate-800 group-hover:text-slate-900">
                              {it.title}
                            </span>
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              className="text-slate-400 transition-colors group-hover:text-slate-600"
                            >
                              <path
                                d="M9 18l6-6-6-6"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                            人氣商品快速導覽，一鍵前往詳細頁面。
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
