"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

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

/** * 簡潔購物車 Icon（含數量徽章）
 * 修改：接收 isScrolled 參數，根據狀態切換背景與圖示顏色 
 */
function CartButton({ count = 0, onClick, isScrolled }) {
  return (
    <Link
      href="/cart"
      type="button"
      onClick={onClick}
      aria-label={`購物車，內有 ${count} 件商品`}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors duration-300 ${
        isScrolled
          ? "bg-white/90 hover:bg-white text-slate-800" // 滾動後：白底深色字
          : "bg-transparent hover:bg-white/20 text-white" // 置頂時：透明底白色字
      }`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        className="currentColor" // 移除 text-slate-800，改用 currentColor 繼承父層顏色
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

/** Mobile Drawer（<= md） */
function MobileDrawer({
  open,
  onClose,
  isLoggedIn,
  user,
  onLogin,
  onLogout,
  navLinks = [],
  hotItems = [],
  cartCount = 0,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (open) {
      const firstFocusable = panelRef.current?.querySelector(
        'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus?.();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="mb-overlay"
            className="fixed inset-0 z-[1199] bg-black/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          <motion.aside
            key="mb-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="主選單"
            ref={panelRef}
            className="fixed left-0 top-0 z-[1200] flex h-full w-[100%] max-w-sm flex-col bg-white shadow-2xl md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 bg-white">
              <div className="flex items-center gap-2">
                <img
                  src="/images/logo-04.png"
                  alt="LOGO"
                  className="h-7 w-auto"
                />
                <span className="text-sm text-slate-500">保健食品｜UFLOW</span>
              </div>
              <MenuToggleButton open onClick={onClose} className="h-9 w-9" />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Search */}
              <div className="px-4 py-3 border-b">
                <label className="sr-only" htmlFor="mb-search">
                  搜尋
                </label>
                <div className="flex items-center rounded-xl border px-3 py-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    className="mr-2 text-slate-500"
                  >
                    <path
                      d="M21 21l-4.3-4.3M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    id="mb-search"
                    className="w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400"
                    placeholder="搜尋商品/內容…"
                  />
                </div>
              </div>

              {/* Nav links */}
              <nav className="px-2 py-2">
                {navLinks.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={onClose}
                    className="block rounded-lg px-3 py-3 text-[15px] font-medium text-slate-800 hover:bg-slate-50"
                  >
                    {it.label}
                  </Link>
                ))}
              </nav>

              {/* 購物車與會員區塊 */}
              <div className="mx-4 my-2 border-t border-slate-200" />
              <nav className="px-2 py-1">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-[15px] font-medium text-slate-800 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      className="text-slate-700"
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
                    <span>購物車</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="min-w-[20px] rounded-full bg-rose-500 px-2 py-0.5 text-center text-xs font-semibold leading-none text-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-slate-800 hover:bg-slate-50"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="text-slate-700"
                  >
                    <path
                      d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm7 9a7 7 0 0 0-14 0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>會員資訊</span>
                </Link>
                <Link
                  href="/benefits"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-slate-800 hover:bg-slate-50"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="text-slate-700"
                  >
                    <path
                      d="M12 3l2.09 4.24L19 8l-3.5 3.4L16.18 17 12 14.8 7.82 17 9 11.4 5 8l4.91-.76L12 3z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>會員福利</span>
                </Link>
              </nav>

              {/* Hot items（簡版） */}
              {hotItems?.length > 0 && (
                <div className="px-4 pt-3 pb-3">
                  <h3 className="px-1 pb-2 text-sm font-semibold tracking-wide text-slate-500">
                    熱銷產品
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {hotItems.slice(0, 6).map((it) => (
                      <Link
                        key={it.title}
                        href={it.href}
                        onClick={onClose}
                        className="group overflow-hidden rounded-lg border"
                      >
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={it.imageUrl}
                            alt={it.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-2">
                          <p className="line-clamp-2 text-xs font-medium text-slate-800">
                            {it.title}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Account actions (Footer) */}
            <div className="mt-auto border-t px-4 py-3">
              {isLoggedIn ? (
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {user?.name || "會員"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user?.email || "member@example.com"}
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-100"
                  >
                    登出
                  </button>
                </div>
              ) : (
                <button
                  onClick={onLogin}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                >
                  會員登入
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const openerRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: "", email: "", avatarUrl: "" });
  const [cartCount, setCartCount] = useState(2);

  // 1. 滾動偵測狀態
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const refreshAuth = useCallback(async () => {
    try {
      const r = await fetch("/api/account/profile", {
        cache: "no-store",
        credentials: "include",
      });
      const js = await r.json();
      if (js.loggedIn && js.customer) {
        const display =
          js.customer.first_name?.trim() ||
          js.customer.username ||
          js.customer.email?.split("@")[0] ||
          "會員";
        setIsLoggedIn(true);
        setUser({ name: display, email: js.customer.email, avatarUrl: "" });
      } else {
        setIsLoggedIn(false);
        setUser({ name: "", email: "", avatarUrl: "" });
      }
    } catch {
      setIsLoggedIn(false);
      setUser({ name: "", email: "", avatarUrl: "" });
    }
  }, []);

  useEffect(() => {
    refreshAuth();
    const onFocus = () => refreshAuth();
    const onVis = () => document.visibilityState === "visible" && refreshAuth();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refreshAuth]);

  // 2. 監聽滾動事件
  useEffect(() => {
    const handleScroll = () => {
      // 只要滾動超過 10px 就視為 scrolled
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    // 初始化檢查
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleLogin = () => {
    const next = typeof window !== "undefined" ? window.location.pathname : "/";
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.reload();
    }
  };

  const openCart = () => {};

  const hotItems = [
    {
      title: "鎂鎂香蜂草",
      href: "/products/14",
      imageUrl: "/images/GABA鎂鎂香蜂草.png",
    },
    {
      title: "維他菌合生元",
      href: "/products/14",
      imageUrl: "/images/維他菌-合生元.png",
    },
    {
      title: "冰晶芙蓉",
      href: "/products/14",
      imageUrl: "/images/00912.png",
    },
  ];

  const navLinks = [
    { label: "首頁", href: "/" },
    { label: "品牌資訊", href: "/brand" },
    { label: "熱銷產品", href: "/products" },
    { label: "客戶分析(暫時)", href: "/admin/members" },
    { label: "保健知識", href: "/blog" },
    { label: "關於我們", href: "/about" },
    { label: "聯絡我們", href: "/contact" },
  ];

  const pathname = usePathname();
  useEffect(() => {
    refreshAuth();
  }, [pathname, refreshAuth]);

  /**
   * 根據滾動狀態設定導覽列文字顏色
   * 滾動後：深灰色 (#575656)
   * 置頂時：白色 (text-white)
   */
  const navTextColor = isScrolled
    ? "text-[#575656]"
    : "text-white hover:text-white/80 drop-shadow-sm";

  return (
    // 3. 外層容器：根據 isScrolled 切換背景（白底 / 透明）
    <div
      className={`sticky top-0 z-[1000] w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 shadow-sm backdrop-blur-md"
          : "bg-transparent shadow-none"
      }`}
    >
      {/* Header Top Bar */}
      {/* 4. 修改 Top Bar: 滾動時淺灰底/深色字；置頂時透明底/白字 */}
      <div
        className={`top-navbar py-1 transition-colors duration-300 ${
          isScrolled
            ? "bg-slate-50 text-slate-500"
            : "bg-transparent text-white/90"
        }`}
      >
        <div className="w-[87%] mx-auto grid grid-cols-2">
          <div className="text-[13px] font-light tracking-widest transition-colors duration-300">
            保健食品｜UFLOW
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div
        className={`transition-colors duration-300 ${
          isScrolled ? "bg-white" : "bg-transparent"
        }`}
      >
        {/* Divider - 滾動後才顯示分隔線 */}
        <div
          className={`h-[.5px] w-[87%] bg-gray-200 mx-auto transition-opacity duration-300 ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
        ></div>

        <div className="mx-auto flex py-2 w-[90%] items-center px-4">
          {/* Left │ 漢堡 + 熱銷產品 */}
          <div className="flex w-[40%] justify-start items-center gap-2">
            <MenuToggleButton
              open={menuOpen}
              onClick={toggleMenu}
              className="h-10 w-10 md:hidden"
              buttonRef={openerRef}
            />
            {/* 熱銷產品按鈕 - 保持白色底比較顯眼 */}
            <button
              type="button"
              onClick={toggleMenu}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 hidden md:inline-flex"
            >
              熱銷產品
            </button>

            {/* 5. 將所有導覽連結加上 navTextColor 變數，實現顏色切換 */}
            <Link
              href="/brand"
              className={`text-[14px] mx-3 tracking-wider font-semibold hidden md:inline-block transition-colors duration-300 ${navTextColor}`}
            >
              品牌資訊
            </Link>
            <Link
              href="/products"
              className={`text-[14px] mx-3 tracking-wider font-semibold hidden md:inline-block transition-colors duration-300 ${navTextColor}`}
            >
              熱銷產品
            </Link>
            <Link
              href="/blog"
              className={`text-[14px] mx-3 tracking-wider font-semibold hidden md:inline-block transition-colors duration-300 ${navTextColor}`}
            >
              保健知識
            </Link>

            <Link
              href="/cooperate"
              className={`text-[14px] mx-3 tracking-wider font-semibold hidden md:inline-block transition-colors duration-300 ${navTextColor}`}
            >
              與我們合作
            </Link>

            <Link
              href="/about"
              className={`text-[14px] mx-3 tracking-wider font-semibold hidden md:inline-block transition-colors duration-300 ${navTextColor}`}
            >
              關於我們
            </Link>

            <Link
              href="/contact"
              className={`text-[14px] mx-3 tracking-wider font-semibold hidden md:inline-block transition-colors duration-300 ${navTextColor}`}
            >
              聯絡我們
            </Link>
          </div>

          {/* Logo */}
          <div className="flex w-[20%] justify-center">
            <Link href="/" className="text-3xl tracking-wider font-normal">
              {/* 6. Logo 處理：如果是黑色 Logo，置頂時(!isScrolled)加濾鏡變白 
                     如果是彩色或白色 Logo，可以移除 brightness-0 invert 
              */}
              <img
                src="/images/logo-04.png"
                className={`w-[70px] transition-all duration-300 ${
                  !isScrolled ? "brightness-0 invert" : ""
                }`}
                alt="LOGO"
              />
            </Link>
          </div>

          {/* Right │ 購物車 + 會員 */}
          <div className="flex w-[40%] items-center justify-end gap-2">
            {/* 傳入 isScrolled 以控制右側圖示樣式 */}
            <CartButton
              count={cartCount}
              onClick={openCart}
              isScrolled={isScrolled}
            />
            <div className="hidden md:block">
              <UserMenu
                isLoggedIn={isLoggedIn}
                user={user}
                onLogin={handleLogin}
                onLogout={handleLogout}
                isScrolled={isScrolled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ====== 行動版 Drawer（<= md） ====== */}
      <MobileDrawer
        open={menuOpen}
        onClose={closeMenu}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        navLinks={navLinks}
        hotItems={hotItems}
        cartCount={cartCount}
      />

      {/* ====== 桌面版 Fullscreen 85vh 面板（>= md） ====== */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 z-[1199] bg-black/40 backdrop-blur-sm hidden md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={closeMenu}
            />
            <motion.section
              id="full-mega"
              role="dialog"
              aria-modal="true"
              className="fixed left-0 top-0 z-[1200] hidden h-[85vh] w-full bg-white md:block"
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4 md:px-8 bg-white">
                <div>
                  <h2 className="text-lg font-semibold tracking-wide">
                    熱銷產品
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">UFLOW</p>
                </div>
                <MenuToggleButton
                  open={menuOpen}
                  onClick={closeMenu}
                  className="h-10 w-10"
                />
              </div>

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
                      <Link
                        href={it.href}
                        onClick={closeMenu}
                        className="group block h-full overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-lg"
                      >
                        <div className="aspect-[4/3] overflow-hidden ">
                          <img
                            src={it.imageUrl}
                            alt={it.title}
                            className="h-full w-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
                          />
                        </div>
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

/** * 會員按鈕：桌面版
 * 修改：接收 isScrolled 參數，根據狀態切換背景與文字顏色
 */
function UserMenu({ isLoggedIn, user, onLogin, onLogout, isScrolled }) {
  const [open, setOpen] = useState(false);

  const initials =
    user?.name
      ?.trim()
      ?.split(/\s+/)
      ?.map((w) => w[0])
      .join("")
      .slice(0, 2)
      ?.toUpperCase() || "U";

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleRegister = () => {
    window.location.href = "/register";
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`inline-flex h-10 items-center gap-2 rounded-full px-2.5 pl-2 pr-3 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors duration-300 ${
          isScrolled
            ? "bg-white hover:bg-gray-50" // 滾動後：白底
            : "bg-transparent hover:bg-white/20" // 置頂時：透明底
        }`}
      >
        {isLoggedIn && user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name || "會員"}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold tracking-wide text-white">
            {initials}
          </span>
        )}

        <span
          className={`hidden text-sm sm:inline transition-colors duration-300 ${
            isScrolled ? "text-slate-700" : "text-white"
          }`}
        >
          會員
        </span>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className={`transition-all duration-300 ${open ? "rotate-180" : ""} ${
            isScrolled ? "text-slate-500" : "text-white"
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

      <AnimatePresence>
        {open && (
          <motion.div
            key="user-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 z-[1600] mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            onMouseLeave={() => setOpen(false)}
          >
            <div className="px-4 py-3">
              <p className="text-[13px] text-slate-500">
                {isLoggedIn ? "已登入會員" : "尚未登入"}
              </p>
              <p className="truncate text-sm font-medium text-slate-800">
                {isLoggedIn
                  ? user?.email || "member@example.com"
                  : "登入即可享有會員權益"}
              </p>
            </div>

            <div className="border-t border-slate-200" />

            <nav className="p-1">
              <Link
                href="/benefits"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M12 3l2.09 4.24L19 8l-3.5 3.4L16.18 17 12 14.8 7.82 17 9 11.4 5 8l4.91-.76L12 3z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                會員福利
              </Link>

              <Link
                href="/account"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
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
                會員資訊
              </Link>

              <div className="my-1 border-t border-slate-200" />

              {!isLoggedIn && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onLogin();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path
                        d="M10 7v-2a2 2 0 0 1 2-2h6v18h-6a2 2 0 0 1-2-2v-2M14 12H3m0 0 3-3m-3 3 3 3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    登入
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      handleRegister();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-indigo-600 hover:bg-indigo-50"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path
                        d="M12 5v14M5 12h14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    註冊
                  </button>
                </>
              )}

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
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
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}