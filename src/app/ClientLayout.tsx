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

const GTM_ID = "GTM-N58NPVF2";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

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

  // GTM：在 client 端注入（next/script 在 ViewTransitions 包住 html 時可能不會輸出）
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("gtm-js")) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js",
    });

    const script = document.createElement("script");
    script.id = "gtm-js";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(script);
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
          {/* GTM noscript 備援：無 JS 環境（少數爬蟲/使用者）仍可記錄 */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>

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
