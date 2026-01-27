"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "next-view-transitions";

// ============================================================================
// SVG Icons
// ============================================================================
const Icons = {
  Instagram: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
  ),
  X: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  ),
  Facebook: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  ),
  YouTube: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none"/></svg>
  ),
  TikTok: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}><path d="M9 0h1.98c.144.715.54 1.617 1.093 2.512C12.84 3.76 14.12 4.5 16 4v5.51c-.69.198-1.34.22-2 .07V9.7c-.52.05-1.04-.15-1.3-.53-.19-.27-.26-.62-.2-1v-5.6c-.03-2.06-1.35-3.8-3.3-4.37C7.4 1.5 5.25 2.5 4 4.37c-.77 1.15-1.18 2.5-1.19 3.9 0 4.42 3.58 8 8 8 2.15 0 4.1-.85 5.54-2.22l.3-.32V18c-1.6 1.4-3.7 2.25-5.84 2.25-5.1 0-9.25-4.14-9.25-9.25C1.75 5.86 5.9 1.75 11 1.75c.67 0 1.33.07 1.98.2L13 0H9z"/></svg>
  ),
  Line: (props) => (
     <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}><path d="M20.2 11.5c0-4.6-4.6-8.5-10.2-8.5S0 6.9 0 11.5c0 4.2 3.7 7.7 8.5 8.3v4.1c0 .5.5.7.8.4l4.5-4c2.8-.5 6.4-3 6.4-8.8zM6.5 13.5h-2c-.3 0-.5-.2-.5-.5v-3c0-.3.2-.5.5-.5s.5.2.5.5v2.5h1.5c.3 0 .5.2.5.5s-.2.5-.5.5zm4 0h-2c-.3 0-.5-.2-.5-.5v-3c0-.3.2-.5.5-.5h2c.3 0 .5.2.5.5s-.2.5-.5.5v3c0 .3-.2.5-.5.5zm1.5-3.5c0-.3.2-.5.5-.5s.5.2.5.5v3c0 .3-.2.5-.5.5s-.5-.2-.5-.5v-3zm5.5 1.5c0 .3-.2.5-.5.5h-1.5v1c0 .3-.2.5-.5.5s-.5-.2-.5-.5v-3c0-.3.2-.5.5-.5h2c.3 0 .5.2.5.5s-.2.5-.5.5v1h1.5c.3 0 .5.2.5.5z"/></svg>
  ),
  Mail: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  )
};

export default function Content() {
  // 清除頁面轉場狀態的邏輯保持不變
  useEffect(() => {
    document.body.classList.remove("page-transition");
    sessionStorage.removeItem("transitioning");
  }, []);

  return (
    // 修正：移除所有 bg-cover, bg-fixed, pt-[300px] 等視覺差屬性
    // 改為標準的相對定位容器，背景純色，自然堆疊
    <div className="relative w-full bg-[#EDEEEF] text-slate-800">
      <Section2 />
      <ShareWidget />
    </div>
  );
}

