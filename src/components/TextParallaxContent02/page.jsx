"use client";
import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
} from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import Image from "next/image";
import { useInView } from "framer-motion";
import ParallaxImage from "../ParallaxImage";
import Marquee from "react-fast-marquee";
const TextParallaxContentExample = () => {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // 圖片放大 + 上移
  const scale = useSpring(
    useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.4, 1.2]),
    { stiffness: 100, damping: 20 }
  );
  const yImg = useSpring(useTransform(scrollYProgress, [0, 1], [0, -150]), {
    stiffness: 100,
    damping: 20,
  });
  const imgOpacity = useSpring(
    useTransform(scrollYProgress, [0, 0.05, 0.85, 1], [0.6, 1, 1, 0.85]),
    { stiffness: 80, damping: 16 }
  );

  // ✅ 新寫法：blur 改成 useMotionTemplate
  const blurValue = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["6px", "0px", "2px"]
  );
  const blurFilter = useMotionTemplate`blur(${blurValue})`;

  // 左右文字滑入 + 淡入
  const leftX = useSpring(
    useTransform(
      scrollYProgress,
      [0, 0.25, 0.75, 1],
      ["-160%", "0%", "0%", "-160%"]
    ),
    { stiffness: 120, damping: 22 }
  );
  const rightX = useSpring(
    useTransform(
      scrollYProgress,
      [0, 0.25, 0.75, 1],
      ["160%", "0%", "0%", "160%"]
    ),
    { stiffness: 120, damping: 22 }
  );
  const textOpacity = useSpring(
    useTransform(scrollYProgress, [0.1, 0.3, 0.8, 0.95], [0, 1, 1, 0]),
    { stiffness: 100, damping: 20 }
  );

  return (
    <>
      <div className="bg-white">
        <section className="flex">
          <div className="left"></div>
          <div className="right"> </div>
        </section>
        <div className="portrait-container relative overflow-hidden">
          <div className="txt absolute right-[8%] top-[40%] -translate-x-1/2 z-40">
            <h2 className="text-5xl font-bold">對美味的講究</h2>
            <p className="leading-relaxed tracking-wider max-w-[550px]">
              作為美味基礎的重要原材料是「大豆」。
              為了能夠享受到大豆本來的甜味和美味，我們努力製作簡單的味道。
              其他原材料，為了不妨礙大豆的美味，我們準備了儘可能接近自然的原材料。
            </p>
            <div className="flex flex-row py-8">
              <div className="flex flex-col mr-10">
                <Image
                  src="https://coralclub.ru/rcp/templates/promarine-collagen-tripeptides/assets/best-product-first-ByYP-jMQ.svg"
                  alt=""
                  width={800}
                  height={800}
                  className="w-[70px] h-[70px]"
                  placeholder="empty"
                  loading="lazy"
                ></Image>
                <b className="mt-3">純天然成分</b>
              </div>
              <div className="flex flex-col mr-10">
                <Image
                  src="https://coralclub.ru/rcp/templates/promarine-collagen-tripeptides/assets/best-product-second-DFPnTpt2.svg"
                  alt=""
                  width={800}
                  height={800}
                  className="w-[70px] h-[70px]"
                  placeholder="empty"
                  loading="lazy"
                ></Image>
                <b className="mt-3">純天然成分</b>
              </div>
              <div data-aos="fadeUp" className="flex flex-col mr-10">
                <Image
                  src="https://coralclub.ru/rcp/templates/promarine-collagen-tripeptides/assets/best-product-third-BBToOs3r.svg"
                  alt=""
                  width={800}
                  height={800}
                  className="w-[70px] h-[70px]"
                  placeholder="empty"
                  loading="lazy"
                ></Image>
                <b className="mt-3">純天然成分</b>
              </div>
            </div>
            <div className="h-[3px] bg-[#333] w-full rounded-full"></div>
            <div className="flex justify-between">
              <span className="text-[13px] tracking-widest">
                經過國家級的驗證，專業醫生的背書
              </span>
              <span className="text-[13px] tracking-widest">
                經過國家級的驗證，專業醫生的背書
              </span>
            </div>
          </div>
          <div className="img  mt-8">
            <ParallaxImage
              src="https://coralclub.ru/rcp/templates/promarine-collagen-tripeptides/assets/promarineGlass-BZwf8QOd.png"
              alt=""
              fill
              className="object-contain "
            />
          </div>
        </div>

        {/* <section className="bg-[url('https://coralclub.ru/rcp/templates/promarine-collagen-tripeptides/assets/promarineGlass-BZwf8QOd.png')] bg-center bg-cover bg-no-repeat h-[90vh]"></section> */}
        <section className="flex h-screen w-[85%] mx-auto ">
          <div className="left w-1/2 flex justify-center items-center">
            <div className="flex-col  relative flex justify-center items-center max-w-[600px]">
              <h1 className="text-4xl font-bold">對原材料的講究</h1>
              <div className="flex flex-col p-8">
                <h2 className="text-3xl font-bold">對美味的講究</h2>
                <p>
                  作為美味基礎的重要原材料是「大豆」。
                  為了能夠享受到大豆本來的甜味和美味，我們努力製作簡單的味道。
                  其他原材料，為了不妨礙大豆的美味，我們準備了儘可能接近自然的原材料。
                </p>
              </div>
              <div className="flex flex-col p-8">
                <h2 className="text-3xl font-bold">對天然甜味劑的講究</h2>
                <p>
                  KOREDAKE使用了「羅漢果（拉坎卡）」和「赤蘚糖醇」的零卡路里天然甜味劑。
                  完全沒有使用糖和人工甜味劑。
                  不妨礙材料的優良，發揮了自然的甜味。
                </p>
              </div>
              <div className="flex flex-col p-8">
                <h2 className="text-3xl font-bold">對天然甜味劑的講究</h2>
                <p>
                  KOREDAKE使用了「羅漢果（拉坎卡）」和「赤蘚糖醇」的零卡路里天然甜味劑。
                  完全沒有使用糖和人工甜味劑。
                  不妨礙材料的優良，發揮了自然的甜味。
                </p>
              </div>
            </div>
          </div>
          <div className="right w-1/2 relative">
            <div className="absolute right-0 z-40 top-0">
              <Image
                src="/images/2491274-cover-Photoroom.png"
                alt=""
                width={800}
                height={800}
                className="w-[700px]"
                placeholder="empty"
                loading="lazy"
              ></Image>
            </div>
            <div className="absolute right-[20%] z-20 top-20">
              <Image
                src="/images/3c3vnce4cqjbowo0tetrzx0x2jbrrayr-Photoroom.png"
                alt=""
                width={800}
                height={800}
                className="w-[530px] rotate-[-45deg]"
                placeholder="empty"
                loading="lazy"
              ></Image>
            </div>
          </div>
        </section>
        <section
          ref={sectionRef}
          className="relative min-h-[230vh] bg-white" // 整段滾動長度
        >
          <div className="sticky top-0 h-screen overflow-hidden">
            {/* ✅ 圖片層 */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                scale,
                y: yImg,
                opacity: imgOpacity,
                filter: blurFilter,
              }}
            >
              <Image
                src="/images/2491274-cover-Photoroom.png"
                alt="天然成分示意"
                width={1400}
                height={900}
                priority
                className="w-[70vw] max-w-[360px] min-w-[320px] h-auto object-contain"
              />
            </motion.div>

            {/* ✅ 文字層 */}
            <div className="absolute inset-0 flex items-center justify-between px-[6vw]">
              <motion.h2
                style={{ x: leftX, opacity: textOpacity }}
                className="text-[clamp(24px,4vw,54px)] font-extrabold text-neutral-800 whitespace-nowrap select-none"
              >
                <div className=" text-outline-shadow text-6xl  font-sans tracking-[2px] uppercase">
                  NATURAL
                </div>
                對天然成分的堅持
                <div className="w-full overflow-hidden  max-w-[500px]">
                  <Marquee>
                    <div className="flex justify-center items-center w-full overflow-hidden ">
                      <div className="mx-2 flex justify-center items-center w-full">
                        <Image
                          src="https://coralclub.ru/images/labels/icon-gluten-free.svg"
                          alt=""
                          placeholder="empty"
                          loading="lazy"
                          width={200}
                          height={200}
                          className="max-w-[140px]"
                        ></Image>
                        <span className="text-base ml-2 mlr-4">
                          純天然的成分
                        </span>
                      </div>
                      <div className="mx-2 flex justify-center items-center w-full">
                        <Image
                          src="https://coralclub.ru/images/labels/icon-gluten-free.svg"
                          alt=""
                          placeholder="empty"
                          loading="lazy"
                          width={200}
                          height={200}
                          className="max-w-[140px]"
                        ></Image>
                        <span className="text-base ml-2 mlr-4">
                          純天然的成分
                        </span>
                      </div>
                      <div className="mx-2 flex justify-center items-center w-full">
                        <Image
                          src="https://coralclub.ru/images/labels/icon-gluten-free.svg"
                          alt=""
                          placeholder="empty"
                          loading="lazy"
                          width={200}
                          height={200}
                          className="max-w-[140px]"
                        ></Image>
                        <span className="text-base ml-2 mlr-4">
                          純天然的成分
                        </span>
                      </div>
                    </div>
                  </Marquee>
                </div>
              </motion.h2>

              <motion.h2
                style={{ x: rightX, opacity: textOpacity }}
                className="text-[clamp(24px,4vw,54px)]  font-extrabold text-neutral-800 whitespace-nowrap select-none"
              >
                對天然成分的堅持<br></br>
                <div className="text-[14px] max-w-[500px] text-wrap font-normal">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut
                  dolorem alias, excepturi sapiente reiciendis quos maiores
                  mollitia facere perspiciatis. Exercitationem assumenda
                  deserunt fuga aspernatur aperiam veritatis nihil, eveniet
                  aliquid. Porro.
                </div>
              </motion.h2>
            </div>

            {/* 背景漸層 */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/70" />
          </div>
        </section>
        <TextParallaxContent
          subheading="Collaborate"
          heading="Built for all of us."
        >
          <div className="space-y-32 min-h-[180vh] px-8 pt-[8vh] pb-32">
            <h1 className="text-white text-4xl">HELLO</h1>
            <ExampleContent />
          </div>
        </TextParallaxContent>
      </div>
    </>
  );
};

