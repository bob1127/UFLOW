// app/about/Client.tsx
"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import TextParallaxContentExample02 from "../../components/TextParallaxContent02/page";

interface FAQ {
  question: string;
  answer: string;
}

interface ClientProps {
  faqs?: FAQ[];
}

export default function Client({ faqs = [] }: ClientProps) {
  return (
    <ReactLenis root>
      {/* <Preloader /> */}
      {/* <Indicator /> */}

      {/* 這裡是原本的 Hero 區塊，如需再用可以解開 */}
      {/*
      <section className="section-use ">
        <div className="h-[450px] bg-[url('https://go.goinc.jp/_nuxt/img/how_to_use_bg.1019c97.jpg')] bg-cover bg-no-repeat bg-center relative">
          <div className="title absolute right-[20%] bottom-14">
            <div className="flex flex-col">
              <div className="flex  items-center">
                <div className="line w-[50px] bg-gray-500 rounded-2xl h-[2.5px] mr-4"></div>
                <span className="text-[1.2rem] text-gray-800">
                  馬上下載叫車APP，追蹤司機位置
                </span>
              </div>
              <h2 className="text-[5rem] font-extrabold">HOW TO USE ?</h2>
            </div>
          </div>
        </div>
      </section>
      */}

      <div className="relative">
        {/* 載入你的視差滾動特效 */}
        <TextParallaxContentExample02 />
      </div>

      {/* 🌟 品牌常見問題 FAQ 區塊 (符合 Google SEO 可見性規範) */}
      {faqs && faqs.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                品牌常見問題
              </h2>
              <p className="text-gray-500">深入了解 UFLOW 的堅持與承諾</p>
            </div>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-3">
                    <span className="text-blue-500 shrink-0">Q.</span>
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-gray-600 leading-relaxed flex items-start gap-3">
                    <span className="text-teal-600 font-bold shrink-0">A.</span>
                    <span>{faq.answer}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </ReactLenis>
  );
}