// ============================================================================
// Footer 內容區塊
// ============================================================================
const Section2 = () => {
  return (
    <footer className="w-full bg-[#EDEEEF] pt-16 pb-32 lg:pt-24 lg:pb-32 px-6 sm:px-10 lg:px-20 xl:px-32">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
        
        {/* === 左側：連結導覽區 (佔 8 欄) === */}
        <div className="lg:col-span-8 flex flex-col gap-12 border-b border-slate-300 lg:border-none pb-10 lg:pb-0">
          
          {/* Section 1: BRAND SITE */}
          <FooterSection 
            title="BRAND SITE" 
            links={[
              { label: "首頁", href: "/" },
              { label: "關於 UFLOW", href: "/about" },
              { label: "月刊 UFLOW", href: "/blog" },
              { label: "專題特集", href: "/features" },
              { label: "店鋪情報 / 部落格", href: "/stores" },
              { label: "最新消息", href: "/news" },
              { label: "型錄・原創雜誌", href: "/catalog" },
              { label: "素材使用規範", href: "/terms" },
              { label: "正規網路販售說明", href: "/legal" },
              { label: "公司情報", href: "/company" },
              { label: "人才招募", href: "/careers" },
              { label: "聯絡我們 (綜合受理)", href: "/contact" },
              { label: "聯絡我們 (企業客戶)", href: "/cooperate" },
              { label: "客戶支援", href: "/support" },
              { label: "網站地圖", href: "/sitemap" },
              { label: "網站使用條款", href: "/terms-of-use" },
              { label: "隱私權政策", href: "/privacy" },
            ]} 
          />

          {/* Section 2: OFFICIAL ONLINE SHOP */}
          <div className="border-t border-slate-300 w-full opacity-60 my-2 lg:hidden"></div>
          <FooterSection 
            title="OFFICIAL ONLINE SHOP" 
            links={[
              { label: "商城首頁", href: "/shop" },
              { label: "產品列表", href: "/products" },
              { label: "UFLOW FAMILY", href: "/family" },
            ]} 
          />

          {/* Section 3: ACTIVITY LOGOS */}
          <div className="border-t border-slate-300 w-full opacity-60 my-2 lg:hidden"></div>
          <FooterSection 
            title="ACTIVITY UFLOW" 
            links={[
              { label: "UFLOW LAND", href: "/land" },
              { label: "UFLOW PARK", href: "/park" },
              { label: "露營場.com", href: "/camp" },
              { label: "豆知識", href: "/tips" },
              { label: "露營飯", href: "/food" },
              { label: "活動時間軸", href: "/events" },
              { label: "玩樂大師", href: "/masters" },
              { label: "UFLOW RADIO", href: "/radio" },
            ]} 
          />
        </div>

        {/* === 右側：SNS 與 APP (佔 4 欄) === */}
        <div className="lg:col-span-4 flex flex-col items-start lg:items-center pt-4 lg:pt-0 lg:border-l lg:border-slate-300 lg:pl-10">
          
          {/* OFFICIAL SNS */}
          <div className="mb-12 text-center w-full">
            <h3 className="font-serif text-[15px] font-bold tracking-widest text-slate-800 mb-6 uppercase">
              Official SNS
            </h3>
            <div className="flex justify-center gap-6 sm:gap-8">
               <SocialIcon icon={Icons.Instagram} label="Instagram" />
               <SocialIcon icon={Icons.X} label="X" />
               <SocialIcon icon={Icons.Facebook} label="Facebook" />
               <SocialIcon icon={Icons.YouTube} label="YouTube" />
               <SocialIcon icon={Icons.TikTok} label="TikTok" />
            </div>
          </div>

          {/* LOGOS FAMILY APP */}
          <div className="mb-12 text-center w-full">
            <h3 className="font-serif text-[15px] font-bold tracking-widest text-slate-800 mb-4 uppercase">
              UFLOW FAMILY APP
            </h3>
            {/* <div className="flex justify-center items-center gap-6 text-sm font-bold text-slate-700">
               <span className="cursor-pointer hover:text-slate-500 transition-colors">iOS</span>
               <span className="h-4 w-[1px] bg-slate-400"></span>
               <span className="cursor-pointer hover:text-slate-500 transition-colors">Android</span>
            </div> */}
          </div>

          {/* English */}
          <div className="text-center w-full">
             <Link href="/en" className="font-serif text-[15px] font-bold tracking-widest text-slate-800 hover:text-slate-500 transition-colors">
               English
             </Link>
          </div>

        </div>
      </div>
      
      {/* 底部版權聲明 */}
      <div className="mt-20 text-center text-[10px] text-slate-500 tracking-wider">
        COPYRIGHT © {new Date().getFullYear()} UFLOW CORPORATION. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
};

// ============================================================================
// Helper Components
// ============================================================================

/** 連結區塊組件 */
function FooterSection({ title, links }) {
  return (
    <div className="w-full">
      <h3 className="font-serif text-[15px] font-bold tracking-widest text-slate-800 mb-4 uppercase">
        {title}
      </h3>
      <div className="flex flex-wrap gap-x-0 gap-y-2 text-[11px] sm:text-[12px] font-medium text-slate-600 leading-relaxed">
        {links.map((link, idx) => (
          <React.Fragment key={link.href + idx}>
            <Link 
              href={link.href} 
              className="hover:text-black transition-colors px-2 first:pl-0"
            >
              {link.label}
            </Link>
            {/* 分隔線：不是最後一個時顯示 */}
            {idx !== links.length - 1 && (
              <span className="text-slate-300">|</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/** SNS Icon 組件 */
function SocialIcon({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
      <div className="text-slate-800 group-hover:text-slate-500 transition-colors">
        <Icon width={24} height={24} />
      </div>
      <span className="text-[10px] font-medium text-slate-800 tracking-wide group-hover:text-slate-500 transition-colors">
        {label}
      </span>
    </div>
  );
}


// ============================================================================
// Share Widget (互動式分享條)
// ============================================================================
function ShareWidget() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClick = (e) => {
      if (isOpen && !e.target.closest("#share-widget-container")) {
        setIsOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [isOpen]);

  return (
    <div 
       id="share-widget-container"
       className="fixed bottom-0 left-0 w-full z-[9999] flex flex-col items-center justify-end pointer-events-none"
    >
       <AnimatePresence mode="wait">
          {!isOpen ? (
             // --- 狀態 A: 懸浮按鈕 (Share +) ---
             <motion.div
                key="share-button"
                className="pointer-events-auto pb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
             >
                <button
                   onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(true);
                   }}
                   // 樣式修正：確保陰影與毛玻璃質感
                   className="flex items-center gap-2 bg-[#EBEBEB]/90 border border-white/50 backdrop-blur-md px-6 py-2.5 rounded-full hover:bg-white hover:scale-105 transition-all duration-300 group"
                   style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                >
                   <span className="font-serif font-bold text-slate-800 tracking-wider text-sm group-hover:text-black">Share</span>
                   <div className="bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                      <span className="text-slate-800 text-xs font-bold leading-none mt-[1px]">+</span>
                   </div>
                </button>
             </motion.div>
          ) : (
             // --- 狀態 B: 展開的全寬色塊條 (帶陰影) ---
             <motion.div
                key="share-bar"
                className="pointer-events-auto w-full h-[60px] md:h-[70px] grid grid-cols-4"
                style={{ boxShadow: "0 -4px 30px rgba(0,0,0,0.15)" }} // 添加頂部陰影
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()} 
             >
                {/* 1. X (Twitter) */}
                <ShareBlock 
                   bg="bg-[#2C9BE5]" 
                   icon={<Icons.X width={28} height={28} className="text-white" />} 
                   onClick={() => console.log("Share X")}
                />
                
                {/* 2. LINE */}
                <ShareBlock 
                   bg="bg-[#00B900]" 
                   icon={<Icons.Line width={28} height={28} className="text-white" />} 
                   onClick={() => console.log("Share Line")}
                />
                
                {/* 3. Facebook */}
                <ShareBlock 
                   bg="bg-[#3B5998]" 
                   icon={<Icons.Facebook width={28} height={28} className="text-white" />} 
                   onClick={() => console.log("Share FB")}
                />
                
                {/* 4. Mail (點擊後關閉/或分享) */}
                <div 
                   className="relative bg-[#E04F3F] flex items-center justify-center cursor-pointer hover:brightness-110 transition-all active:brightness-95"
                   onClick={() => setIsOpen(false)} 
                >
                   <Icons.Mail width={28} height={28} className="text-white" />
                </div>
             </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
}

/** 分享條的單個色塊 */
function ShareBlock({ bg, icon, onClick }) {
   return (
      <div 
         className={`${bg} flex items-center justify-center cursor-pointer hover:brightness-110 transition-all active:brightness-95`}
         onClick={onClick}
      >
         {icon}
      </div>
   );
}