const TextParallaxContent = ({ subheading, heading, children }) => {
  const containerRef = useRef(null);
  return (
    <div ref={containerRef} className="relative">
      <div className="sticky top-0 h-screen z-0 overflow-hidden will-change-transform">
        <StickyBackground containerRef={containerRef} />
        <OverlayCopy
          heading={heading}
          subheading={subheading}
          containerRef={containerRef}
        />
      </div>
      <div className="relative z-10 ">{children}</div>
    </div>
  );
};

const StickyBackground = ({ containerRef }) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const rawScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]);
  const rawY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const scale = useSpring(rawScale, { damping: 30, stiffness: 120 });
  const y = useSpring(rawY, { damping: 30, stiffness: 120 });

  return (
    <motion.div
      className="absolute inset-0 bg-[url('https://coralclub.ru/rcp/templates/promarine-collagen-tripeptides/assets/promarineCollagen-x6m9vKow.png')] bg-center  bg-cover bg-no-repeat  " // 銀灰色背景
      style={{
        scale,
        y,
        transform: "translateZ(0)",
        willChange: "transform",
      }}
    />
  );
};

const OverlayCopy = ({ subheading, heading, containerRef }) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rawOpacity = useTransform(
    scrollYProgress,
    [0.15, 0.5, 0.85],
    [0, 1, 0]
  );

  const y = useSpring(rawY, { damping: 30, stiffness: 120 });
  const opacity = useSpring(rawOpacity, { damping: 30, stiffness: 120 });

  return (
    <motion.div
      style={{
        y,
        opacity,
        transform: "translateZ(0)",
        willChange: "transform",
      }}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white px-4"
    >
      <p className="mb-2 text-center text-xl md:mb-4 md:text-3xl">
        {subheading}
      </p>
      <p className="text-center text-4xl font-bold md:text-7xl">{heading}</p>
    </motion.div>
  );
};

