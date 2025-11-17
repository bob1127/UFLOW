// app/about/page.tsx
"use client";
import { ReactLenis } from "@studio-freight/react-lenis";
import TextParallaxContentExample02 from "../../components/TextParallaxContent02/page";

export default function About() {
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

      <div className="relative py-[220px]">
        <TextParallaxContentExample02 />
      </div>

      {/* 如果想再加其他段落，可以繼續放在這裡 */}
      {/* <Indicator /> */}
      {/* <TextParallaxContentExample /> */}
    </ReactLenis>
  );
}
