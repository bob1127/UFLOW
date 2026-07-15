// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // CSS 在這裡引入
import ClientLayout from "./ClientLayout"; // 引入剛剛拆分出去的組件

// ✨ 這裡設定全域標題與 ICO
export const metadata: Metadata = {
  title: "UFLOW", // 這裡輸入你的網站名稱
  description: "UFLOW Health & Lifestyle", // 這裡輸入描述
  icons: {
    icon: "/images/logo/uflow.ico", // 設定 favicon 路徑
    shortcut: "/images/logo/uflow.ico",
    apple: "/images/logo/uflow.ico", // 如果需要 Apple Touch Icon 也可設一樣
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 直接回傳 ClientLayout，因為 ViewTransitions 需要包住 html 標籤
    <ClientLayout>{children}</ClientLayout>
  );
}
