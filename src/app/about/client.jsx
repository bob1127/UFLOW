"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Leaf, FlaskConical, ShieldCheck, HeartHandshake } from "lucide-react";
import Link from "next/link";
// 動畫設定
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// 核心價值資料 [cite: 16-21]
const values = [
  {
    title: "植萃天然",
    desc: "嚴選全球頂級天然原料，回歸純粹的營養補給。",
    icon: <Leaf className="w-8 h-8 text-green-600" />,
    color: "bg-green-50",
  },
  {
    title: "科學創新",
    desc: "與全球領先科研機構合作，以實證數據打造高效配方。",
    icon: <FlaskConical className="w-8 h-8 text-blue-600" />,
    color: "bg-blue-50",
  },
  {
    title: "透明信任",
    desc: "全成分公開透明，通過台灣專業機構檢驗，安心無負擔。",
    icon: <ShieldCheck className="w-8 h-8 text-teal-600" />,
    color: "bg-teal-50",
  },
  {
    title: "關懷共鳴",
    desc: "傾聽使用者的真實需求，打造符合繁忙生活的健康節奏。",
    icon: <HeartHandshake className="w-8 h-8 text-rose-600" />,
    color: "bg-rose-50",
  },
];

// 專業團隊名單 [cite: 41-50]
// 註：圖片路徑請替換為您實際的專家照片
const teamMembers = [
  { name: "林智亨", title: "中醫師", image: "/images/people/1.jpg" },
  {
    name: "鄭玲君",
    title: "營養師",
    image: "/images/people/2.jpg",
  },
  { name: "林奎妙", title: "藥師", image: "/images/people/3.jpg" },
  {
    name: "陳安浚",
    title: "驗光師",
    image: "/images/people/4.jpg",
  },
  { name: "戴淑娟", title: "藥師", image: "/images/people/5.jpg" },
  {
    name: "葉孟娟",
    title: "諮商心理師",
    image: "/images/people/6.jpg",
  },
];

export default function AboutPage() {
  return (
    <main className="w-full bg-white text-[#2b3742] overflow-hidden pt-20">
      {/* 1. Hero Section：品牌標語 [cite: 1-4] */}
      <section className="relative w-full h-[90vh] min-h-[500px] flex items-center justify-center bg-[url('/images/products/鎂鎂香蜂草.png')] bg-center bg-no-repeat bg-cover">
        {/* ▼▼▼ 新增：黑色透明遮罩 (Overlay) ▼▼▼ */}
        {/* inset-0: 填滿父層 / bg-black/50: 黑色50%透明度 / z-0: 確保在文字下方 */}
        <div className="absolute inset-0 bg-black/50 z-0" />

        {/* 背景裝飾圓 */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full border border-gray-200/50 opacity-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-blue-50 to-purple-50 blur-3xl opacity-60" />

        {/* 內容區塊 (維持 relative z-10 以確保浮在遮罩上) */}
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center gap-6"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl text-white md:text-6xl font-bold leading-tight"
            >
              養分循環補給 <br />
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="max-w-xl text-lg text-gray-200 mt-4 leading-relaxed"
            >
              我們相信，健康是一種生活方式，<br></br>
              也是一種簡單、自然且富有活力的人生。
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 2. 品牌故事：左圖右文 [cite: 7, 9, 10] */}
      <section className="py-24 container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative aspect-[4/3]  overflow-hidden"
          >
            {/* 請替換為 PDF P.2 的雙人形象照或類似風格照片 */}
            <Image
              src="/images/about/抗氧封存：PUREWAY-C® 複方維生素 C.png"
              alt="UFLOW Brand Story"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          <motion.div
            className="w-full lg:w-1/2 flex flex-col gap-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-2 relative inline-block">
              我們的願景
            </h2>
            <h3 className="text-xl font-medium text-gray-800">
              打造每個人在繁忙生活中的健康節奏
            </h3>
            <div className="text-gray-600 leading-8 space-y-4">
              <p>
                UFLOW
                是一家以提供高品質健康產品為核心的品牌。我們的研發精神在於將
                <strong className="text-gray-900 mx-1">
                  科學方法應用於天然原料
                </strong>
                ，以科技養護身心。
              </p>
              <p>
                我們選擇與全球領先的科學研究機構合作，確保每一款產品都符合最嚴格的品質標準，並能有效促進身心健康。從日常生活出發，為您找回身體原本的循環與平衡。
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              UFLOW 新概念
            </h2>
            <div className="w-12 h-1 bg-blue-500 mx-auto my-6 rounded-full"></div>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              堅持四大原則，以科學與自然的完美平衡，為您的健康嚴格把關。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {values.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col items-center text-center"
              >
                {/* 圖示區塊：拿掉卡片，保留純粹的圓形與圖示 */}
                <div
                  className={`w-20 h-20 rounded-full ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ease-out`}
                >
                  {/* 稍微調整 Icon 大小以符合新的比例 */}
                  <div className="scale-110">{item.icon}</div>
                </div>

                {/* 文字內容 */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-7 text-sm px-2">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 專家團隊  */}
      <section className="py-24 container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="text-blue-600 font-bold tracking-wider text-sm uppercase block mb-2">
            PROFESSIONAL TEAM
          </span>
          <h2 className="text-3xl font-bold">UFLOW 專家一致推薦</h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            我們的產品由醫師、營養師、藥師等專業人士共同研發與推薦，結合醫學專業與營養科學，給您最安心的選擇。
          </p>
        </motion.div>

        {/* 專家 Grid - 模擬 PDF P.8 的排版 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {teamMembers.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center group"
            >
              <div className="w-full aspect-[3/4] relative rounded-xl overflow-hidden mb-4 bg-gray-100">
                {/* 預設佔位圖，請換成真實照片 */}
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500  "
                />
              </div>
              <h4 className="font-bold text-lg">{member.name}</h4>
              <span className="text-sm text-gray-500">{member.title}</span>
            </motion.div>
          ))}
        </div>

        {/* 底部信任標章文字 [cite: 37-39] */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 md:gap-12 border-t border-gray-100 pt-12">
          {["國際原料廠商", "生醫產業碩博士團隊", "台灣專業檢驗機構認證"].map(
            (text, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-gray-600 font-medium"
              >
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                {text}
              </div>
            )
          )}
        </div>
      </section>

      {/* 5. CTA 區塊 */}
      <section className="py-20 bg-[#2b3742] text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">
            準備好找回生活的健康節奏了嗎？
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            探索我們為您精心打造的科學營養配方，開始您的 UFLOW 之旅。
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-[#2b3742] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg shadow-white/10"
          >
            前往選購商品
          </Link>
        </div>
      </section>
    </main>
  );
}
