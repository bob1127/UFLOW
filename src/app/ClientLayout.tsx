// app/ClientLayout.tsx
"use client";

import { ViewTransitions } from "next-view-transitions";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer1";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import CartDrawer from "@/components/cart/CartDrawer";
import AOS from "aos";
import "aos/dist/aos.css";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";

const notoSans = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

const notoSerif = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

function ScrollToTopOnNav() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 初始化 AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
    });
  }, []);

  return (
    <ViewTransitions>
      <style jsx global>{`
        :root {
          view-transition-name: app-root;
        }
        ::view-transition-new(app-root) {
          animation: vt-fade-up 0.5s ease-in-out both;
        }
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
        @media (prefers-reduced-motion: reduce) {
          ::view-transition-new(app-root),
          ::view-transition-old(app-root) {
            animation: none !important;
          }
        }
      `}</style>

      <html
        lang="zh-Hant"
        className={`${notoSans.variable} ${notoSerif.variable}`}
      >
        <body className="min-h-screen bg-white font-sans antialiased text-[#2F2B28]">
          <ScrollToTopOnNav />

          <div
            className="fixed left-0 top-0 z-[999999999999999] w-screen"
            style={{ viewTransitionName: "none" }}
          >
            <Navbar />
          </div>

          <main className="min-h-screen">{children}</main>

          <CartDrawer />
          <Footer />
        </body>
      </html>
    </ViewTransitions>
  );
}
