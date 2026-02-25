"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

// ============================================================================
// 子組件區塊
// ============================================================================

/** * 漢堡選單按鈕
 * 風格：深色線條 (適配白底)
 */
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
      className={`inline-flex items-center justify-center focus:outline-none transition-colors ${className}`}
    >
      <motion.svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        aria-hidden="true"
        initial={false}
        animate={open ? "open" : "closed"}
        className="text-slate-900"
      >
        <motion.line
          x1="3"
          y1="6"
          x2="21"
          y2="6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
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
          strokeWidth="2"
          strokeLinecap="square"
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
          strokeWidth="2"
          strokeLinecap="square"
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

/** * 購物車按鈕
 * 風格：深色 Icon (適配白底)
 */
function CartButton({ count = 0, onClick }) {
  return (
    <Link
      href="/cart"
      type="button"
      onClick={onClick}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-800 hover:bg-slate-100 transition-colors"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" className="currentColor">
        <path
          d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
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
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-rose-600 px-1.5 text-center text-[10px] font-bold leading-5 text-white shadow-sm"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

/** * 手機版側邊選單 (Mobile Drawer)
 * 顯示於 md (768px) 以下
 */
function MobileDrawer({
  open,
  onClose,
  isLoggedIn,
  user,
  onLogin,
  onLogout,
  navLinks = [],
  cartCount = 0,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (open) {
      const firstFocusable = panelRef.current?.querySelector(
        'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus?.();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            key="mb-overlay"
            className="fixed inset-0 z-[1199] bg-black/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* 側邊欄本體 */}
          <motion.aside
            key="mb-drawer"
            ref={panelRef}
            className="fixed left-0 top-0 z-[1200] flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 bg-white border-b">
              <img
                src="/images/logo-04.png"
                alt="LOGO"
                className="h-8 w-auto"
              />
              <MenuToggleButton open onClick={onClose} className="h-9 w-9" />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-2">
              <nav className="px-2">
                {navLinks.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={onClose}
                    className="block rounded-lg px-4 py-3 text-[15px] font-medium text-slate-800 hover:bg-slate-50"
                  >
                    {it.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Cart/Account Links */}
              <div className="mt-4 px-2 border-t pt-4">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg"
                >
                  <span className="font-medium text-slate-800">
                    購物車 ({cartCount})
                  </span>
                </Link>
                <Link
                  href={isLoggedIn ? "/account" : "/login"}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg"
                >
                  <span className="font-medium text-slate-800">
                    {isLoggedIn ? "會員中心" : "登入/註冊"}
                  </span>
                </Link>
              </div>
            </div>

            {/* Login Status Footer */}
            {isLoggedIn && (
              <div className="border-t p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 truncate">
                    {user?.name}
                  </span>
                  <button
                    onClick={onLogout}
                    className="text-sm text-rose-500 font-medium"
                  >
                    登出
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/** * 桌面版會員選單 (User Menu)
 */
function UserMenu({ isLoggedIn, user, onLogin, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-slate-800 hover:text-slate-600 transition-colors group"
      >
        <span className="text-[13px] font-bold tracking-wide">
          {isLoggedIn ? user.name || "會員" : "會員登入"}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute right-0 top-full mt-3 w-48 rounded-lg border border-slate-100 bg-white shadow-xl z-[1500] p-1"
            onMouseLeave={() => setOpen(false)}
          >
            {!isLoggedIn ? (
              <button
                onClick={onLogin}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 rounded-md font-medium text-slate-700"
              >
                登入 / 註冊
              </button>
            ) : (
              <>
                <Link
                  href="/account"
                  className="block px-4 py-2 text-sm hover:bg-slate-50 rounded-md font-medium text-slate-700"
                >
                  我的帳戶
                </Link>
                <button
                  onClick={onLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-md font-medium"
                >
                  登出
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// 主應用程式組件
// ============================================================================

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const openerRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: "", email: "", avatarUrl: "" });
  const [cartCount, setCartCount] = useState(2);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // 1. Auth 邏輯 (保持您的原始邏輯)
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
  }, [pathname, refreshAuth]);

  // 2. 滾動偵測 (用於陰影切換)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. 鎖定捲軸 (當選單開啟時)
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeMenu();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
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
  const hotItems = [
    {
      title: "鎂鎂香蜂草",
      // 將 href 修改為對應的 slug
      href: "/products/gaba-magnesium-lemon-balm",
      imageUrl: "/images/GABA鎂鎂香蜂草.png",
    },
    {
      title: "維他菌合生元",
      // 將 href 修改為對應的 slug
      href: "/products/synbiotics",
      imageUrl: "/images/維他菌-合生元.png",
    },
    {
      title: "冰晶芙蓉",
      // 將 href 修改為對應的 slug
      href: "/products/肽晶芙蓉",
      imageUrl: "/images/00912.png",
    },
  ];

  const navLinks = [
    { label: "關於我們", href: "/about" },
    { label: "品牌資訊", href: "/brand" },
    { label: "熱銷產品", href: "/products" },
    { label: "保健知識", href: "/blog" },
    { label: "聯絡我們", href: "/contact" },
  ];

  return (
    <>
      {/* Navbar Container 
        風格：常駐白底，滾動時陰影加深
      */}
      <header
        className={`sticky top-0 z-[1000] w-full bg-white transition-shadow duration-300 ${
          isScrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="mx-auto flex w-full justify-between px-4 lg:px-8">
          {/* ====== 左側：LOGO ====== */}
          <div className="flex items-center py-4">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Logo 圖片 */}
              <div className="relative">
                <img
                  src="/images/logo-04.png"
                  className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                  alt="UFLOW LOGO"
                />
              </div>
              {/* 文字 Logo (模擬 LOGOS 樣式) */}
              <div className="hidden xl:block">
                <p className="text-xl font-bold tracking-widest text-slate-900 leading-none">
                  UFLOW
                </p>
                <p className="text-[10px] tracking-[0.2em] text-slate-500 font-serif mt-1">
                  Enjoy Healthy Life!
                </p>
              </div>
            </Link>
          </div>

          {/* ====== 右側 (Desktop)：雙層結構 ====== */}
          <div className="hidden md:flex flex-col items-end justify-center py-2">
            {/* --- 第一排 (Row 1): 上方工具列 + 黃色 CTA --- */}
            <div className="flex items-center gap-6 mb-3">
              {/* 聯絡我們 */}
              <Link
                href="/contact"
                className="text-[12px] font-bold text-slate-600 hover:text-black flex items-center gap-1 transition-colors"
              >
                聯絡我們
                <span className="text-[10px]">▼</span>
              </Link>

              {/* 品牌家族 */}
              <div className="flex items-center gap-1 border border-slate-300 rounded-full px-3 py-1 bg-white">
                <span className="text-[14px]">∞</span>
                <span className="text-[11px] font-bold text-slate-700">
                  UFLOW FAMILY
                </span>
              </div>

              {/* 🌟 黃色 ONLINE SHOP 按鈕 */}
              <Link
                href="/products"
                className="bg-[#FCD800] hover:bg-[#ffe033] text-black h-[46px] px-8 flex items-center justify-center gap-3 transition-colors relative group overflow-hidden"
                // 使用 clip-path 模擬一點設計感 (可選)
                style={{
                  clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                }}
              >
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[15px] font-extrabold tracking-wider">
                    ONLINE SHOP
                  </span>
                  <span className="text-[10px] font-medium tracking-wide">
                    熱銷產品情報
                  </span>
                </div>
                {/* 箭頭 Icon */}
                <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-sm">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </Link>
            </div>

            {/* --- 第二排 (Row 2): 導覽連結 + 功能按鈕 --- */}
            <div className="flex items-center gap-8">
              {/* 導覽連結 */}
              <nav className="flex items-center">
                {navLinks.map((link, idx) => (
                  <React.Fragment key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[14px] font-bold text-slate-800 hover:text-slate-500 tracking-wider transition-colors px-2 relative group"
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-slate-800 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    {/* 分隔線 (除了最後一個) */}
                    {idx !== navLinks.length - 1 && (
                      <div className="w-[1px] h-3 bg-slate-300 mx-3"></div>
                    )}
                  </React.Fragment>
                ))}
              </nav>

              {/* 功能區塊 (會員/購物車/漢堡) */}
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <UserMenu
                  isLoggedIn={isLoggedIn}
                  user={user}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                />
                <CartButton count={cartCount} />
                <MenuToggleButton
                  open={menuOpen}
                  onClick={toggleMenu}
                  buttonRef={openerRef}
                  className="ml-2"
                />
              </div>
            </div>
          </div>

          {/* ====== Mobile View (md 以下顯示) ====== */}
          <div className="flex md:hidden items-center gap-3">
            <CartButton count={cartCount} />
            <MenuToggleButton
              open={menuOpen}
              onClick={toggleMenu}
              buttonRef={openerRef}
            />
          </div>
        </div>
      </header>

      {/* ====== 手機版側邊選單 ====== */}
      <MobileDrawer
        open={menuOpen}
        onClose={closeMenu}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        navLinks={navLinks}
        cartCount={cartCount}
      />

      {/* ====== Desktop 全螢幕 Mega Menu (從您原始代碼復原) ====== */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* 桌面版遮罩 */}
            <motion.div
              key="overlay"
              className="fixed inset-0 z-[1199] bg-black/40 backdrop-blur-sm hidden md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={closeMenu}
            />
            {/* 桌面版下滑面板 */}
            <motion.section
              id="full-mega"
              role="dialog"
              aria-modal="true"
              className="fixed left-0 top-0 z-[1200] hidden h-[85vh] w-full bg-white md:block shadow-2xl"
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mega Menu Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b px-8 py-5 bg-white">
                <div>
                  <p className="mt-0.5 text-sm text-slate-500">
                    探索 UFLOW 的所有商品與服務
                  </p>
                </div>
                <MenuToggleButton
                  open={menuOpen}
                  onClick={closeMenu}
                  className="h-12 w-12"
                />
              </div>

              {/* Mega Menu Content */}
              <div className="mx-auto h-[calc(85vh-88px)] max-w-[1200px] overflow-y-auto px-8 pb-10 pt-8">
                {/* 區塊 1: 熱銷推薦 */}
                <div className="mb-8">
                  <h3 className="mb-4 text-lg font-bold text-slate-800 border-l-4 border-[#FCD800] pl-3">
                    熱銷產品推薦
                  </h3>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {hotItems.map((it, i) => (
                      <motion.div
                        key={it.title}
                        initial={{ y: 8, opacity: 0 }}
                        animate={{
                          y: 0,
                          opacity: 1,
                          transition: { delay: 0.1 + i * 0.05, duration: 0.3 },
                        }}
                      >
                        <Link
                          href={it.href}
                          onClick={closeMenu}
                          className="group block h-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-lg hover:border-slate-200"
                        >
                          <div className="aspect-[16/9] w-full overflow-hidden bg-gray-50">
                            <img
                              src={it.imageUrl}
                              alt={it.title}
                              className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <span className="text-[16px] font-bold text-slate-900 group-hover:text-[#D4B200] transition-colors">
                                {it.title}
                              </span>
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                className="text-slate-300 transition-colors group-hover:text-[#FCD800]"
                              >
                                <path
                                  d="M9 18l6-6-6-6"
                                  stroke="currentColor"
                                  strokeWidth="2"
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

                {/* 區塊 2: 快速連結列表 (範例) */}
                <div className="grid grid-cols-4 gap-8 pt-6 border-t border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3">關於我們</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>
                        <Link
                          href="/brand"
                          onClick={closeMenu}
                          className="hover:text-black"
                        >
                          品牌故事
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/team"
                          onClick={closeMenu}
                          className="hover:text-black"
                        >
                          經營團隊
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3">客戶服務</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>
                        <Link
                          href="/qa"
                          onClick={closeMenu}
                          className="hover:text-black"
                        >
                          常見問題
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/shipping"
                          onClick={closeMenu}
                          className="hover:text-black"
                        >
                          運送政策
                        </Link>
                      </li>
                    </ul>
                  </div>
                  {/* 更多連結... */}
                </div>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
