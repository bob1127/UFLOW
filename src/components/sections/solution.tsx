"use client";

import FlickeringGrid from "../magicui/flickering-grid";
import Ripple from "../magicui/ripple";
import Safari from "../safari";
import Section from "../section";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
const features = [
  {
    title: "網頁UX規劃、UI設計",
    description:
      "設計具有良好的互動體驗網站，不僅能留住您的顧客、也能讓您的網頁排名更加靠前",
    className: "hover:bg-red-500/10 transition-all duration-500 ease-out",
    content: (
      <>
        <Image
          src="/images/網頁ui設計_Figma-極客網頁設計.png"
          alt="網頁ui設計-極客網頁設計"
          width={400}
          height={300}
          placeholder="empty"
          loading="lazy"
        ></Image>
      </>
    ),
  },
  {
    title: "網頁seo優化",
    description:
      "改善您的網頁結構，優化網頁速度。使您的網站在搜尋引擎排名更靠前！",
    className:
      "order-3 xl:order-none hover:bg-blue-500/10 transition-all duration-500 ease-out",
    content: (
      <Image
        src="/images/網頁結構優化-極客網頁設計.png"
        alt="網頁結構優化-極客網頁設計"
        width={800}
        height={600}
        placeholder="empty"
        loading="lazy"
      ></Image>
    ),
  },
  {
    title: "網頁數據分析",
    description:
      "分析使用者行為，使用者來訪數據。分析資料並且找出問題點改善，或加強。使您的網站行銷策略更有效率！",
    className:
      "md:row-span-2 hover:bg-orange-500/10 transition-all duration-500 ease-out",
    content: (
      <div className="overflow-hidden">
        <Image
          src="/images/數據分析GA4_GTM-極客網頁設計.png"
          placeholder="empty"
          loading="lazy"
          className="absolute top-[20%] left-[30%] scale-150"
          width={800}
          height={600}
          alt="數據分析GA4_GTM-極客網頁設計"
        ></Image>
      </div>
    ),
  },
  {
    title: "網頁美化｜版型設計",
    description:
      "重新設計您的網站，避免網站看起來設計感老舊，既可以增強品牌形象，也能更吸引顧客",
    className:
      "flex-row order-4 md:col-span-2 md:flex-row xl:order-none hover:bg-green-500/10 transition-all duration-500 ease-out",
    content: (
      <>
        <Ripple className="absolute -bottom-full" />
        <Image
          src="/images/網頁版型設計＿網頁改版-極客網頁設計.png"
          placeholder="empty"
          loading="lazy"
          width={800}
          height={600}
          alt="網頁版型設計＿網頁改版-極客網頁設計"
        ></Image>
      </>
    ),
  },
];

export default function Component() {
  return (
    <Section
      title="Service"
      subtitle="為您的網站提供專業的服務內容"
      description="致力於打造使用者體驗良好的網頁，讓您的網站可以為您的企業帶來實質的收益"
      className="bg-neutral-100 dark:bg-neutral-900"
    >
      <div className="mx-auto mt-16 grid max-w-sm grid-cols-1 gap-6 text-gray-500 md:max-w-3xl md:grid-cols-2 xl:grid-rows-2 md:grid-rows-3 xl:max-w-6xl xl:auto-rows-fr xl:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className={cn(
              "group relative items-start overflow-hidden bg-neutral-50 dark:bg-neutral-800 p-6 rounded-2xl",
              feature.className
            )}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: index * 0.1,
            }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="font-semibold mb-2 text-primary">
                {feature.title}
              </h3>
              <p className="text-foreground">{feature.description}</p>
            </div>
            <div className="py-10">{feature.content}</div>
            <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-neutral-50 dark:from-neutral-900 pointer-events-none"></div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