const ExampleContent = () => {
  const txtRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: txtRef,
    offset: ["start 0.8", "end 0.2"], // 提前淡入，提前淡出
  });

  const rawOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0, 1, 1, 0]
  );
  const rawY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const opacity = useSpring(rawOpacity, { damping: 20, stiffness: 100 });
  const y = useSpring(rawY, { damping: 20, stiffness: 100 });

  return (
    <div className="w-[85%] flex flex-row max-w-[1920px] mx-auto">
      <div className="left-card relative h-[120vh] w-1/2 border border-black flex flex-row">
        <div className="card-wrap absolute z-20 top-[0%] left-[15%] h-1/3 border border-red-600 flex flex-row">
          <div className="card bg-white w-[450px] max-w-[450px] h-[550px] max-h-[500px]">
            <div className="w-full p-4">
              <Image
                src="https://coralclub.ru/rcp/templates/promarine-collagen-tripeptides/assets/maxicollagen-video-8RNlkPI1.png"
                placeholder="empty"
                loading="lazy"
                width={600}
                height={400}
                className="w-full rounded-[20px]"
                alt="card-image"
              />
            </div>
            <div className="txt p-5">
              <h3 className="text-[18px] font-bold">專業的客服人員</h3>
              <p></p>
            </div>
          </div>
        </div>
        <div className="card-wrap absolute z-20 top-[55%] left-[5%] h-1/3 border border-red-600 flex flex-row">
          <div className="card bg-white rounded-[25px] w-[450px] max-w-[450px] h-[550px] max-h-[500px]">
            <div className="w-full p-4">
              <Image
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa0MqYPgFYrkL5ViHSGpWuQOEiz8J17LUoIw&s"
                placeholder="empty"
                loading="lazy"
                width={600}
                height={400}
                className="w-full rounded-[20px]"
                alt="card-image"
              />
            </div>
            <div className="txt p-5">
              <h3 className="text-[18px] font-bold">專業的客服人員</h3>
              <p></p>
            </div>
          </div>
          {/* ✨ Smooth 淡入淡出 + Y 位移 */}
        </div>
      </div>
      <div className="right-card relative h-[120vh] justify-end w-1/2 border border-black flex flex-row">
        <div className="card-wrap absolute z-20 top-[20%] right-0 h-1/3 border border-red-600 flex flex-row">
          <div className="card bg-white rounded-[25px] w-[450px] max-w-[450px] h-[750px] max-h-[800px]">
            <div className="w-full p-4">
              <Image
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdEiHLCSsSPzvJrybxksy1gvOCPl36IqkcvA&s"
                placeholder="empty"
                loading="lazy"
                width={600}
                height={400}
                className="w-full rounded-[20px]"
                alt="card-image"
              />
            </div>
            <div className="txt p-5">
              <h3 className="text-[18px] font-bold">天然的成分</h3>
              <p className="text-[13px]">
                作為美味基礎的重要原材料是「大豆」。
                為了能夠享受到大豆本來的甜味和美味，我們努力製作簡單的味道。
              </p>
              <p></p>
            </div>
          </div>
        </div>
        <div className="card-wrap absolute z-20 bottom-[0%] right-0 h-1/3 border border-red-600 flex flex-row">
          {/* ✨ Smooth 淡入淡出 + Y 位移 */}

          <div className="card bg-white rounded-[25px] w-[450px] max-w-[450px] h-[550px] max-h-[500px]">
            <div className="w-full p-4">
              <Image
                src="https://www.nissan-nics.co.jp/wp-content/themes/nics2024/assets/images/top/img-advantage01.avif"
                placeholder="empty"
                loading="lazy"
                width={600}
                height={400}
                className="w-full rounded-[20px]"
                alt="card-image"
              />
            </div>
            <div className="txt p-5">
              <h3 className="text-[18px] font-bold">專業的客服人員</h3>
              <p></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TextParallaxContentExample;
