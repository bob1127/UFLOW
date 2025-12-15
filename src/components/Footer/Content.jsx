import React from "react";
import { useEffect } from "react";
import Marquee from "react-fast-marquee";
import AnimatedLink from "../AnimatedLink";
import Image from "next/image";
import Link from "next/link";
import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish-input";

export default function Content() {
  // ✅ 修正卡住滾動的 bug：每次進入頁面都清除 .page-transition
  useEffect(() => {
    document.body.classList.remove("page-transition");
    sessionStorage.removeItem("transitioning"); // 順便清除狀態
  }, []);

  return (
    <div
      id="dark-section"
      className="pb-2 pt-20 sm:pt-[300px] md:pt-[360px] bg-[#f7f7f7] xl:pt-[380px] 2xl:pt-[350px] bg-[url('/images/hero-img/footer03.png')] bg-left bg-no-repeat bg-cover py-8 2xl:px-[200px] lg:px-[150px] px-[40px] h-full w-full flex flex-col justify-center"
    >
      <Section2 />
      <div className="md:w-1/2 max-w-[900px] flex justify-start"></div>
    </div>
  );
}

const Section2 = () => {
  // 1. 定義 Input 的提示文字
  const placeholders = [
    "輸入 Email 訂閱電子報...",
    "獲得最新健康資訊...",
    "加入會員享專屬優惠...",
  ];

  // 2. 定義處理函式
  const handleChange = (e) => {
    console.log(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("submitted");
  };

  return (
    <footer className="border-t border-gray-200 pt-20 bg-[#f7f7f7] backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        {/* 上半部：資訊分欄 */}
        <div className="grid gap-12 lg:grid-cols-12">
          {/* 左側：品牌 Logo 與 公司資訊 (佔 7 欄) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* (已移除這裡錯誤放置的 Input) */}

            <div>
              <div className="text-3xl font-extrabold tracking-tight text-[#2b3742] mb-2">
                UFLOW
              </div>
              <h2 className="text-sm font-bold text-gray-900 tracking-wide">
                慶安有福有限公司
              </h2>
            </div>

            {/* 聯絡資訊 */}
            <div className="text-sm text-gray-600 space-y-2 leading-relaxed">
              <p className="flex items-center gap-2">
                <span className="font-medium text-gray-900">聯絡電話：</span>
                <a
                  href="tel:0978138979"
                  className="hover:text-blue-600 transition"
                >
                  0978-138-979
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium text-gray-900">服務時間：</span>
                <span>週一至週五 09:00 - 18:00</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium text-gray-900">電子信箱：</span>
                <a
                  href="mailto:service@uflow.com.tw"
                  className="hover:text-blue-600 transition"
                >
                  service@uflow.com.tw
                </a>
              </p>
            </div>

            {/* 主選單 (中文) */}
            <nav className="mt-4">
              <ul className="flex flex-wrap gap-x-8 gap-y-3 font-medium text-gray-800">
                <li>
                  <Link
                    href="/products"
                    className="hover:text-blue-600 transition relative group"
                  >
                    全系列商品
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-blue-600 transition relative group"
                  >
                    營養知識
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-blue-600 transition relative group"
                  >
                    關於我們
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cooperate"
                    className="hover:text-blue-600 transition relative group"
                  >
                    合作資訊
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* 右側：訂閱電子報 與 認證標章 (佔 5 欄) */}
          <div className="lg:col-span-5 flex flex-col lg:items-end gap-8">
            {/* ▼▼▼ 已替換：原本的社群 Icons 改為 Input ▼▼▼ */}
            <div className="w-full max-w-sm">
              <label className="mb-3 block text-sm font-medium text-gray-500 lg:text-right">
                訂閱電子報，獲取最新健康資訊
              </label>
              <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onChange={handleChange}
                onSubmit={onSubmit}
              />
            </div>
            {/* ▲▲▲ 替換結束 ▲▲▲ */}

            {/* B Corp 或其他認證圖片 */}
            <div className="shrink-0">
              <Image
                src="/images/logo-01.png"
                alt="UFLOW Certified"
                width={300}
                height={100}
                className="w-[140px] opacity-90 grayscale hover:grayscale-0 transition duration-500"
              />
            </div>
          </div>
        </div>

        {/* 下半部：版權與條款 */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-gray-200 pt-8 text-xs text-gray-500 sm:flex-row">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <li>
              <Link href="/contact" className="hover:text-gray-900 transition">
                聯絡我們
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-gray-900 transition">
                隱私權政策
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-gray-900 transition">
                服務條款
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:text-gray-900 transition">
                退換貨說明
              </Link>
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center">
            <span>© {new Date().getFullYear()} Qing An You Fu Co., Ltd.</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a
              href="https://www.jeek-webdesign.com.tw"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition"
            >
              Design by 極客網頁設計
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
