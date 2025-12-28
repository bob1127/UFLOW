// app/layout.tsx
"use client";

import "./globals.css";
import "yakuhanjp";
import { ViewTransitions } from "next-view-transitions";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer1";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import CartDrawer from "@/components/cart/CartDrawer";

// 引入 AOS
import AOS from "aos";
import "aos/dist/aos.css"; // 引入 AOS 的 CSS

function ScrollToTopOnNav() {
  const pathname = usePathname();

  useEffect(() => {
    // 換頁回到頂端
    window.scrollTo({ top: 0, behavior: "auto" });
    // 如果你堅持要 "instant" 也可以保留 type cast：
    // window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 初始化 AOS
  useEffect(() => {
    AOS.init({
      duration: 800, // 動畫持續時間
      once: false, // 是否只執行一次動畫
    });
  }, []);

  return (
    <ViewTransitions>
      {/* 全域轉場動畫 */}
      <style jsx global>{`
        :root {
          view-transition-name: app-root;
        }

        /* 進場：由下往上 & 淡入 */
        ::view-transition-new(app-root) {
          animation: vt-fade-up 0.5s ease-in-out both;
        }

        /* 離場：由上往下 & 淡出 */
        ::view-transition-old(app-root) {
          animation: vt-fade-down 0.5s ease-in-out both;
        }

        @keyframes vt-fade-up {
          from {
            opacity: 0;
            transform: translateY(26px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes vt-fade-down {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(26px);
          }
        }

        /* 使用者偏好減少動效時，關閉動畫 */
        @media (prefers-reduced-motion: reduce) {
          ::view-transition-new(app-root),
          ::view-transition-old(app-root) {
            animation: none !important;
          }
        }
      `}</style>

      <html lang="zh-Hant">
        <body className="min-h-screen bg-white  text-slate-900">
          {/* 換頁自動捲回頂部 */}
          <ScrollToTopOnNav />

          {/* Navbar - 固定在最上方，不參與 view transition */}
          <div
            className="fixed left-0 top-0 z-[999999999999999] w-screen"
            style={{ viewTransitionName: "none" }}
          >
            <Navbar />
          </div>

          {/* 頁面內容，預留 Navbar 高度（64px 自己可調） */}
          <main className="min-h-screen pt-[64px]">{children}</main>

          {/* 購物車 Drawer */}
          <CartDrawer />

          {/* 頁尾 */}
          <Footer />
        </body>
      </html>
    </ViewTransitions>
  );
}
