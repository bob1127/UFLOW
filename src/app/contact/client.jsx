"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, Mail, Clock, Send, CheckCircle } from "lucide-react";

// 動畫設定
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function ContactPage() {
  const [formState, setFormState] = useState("idle"); // idle, submitting, success

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState("submitting");

    // 模擬 API 請求
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFormState("success");
  };

  return (
    <main className="min-h-screen bg-white pt-24 pb-20">
      {/* 標題區 */}
      <section className="container mx-auto px-6 mb-16 text-center">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">聯絡我們</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            無論是產品諮詢、合作提案或是任何建議，歡迎隨時與我們聯繫。
            <br />
            慶安有福團隊將竭誠為您服務。
          </p>
        </motion.div>
      </section>

      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* 左側：聯絡資訊 */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-10"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 relative inline-block">
                慶安有福有限公司
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                我們致力於提供高品質的健康照護方案。如果您對我們的產品有任何疑問，或需要專業的健康諮詢，請透過以下方式聯繫我們。
              </p>
            </div>

            <div className="space-y-6">
              {/* 電話 */}
              <motion.div
                variants={fadeInUp}
                className="flex items-start gap-4"
              >
                <div>
                  <h3 className="font-bold text-gray-900">聯絡電話</h3>
                  <a
                    href="tel:0978138979"
                    className="text-gray-600 hover:text-blue-600 transition block mt-1 text-lg tracking-wide font-medium"
                  >
                    0978-138-979
                  </a>
                  <span className="text-sm text-gray-400">
                    週一至週五 09:00 - 18:00
                  </span>
                </div>
              </motion.div>

              {/* Email */}
              <motion.div
                variants={fadeInUp}
                className="flex items-start gap-4"
              >
                <div>
                  <h3 className="font-bold text-gray-900">電子信箱</h3>
                  <a
                    href="mailto:service@example.com"
                    className="text-gray-600 hover:text-blue-600 transition block mt-1"
                  >
                    uflowspace@gmail.com
                  </a>
                  <span className="text-sm text-gray-400">
                    我們通常在 24 小時內回覆
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Google Map 嵌入區塊 (佔位符) */}
            {/* <motion.div
              variants={fadeInUp}
              className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-200 mt-8"
            >
          
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                <span className="flex items-center gap-2">
                  <MapPin size={16} /> Google Maps Placeholder
                </span>
              </div>
            </motion.div> */}
          </motion.div>

          {/* 右側：聯絡表單 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-50 p-8 md:p-10 rounded-3xl border border-gray-100"
          >
            {formState === "success" ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-fade-in">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  訊息已發送
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto mb-8">
                  感謝您的聯繫，我們會儘快由專人與您聯絡。
                </p>
                <button
                  onClick={() => setFormState("idle")}
                  className="px-6 py-2 border border-gray-300 rounded-full text-sm hover:bg-white transition"
                >
                  發送另一則訊息
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    線上諮詢
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
                      placeholder="如何稱呼您"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700"
                    >
                      聯絡電話 <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      id="phone"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
                      placeholder="0912-345-678"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    電子信箱
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
                    placeholder="example@mail.com"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="text-sm font-medium text-gray-700"
                  >
                    詢問主旨
                  </label>
                  <select
                    id="subject"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white text-gray-600"
                  >
                    <option>產品諮詢</option>
                    <option>訂單問題</option>
                    <option>企業採購 / 合作</option>
                    <option>其他</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-gray-700"
                  >
                    訊息內容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    id="message"
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white resize-none"
                    placeholder="請告訴我們您的需求..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="w-full bg-[#2b3742] text-white font-bold text-lg py-4 rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {formState === "submitting" ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      發送中...
                    </>
                  ) : (
                    <>
                      確認送出 <Send size={18} />
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-400 mt-4">
                  提交表單即表示您同意我們的隱私權政策，我們將嚴格保護您的個人資訊。
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
