"use client";
import Wrap from "../../components/PageWrapper";
import Preloader from "../../components/Preloader/index";
import { ReactLenis } from "@studio-freight/react-lenis";
import Image from "next/image";
import Slider from "../../components/InterectSlider/page";
import TextParallaxContentExample from "../../components/TextParallaxContent/page";
import TextParallaxContentExample02 from "../../components/TextParallaxContent02/page";
import Link from "next/link";
import Indicator from "../../components/ItemInIndicator/page";
export default function About() {
  return (
    <ReactLenis
      root
      options={{
        duration: 2, // 時間越高越有阻力
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // 自訂 easing（柔順感）

        direction: "vertical",
        gestureDirection: "vertical",

        touchMultiplier: 1.5,
        wheelMultiplier: 1.2,
      }}
    >
      <>
        {/* <Preloader /> */}
        {/* <Indicator /> */}

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

        <div className="relative py-[220px]">
          <TextParallaxContentExample02 />
        </div>
        {/* <Indicator /> */}
        {/* <TextParallaxContentExample /> */}
      </>
    </ReactLenis>
  );
}
