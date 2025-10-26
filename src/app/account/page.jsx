"use client";

import React, { useState, useEffect } from "react";
import { FavoriteSpots } from "../../components/FavoriteSpotsList";

const TABS = [
  { key: "favorites", label: "我的收藏" },
  { key: "itineraries", label: "行程紀錄" },
  { key: "settings", label: "帳號設定" },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("favorites");
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    // 如果網址 query 有帶 tab，可以根據參數切換 tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam && TABS.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "favorites":
        return <FavoriteSpots spots={spots} setSpots={setSpots} />;
      case "itineraries":
        return (
          <div className="text-black bg-white p-6 space-y-6">
            <h2 className="text-lg font-semibold">旅遊排程結果</h2>
            <div className="space-y-4 ">
              {[1, 2].map((day) => (
                <div
                  key={day}
                  className="rounded border border-zinc-300 bg-white p-4 shadow"
                >
                  <h3 className="text-base font-medium mb-2">Day {day}</h3>
                  <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                    <li>09:00 集合出發</li>
                    <li>10:00 抵達景點 A</li>
                    <li>12:00 午餐時間</li>
                    <li>14:00 景點 B</li>
                    <li>16:30 景點 C</li>
                    <li>18:00 返回飯店</li>
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 border rounded bg-zinc-50 text-sm text-zinc-700">
              <p className="font-medium">預估花費：</p>
              <ul className="list-disc pl-5 mt-1">
                <li>包車費用：NT$ 4,500 / 天</li>
                <li>門票費用：約 NT$ 300 / 人</li>
                <li>餐飲預估：NT$ 500 / 人</li>
              </ul>
              <p className="mt-2 font-semibold">
                總預估：NT$ 10,800（2 天 2 人）
              </p>
            </div>
          </div>
        );
      case "settings":
        return <div className="text-white p-6">帳號設定內容（開發中）</div>;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#f64e2d] pt-[250px] pb-20">
      <div className="mx-auto w-full max-w-4xl px-4">
        <h1 className="mb-6 text-2xl font-semibold text-black">會員中心</h1>
        <div className="relative ">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-zinc-700 z-0" />
          <div className="relative z-10 flex gap-2">
            {TABS.map((tab) => (
              <div
                key={tab.key}
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab(tab.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setActiveTab(tab.key);
                  }
                }}
                className={`cursor-pointer pb-2 px-4 text-sm font-medium transition-all w-[160px] flex justify-center pt-2 !rounded-tr-[18px] !rounded-tl-[18px] duration-300 ${
                  activeTab === tab.key
                    ? "bg-white text-black border-2 border-black !border-b-0 rounded-t-lg shadow-md -mb-[1px] border-b-transparent"
                    : "text-white"
                }`}
              >
                {tab.label}
              </div>
            ))}
          </div>
        </div>

        <div className="border-2 !border-t-0 border-black">
          {renderContent()}
        </div>
      </div>
    </main>
  );
}
