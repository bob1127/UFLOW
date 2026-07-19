// app/ClientLayout.tsx
"use client";

import { ViewTransitions } from "next-view-transitions";
import Script from "next/script";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer1";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import CartDrawer from "@/components/cart/CartDrawer";
import AOS from "aos";
import "aos/dist/aos.css";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";

const GTM_ID = "GTM-N58NPVF2";

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
          {/* GTM noscript 備援：無 JS 環境（少數爬蟲/使用者）仍可記錄 */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>

          {/* GTM 主程式：afterInteractive = hydration 後載入，不阻塞首屏 LCP */}
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>

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
