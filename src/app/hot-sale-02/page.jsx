"use client";
// import { TransitionLink } from "../../components/utils/TransitionLink";
// import EmblaCarousel from "../../components/EmblaCarousel07/EmblaCarousel";
// import { AnimatedTooltip } from "../../components/ui/animated-tooltip";
import GsapText from "../../components/RevealText/index";
// import { PlaceholdersAndVanishInput } from "../../components/ui/placeholders-and-vanish-input";
// import { TextGenerateEffect } from "../../components/ui/text-generate-effect";
// import InfiniteScroll from "../../components/InfiniteScroll/page";
import Image from "next/image";
import { Timeline } from "@/components/ui/timeline";
import React from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
export default function About() {
  const data01 = [
    {
      title: "2024 年 3 月｜最新工程進度",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            第一階段：地下室工程完成（基礎結構已完工，進入地上層施作）
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="https://kakumagumi.com/cms/wp-content/uploads/2025/01/siozakisousuikan1.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://kakumagumi.com/cms/wp-content/uploads/2025/01/siozakisousuikan2.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://kakumagumi.com/cms/wp-content/uploads/2024/12/inasato71.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://kakumagumi.com/cms/wp-content/uploads/2024/12/RIMG6747.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2024 年 3 月｜最新工程進度",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            第一階段：地下室工程完成（基礎結構已完工，進入地上層施作）
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="https://kakumagumi.com/cms/wp-content/uploads/2025/01/siozakisousuikan1.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://kakumagumi.com/cms/wp-content/uploads/2025/01/siozakisousuikan2.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://kakumagumi.com/cms/wp-content/uploads/2024/12/inasato71.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://kakumagumi.com/cms/wp-content/uploads/2024/12/RIMG6747.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2024 年 3 月｜最新工程進度",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            第一階段：地下室工程完成（基礎結構已完工dd，進入地上層施作）
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="https://kakumagumi.com/cms/wp-content/uploads/2025/01/siozakisousuikan1.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://kakumagumi.com/cms/wp-content/uploads/2025/01/siozakisousuikan2.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://kakumagumi.com/cms/wp-content/uploads/2024/12/inasato71.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="https://kakumagumi.com/cms/wp-content/uploads/2024/12/RIMG6747.jpg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const backgroundImages = [
    "https://takidanifudouson.or.jp/cms/wp-content/themes/takidanifudouson/assets/images/top/img__fvbottom__image__lg@2x.jpg?rev=20201228174103",
    "https://shiroyamakumano-jinja.jp/wp/wp-content/themes/shiroyama/assets/img/about_1.jpg",
  ];
  useEffect(() => {
    const timer = setInterval(() => {
      setPrevIndex(currentIndex); // 保留上一張索引
      setCurrentIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);
  const people = [
    {
      id: 1,
      name: "John Doe",
      designation: "業務人員",
      qrCodeImage:
        "https://thumb.ac-illust.com/bd/bd2c033b5a0f028d5d0a5f63223c0781_t.jpeg",
      image:
        "https://thumb.ac-illust.com/bd/bd2c033b5a0f028d5d0a5f63223c0781_t.jpeg",
    },
    {
      id: 2,
      name: "John Doe",
      designation: "買屋看房",
      qrCodeImage:
        "https://thumb.ac-illust.com/bd/bd2c033b5a0f028d5d0a5f63223c0781_t.jpeg",
      image:
        "https://blogimg.goo.ne.jp/user_image/1c/fe/9641ac44fee5bb8525f467bac86d0fb9.jpg",
    },
    {
      id: 3,
      name: "John Doe",
      designation: "詢問價格",
      qrCodeImage:
        "https://thumb.ac-illust.com/bd/bd2c033b5a0f028d5d0a5f63223c0781_t.jpeg",
      image:
        "https://thumb.ac-illust.com/56/56a7c15a78437570e11a8252b729f35f_t.jpeg",
    },
  ];
  const initGSAPAnimations = () => {
    const ctx = gsap.context(() => {
      const images = document.querySelectorAll(".animate-image-wrapper");

      images.forEach((image, i) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: image,
            start: "top bottom",
            end: "top center",
            toggleActions: "play none none none",
            id: "imageReveal-" + i,
          },
        });

        tl.fromTo(
          image.querySelector(".overlay"),
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.7,
            ease: "power2.inOut",
          }
        )
          .to(image.querySelector(".overlay"), {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            duration: 0.7,
            ease: "power2.inOut",
          })
          .fromTo(
            image.querySelector(".image-container"),
            {
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            },
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 1.5,
              ease: "power3.inOut",
            },
            "-=0.5"
          );
      });

      ScrollTrigger.refresh();
    }, containerRef);

    return ctx; // return so we can revert later
  };

  const OPTIONS = {};

  // 這裡定義你的背景圖片

  const [showNav, setShowNav] = useState(true);
  let lastScrollY = 0;

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY) {
          setShowNav(false); // 向下滾 → 隱藏
        } else {
          setShowNav(true); // 向上滾 → 顯示
        }

        lastScrollY = currentScrollY;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <ReactLenis root className="">
      {/* <InfiniteScroll /> */}
      <div className="fixed bottom-8 z-[99999999999] left-0 w-screen">
        <div className="flex justify-center">
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: showNav ? 0 : 100 }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
            className=" bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] sm:w-[410px] h-[64px] bg-[rgba(0,0,0,0.2)] shadow-[0_0_16px_4px_#00000008] rounded-lg backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]"
          >
            <div className="flex px-6 justify-start items-center h-full">
              <div className="w-[30%]">
                <b className="text-white text-[.9rem] sm:text-[1.2rem] font-bold">
                  YI YUAN
                </b>
              </div>
              <div className="w-[45%]">
                <span className="text-gray-500 text-[.9rem]">Project - </span>
                <span className=" text-[.8rem] sm:text-[1rem] tracking-widest text-white">
                  宜園大院
                </span>
              </div>
              <div className="w-[25%]">
                <span className="text-[.8rem] text-white">2025.05.23</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <section className="section-hero w-full aspect-[500/500] sm:aspect-[1024/576] xl:aspect-[1920/768] overflow-hidden relative">
        {/* 背景圖片群組 */}
        {backgroundImages.map((bg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: i === currentIndex ? 1 : 0,
              scale: i === currentIndex ? 1.15 : 1, // 放大範圍加大
            }}
            transition={{
              opacity: { duration: 1.5, ease: "easeInOut" }, // 切換用淡入淡出
              scale: { duration: 20, ease: "linear" }, // 放大效果持續 20 秒
            }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
            style={{
              backgroundImage: `url(${bg})`,
            }}
          />
        ))}

        {/* 黑色遮罩 */}
        <div className="bg-black opacity-40 w-full h-full absolute top-0 left-0 z-10" />

        {/* 文字區塊 */}
        <div className="hero-title  w-1/2 absolute left-[4%] top-[90%] z-20">
          <div className="text-center px-4">
            <GsapText
              text="Built for Living."
              id="gsap-intro"
              fontSize="2.6rem"
              fontWeight="200"
              color="#fff"
              lineHeight="60px"
              className="text-center !text-white tracking-widest inline-block mb-0 h-auto"
            />
          </div>
          <div className="text-center px-4">
            <GsapText
              text="Yi Yuan"
              id="gsap-intro"
              fontSize="1.5rem"
              fontWeight="200"
              color="#fff"
              lineHeight="30px"
              className="text-center !text-white tracking-widest inline-block mb-0 h-auto"
            />
          </div>
        </div>
      </section>

      <section className="w-full pt-20 bg-custom-gradient section-content">
        <section className="mx-auto  max-w-[1920px]">
          <div className="flex w-[80%] flex-col md:flex-row h-full justify-center items-center mx-auto">
            <div className=" w-full md:w-1/2 p-5  ">
              <GsapText
                text="持續進化的設計"
                id="gsap-intro"
                fontSize="1.3rem"
                fontWeight="200"
                color="#fff"
                lineHeight="60px"
                className="text-left  tracking-widest inline-block mb-0 h-auto"
              />

              <p className="text-[.85rem]   tracking-widest leading-loose text-gray-100 ">
                從入口連接高架下的通道採用了工業風吊燈。結合異國情調的商店排列和霓虹招牌，營造出混沌又富有活力的氛圍。
              </p>
            </div>
            <div className=" w-full md:w-1/2 flex justify-center items-center">
              <div className="max-w-[330px] ">
                <Image
                  src="/images/JPOM9734.jpg"
                  placeholder="empty"
                  loading="lazy"
                  alt=""
                  width={1500}
                  height={800}
                  className="w-full"
                ></Image>
              </div>
            </div>
          </div>
        </section>

        <section className="section-footer p-3 lg:p-10 2xl:p-20">
          <div className="mx-auto w-[90%] 2xl:w-[80%] py-20">
            <div className="top flex justify-between flex-col md:flex-row">
              <h3 className="text-white text-[1.8rem] font-bold">
                YI YUAN BUILDING
              </h3>
              <button class="group relative inline-flex text-[1rem] 2xl:text-[1.2rem] h-12 items-center justify-center  border-b-1 border-white px-6 font-medium text-neutral-100">
                <span>Hover me</span>
                <div class="relative ml-1 h-5 w-5 overflow-hidden">
                  <div class="absolute transition-all duration-200 group-hover:-translate-y-5 group-hover:translate-x-4">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                    >
                      <path
                        d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 -translate-x-4"
                    >
                      <path
                        d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
            <div className="middle flex  flex-col md:flex-row">
              <div className=" w-full md:w-[40%]">
                <div className="grid grid-cols-2">
                  <div className="flex py-8 flex-col">
                    <div className="flex flex-col">
                      <b className="text-gray-400 text-[.8rem]">新案件賞</b>
                      <span className="text-[.8rem] text-white mt-1">
                        一青隱
                      </span>
                      <span className="text-[.8rem] text-white mt-1">
                        宜園大院
                      </span>
                    </div>
                    <div className="flex mt-8 flex-col">
                      <b className="text-gray-400 text-[.8rem]">NEWS</b>
                      <span className="text-[.8rem] text-white mt-1">
                        宜園大院開工典禮
                      </span>
                      <span className="text-[.8rem] text-white mt-1">
                        宜園大院
                      </span>
                    </div>
                  </div>
                  <div className="flex pl-8 py-8 flex-col">
                    <div className="flex flex-col">
                      <b className="text-gray-400 text-[.8rem]">新案件賞</b>
                      <span className="text-[.8rem] text-white mt-1">
                        一青隱
                      </span>
                      <span className="text-[.8rem] text-white mt-1">
                        宜園大院
                      </span>
                    </div>
                    <div className="flex mt-8 flex-col">
                      <b className="text-gray-400 text-[.8rem]">NEWS</b>
                      <span className="text-[.8rem] text-white mt-1">
                        宜園大院開工典禮
                      </span>
                      <span className="text-[.8rem] text-white mt-1">
                        宜園大院
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className=" w-full md:w-[60%] pb-5 flex justify-start md:justify-end">
                <div className=" flex flex-col items-end justify-end">
                  <div className="flex flex-row items-center">
                    <span className="text-[.8rem] mr-2 mt-1 text-gray-400">
                      Public 2024 Building By
                    </span>
                    <span className="text-[.8rem]  text-white mt-1">
                      宜園大院開工典禮
                    </span>
                  </div>
                  <div className="flex flex-row items-center mt-1">
                    <span className="text-[.8rem] mr-2 mt-1 text-gray-400">
                      Public 2024 Building By
                    </span>
                    <span className="text-[.8rem]  text-white mt-1">
                      宜園大院開工典禮
                    </span>
                  </div>
                  <div className="flex flex-row items-center mt-1">
                    <span className="text-[.8rem] mr-2 mt-1 text-gray-400">
                      Public 2024 Building By
                    </span>
                    <span className="text-[.8rem] hover:border-b-1 border-white duration-500  text-white mt-1">
                      宜園大院開工典禮
                    </span>
                  </div>
                  <div className="flex flex-row items-center mt-1">
                    <span className="text-[.8rem] mr-2 mt-1 text-gray-400">
                      Website Sesign
                    </span>
                    <span className="text-[.8rem]  text-white mt-1">
                      極客網頁設計
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bottom mt-[10vh] md:mt-[15vh] pb-10 border-b-1 border-[#6f6f6f]">
              <div className="flex flex-row items-center mt-1">
                <span className="text-[.8rem] mr-2 mt-1 text-gray-400">
                  Website Sesign
                </span>
                <span className="text-[.95rem]  text-white mt-1">
                  極客網頁設計
                </span>
              </div>
            </div>
            <section className=" w-full mt-4">
              <span className="text-white  text-[1.4rem] mb-2">NEWS</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                <div className=" w-full mx-auto md:w-[200px] lg:w-[230px] 2xl:w-[280px] xl:w-[230px]  group ">
                  <div className="img   mx-auto  group-hover:h-[40vh] delay-75 duration-500  h-auto md:h-[33vh]  overflow-hidden">
                    <div className="animate-image-wrapper mx-auto relative w-full aspect-[4/5] md:h-full overflow-hidden ">
                      <div className="image-container relative w-full h-full">
                        <Image
                          src="https://i0.wp.com/draft.co.jp/wp-content/uploads/2025/02/AD-Awards_2024_list.jpg?fit=1280%2C1280&quality=85&strip=all&ssl=1"
                          alt="About Image 1"
                          fill
                          className="object-cover group-hover:scale-[1.05] duration-700"
                          sizes="(max-width: 768px) 90vw, (max-width: 1024px) 550px, 85vw"
                        />
                        xs
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col px-3 py-4">
                    <div className="inline-block pb-4">
                      <button
                        role="link"
                        class="relative  !inline-block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-neutral-800 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] group-hover:after:origin-bottom-left group-hover:after:scale-x-100"
                      >
                        <button
                          role="link"
                          class="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-neutral-800 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] group-hover:after:origin-bottom-left group-hover:after:scale-x-100"
                        >
                          <b className="text-[.9rem] font-bold text-white">
                            {" "}
                            「A&D Awards 2024」受賞
                          </b>
                        </button>
                      </button>
                    </div>
                    <span className="text-[.75rem] text-gray-100">
                      太陽印刷製造 InnoValley
                      在最佳工作場所類別中獲得了最高獎項。
                    </span>
                    <span className="text-[.75rem] text-gray-100">
                      Taichung - 2025.03.23
                    </span>
                  </div>
                </div>

                <div className=" w-[90%] mx-auto  md:w-[200px] lg:w-[230px] 2xl:w-[280px] xl:w-[230px]  group mx-1">
                  <div className="img   mx-auto    h-auto md:h-[36vh] group-hover:h-[44vh] delay-75 duration-500 overflow-hidden">
                    <div className="animate-image-wrapper mx-auto relative w-full aspect-[4/5] md:h-full overflow-hidden ">
                      <div className="image-container relative w-full h-full">
                        <Image
                          src="https://i0.wp.com/draft.co.jp/wp-content/uploads/2025/01/08cda1286e0f3c4616fbf38cf569aa71.jpg?fit=1920%2C1152&quality=85&strip=all&ssl=1"
                          alt="About Image 1"
                          fill
                          className="object-cover group-hover:scale-[1.05] duration-700"
                          sizes="(max-width: 768px) 90vw, (max-width: 1024px) 550px, 85vw"
                        />
                        xs
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col px-3 py-4">
                    <div className="inline-block pb-4">
                      <button
                        role="link"
                        class="relative  !inline-block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-neutral-800 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] group-hover:after:origin-bottom-left group-hover:after:scale-x-100"
                      >
                        <button
                          role="link"
                          class="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-neutral-800 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] group-hover:after:origin-bottom-left group-hover:after:scale-x-100"
                        >
                          <b className="text-[.9rem] font-bold text-white">
                            {" "}
                            「A&D Awards 2024」受賞
                          </b>
                        </button>
                      </button>
                    </div>
                    <span className="text-[.75rem] text-gray-100">
                      太陽印刷製造 InnoValley
                      在最佳工作場所類別中獲得了最高獎項。
                    </span>
                    <span className="text-[.75rem] text-gray-100">
                      Taichung - 2025.03.23
                    </span>
                  </div>
                </div>
                <div className=" w-[90%] mx-auto  md:w-[200px] lg:w-[230px] 2xl:w-[280px] xl:w-[230px]  group mx-1">
                  <div className="img   mx-auto    h-auto md:h-[26vh] group-hover:h-[33vh] delay-75 duration-500 overflow-hidden">
                    <div className="animate-image-wrapper mx-auto relative w-full aspect-[4/5] md:h-full overflow-hidden ">
                      <div className="image-container relative w-full h-full">
                        <Image
                          src="https://i0.wp.com/draft.co.jp/wp-content/uploads/2024/10/2024_tjda-site_open_top_s.jpg?fit=1920%2C1046&quality=85&strip=all&ssl=1"
                          alt="About Image 1"
                          fill
                          className="object-cover group-hover:scale-[1.05] duration-700"
                          sizes="(max-width: 768px) 90vw, (max-width: 1024px) 550px, 85vw"
                        />
                        xs
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col px-3 py-4">
                    <div className="inline-block pb-4">
                      <button
                        role="link"
                        class="relative  !inline-block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-neutral-800 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] group-hover:after:origin-bottom-left group-hover:after:scale-x-100"
                      >
                        <button
                          role="link"
                          class="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-neutral-800 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] group-hover:after:origin-bottom-left group-hover:after:scale-x-100"
                        >
                          <b className="text-[.9rem] font-bold text-white">
                            {" "}
                            「A&D Awards 2024」受賞
                          </b>
                        </button>
                      </button>
                    </div>
                    <span className="text-[.75rem] text-gray-100">
                      太陽印刷製造 InnoValley
                      在最佳工作場所類別中獲得了最高獎項。
                    </span>
                    <span className="text-[.75rem] text-gray-100">
                      Taichung - 2025.03.23
                    </span>
                  </div>
                </div>
                <div className=" w-[90%] mx-auto  md:w-[200px] lg:w-[230px] 2xl:w-[280px] xl:w-[230px]  group mx-1">
                  <div className="img   mx-auto    h-auto md:h-[30vh] group-hover:h-[35vh] delay-75 duration-500 overflow-hidden">
                    <div className="animate-image-wrapper mx-auto relative w-full aspect-[4/5] md:h-full overflow-hidden ">
                      <div className="image-container relative w-full h-full">
                        <Image
                          src="https://i0.wp.com/draft.co.jp/wp-content/uploads/2024/11/ELLE-DECOR_2412_PCichiran.jpg?fit=1920%2C1280&quality=85&strip=all&ssl=1"
                          alt="About Image 1"
                          fill
                          className="object-cover group-hover:scale-[1.05] duration-700"
                          sizes="(max-width: 768px) 90vw, (max-width: 1024px) 550px, 85vw"
                        />
                        xs
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col px-3 py-4">
                    <div className="inline-block pb-4">
                      <button
                        role="link"
                        class="relative  !inline-block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-neutral-800 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] group-hover:after:origin-bottom-left group-hover:after:scale-x-100"
                      >
                        <button
                          role="link"
                          class="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-neutral-800 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] group-hover:after:origin-bottom-left group-hover:after:scale-x-100"
                        >
                          <b className="text-[.9rem] font-bold text-white">
                            {" "}
                            「A&D Awards 2024」受賞
                          </b>
                        </button>
                      </button>
                    </div>
                    <span className="text-[.75rem] text-gray-100">
                      太陽印刷製造 InnoValley
                      在最佳工作場所類別中獲得了最高獎項。
                    </span>
                    <span className="text-[.75rem] text-gray-100">
                      Taichung - 2025.03.23
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
        <section className="relative ">
          <div className="bg-white mx-auto rounded-tr-2xl border-l-2 border-r-2 border-t-2 border-gray-400 rounded-tl-2xl  max-w-[1400px] pt-10 w-full md:w-[78%] flex  md:flex-row flex-col justify-center items-center">
            <div className="title sm:w-[70%] w-[80%] mx-auto lg::w-1/2 pl-2 sm:pl-8 lg:pl-20 h-full flex flex-col justify-between">
              <GsapText
                text="Project - 一青隱"
                id="gsap-intro"
                fontSize="1.3rem"
                fontWeight="200"
                color="#000"
                lineHeight="60px"
                className="text-left  tracking-widest inline-block mb-0 h-auto"
              />
              <div>
                <b className="text-[1/3rem] font-normal">實在的構築</b>
              </div>
            </div>
            <div className="sm:w-[70%] pr-0 md:pr-10 w-[80%] mx-auto lg::w-1/2 pt-10 flex  justify-center items-center">
              <Image
                src="https://i0.wp.com/draft.co.jp/wp-content/uploads/2023/11/7_mikan-shimokita_10.jpg?fit=2880%2C1920&quality=85&strip=all&ssl=1"
                alt=""
                placeholder="empty"
                loading="lazy"
                width={800}
                height={800}
                className="w-full max-w-[520px]"
              ></Image>
            </div>
          </div>
        </section>
      </section>
      <section>
        <Timeline data={data01} />
      </section>

      <div className="bg-white z-[99999999] py-10 bottom-section flex flex-col justify-center items-center">
        <Marquee>
          <div className="flex flex-row py-10 justify-center items-center">
            <div className="h-[1px] bg-black w-[50vw]"></div>
            <div className="flex flex-col sm:flex-row justify-center items-center">
              <p className="text-[3rem] mx-4">NEWS</p>
              <button class="group relative mr-3 inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-neutral-950">
                <div class="transition duration-300 group-hover:rotate-[360deg]">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-neutral-200"
                  >
                    <path
                      d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                      fill="currentColor"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              </button>
            </div>
            <div className="h-[1px] bg-black w-[50vw]"></div>
          </div>
        </Marquee>
        <div className="flex bg-white flex-row justify-center items-center flex-wrap">
          <div className="news-item overflow-hidden group  m-1 sm:m-2 bg-[url('https://commons-shop.karimoku.com/cdn/shop/files/15411_f.jpg?v=1731306525&width=750')] bg-no-repeat relative bg-cover bg-center w-[170px] sm:w-[230px] lg:w-[270px] h-[230px]  sm:h-[300px] lg:h-[340px]">
            <div className="description absolute w-full bottom-0 h-[0%] opacity-0 group-hover:opacity-100 duration-500 group-hover:h-[40%] flex flex-col bg-white p-3">
              <p className="text-[.8rem] hidden sm:block">
                不簡單的青海路，相遇不平凡的青世代 獻給，鍾情市中心的菁英家庭
                致邀，職住共生的青創企業家
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center">
                <b className="text-[.8rem] mr-3 mt-4">
                  {" "}
                  NEWS:神隱青海│2-3房│含精裝修{" "}
                </b>
                <button class="group relative inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-neutral-950 font-medium text-neutral-200">
                  <div class="translate-x-0 transition group-hover:translate-x-[300%]">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                    >
                      <path
                        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div class="absolute -translate-x-[300%] transition group-hover:translate-x-0 duration-1000">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                    >
                      <path
                        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </button>{" "}
              </div>
            </div>
          </div>
          <div className="news-item overflow-hidden group  m-1 sm:m-2 bg-[url('https://commons-shop.karimoku.com/cdn/shop/files/15411_f.jpg?v=1731306525&width=750')] bg-no-repeat relative bg-cover bg-center w-[170px] sm:w-[230px] lg:w-[270px] h-[230px]  sm:h-[300px] lg:h-[340px]">
            <div className="description absolute w-full bottom-0 h-[0%] opacity-0 group-hover:opacity-100 duration-500 group-hover:h-[40%] flex flex-col bg-white p-3">
              <p className="text-[.8rem] hidden sm:block">
                不簡單的青海路，相遇不平凡的青世代 獻給，鍾情市中心的菁英家庭
                致邀，職住共生的青創企業家
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center">
                <b className="text-[.8rem] mr-3 mt-4">
                  {" "}
                  NEWS:神隱青海│2-3房│含精裝修{" "}
                </b>
                <button class="group relative inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-neutral-950 font-medium text-neutral-200">
                  <div class="translate-x-0 transition group-hover:translate-x-[300%]">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                    >
                      <path
                        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div class="absolute -translate-x-[300%] transition group-hover:translate-x-0 duration-1000">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                    >
                      <path
                        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </button>{" "}
              </div>
            </div>
          </div>
          <div className="news-item overflow-hidden group  m-1 sm:m-2 bg-[url('https://commons-shop.karimoku.com/cdn/shop/files/15411_f.jpg?v=1731306525&width=750')] bg-no-repeat relative bg-cover bg-center w-[170px] sm:w-[230px] lg:w-[270px] h-[230px]  sm:h-[300px] lg:h-[340px]">
            <div className="description absolute w-full bottom-0 h-[0%] opacity-0 group-hover:opacity-100 duration-500 group-hover:h-[40%] flex flex-col bg-white p-3">
              <p className="text-[.8rem] hidden sm:block">
                不簡單的青海路，相遇不平凡的青世代 獻給，鍾情市中心的菁英家庭
                致邀，職住共生的青創企業家
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center">
                <b className="text-[.8rem] mr-3 mt-4">
                  {" "}
                  NEWS:神隱青海│2-3房│含精裝修{" "}
                </b>
                <button class="group relative inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-neutral-950 font-medium text-neutral-200">
                  <div class="translate-x-0 transition group-hover:translate-x-[300%]">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                    >
                      <path
                        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div class="absolute -translate-x-[300%] transition group-hover:translate-x-0 duration-1000">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                    >
                      <path
                        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </button>{" "}
              </div>
            </div>
          </div>
          <div className="news-item overflow-hidden group  m-1 sm:m-2 bg-[url('https://commons-shop.karimoku.com/cdn/shop/files/15411_f.jpg?v=1731306525&width=750')] bg-no-repeat relative bg-cover bg-center w-[170px] sm:w-[230px] lg:w-[270px] h-[230px]  sm:h-[300px] lg:h-[340px]">
            <div className="description absolute w-full bottom-0 h-[0%] opacity-0 group-hover:opacity-100 duration-500 group-hover:h-[40%] flex flex-col bg-white p-3">
              <p className="text-[.8rem] hidden sm:block">
                不簡單的青海路，相遇不平凡的青世代 獻給，鍾情市中心的菁英家庭
                致邀，職住共生的青創企業家
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center">
                <b className="text-[.8rem] mr-3 mt-4">
                  {" "}
                  NEWS:神隱青海│2-3房│含精裝修{" "}
                </b>
                <button class="group relative inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-neutral-950 font-medium text-neutral-200">
                  <div class="translate-x-0 transition group-hover:translate-x-[300%]">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                    >
                      <path
                        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div class="absolute -translate-x-[300%] transition group-hover:translate-x-0 duration-1000">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                    >
                      <path
                        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </button>{" "}
              </div>
            </div>
          </div>
          <div className="news-item overflow-hidden group  m-1 sm:m-2 bg-[url('https://commons-shop.karimoku.com/cdn/shop/files/15411_f.jpg?v=1731306525&width=750')] bg-no-repeat relative bg-cover bg-center w-[170px] sm:w-[230px] lg:w-[270px] h-[230px]  sm:h-[300px] lg:h-[340px]">
            <div className="description absolute w-full bottom-0 h-[0%] opacity-0 group-hover:opacity-100 duration-500 group-hover:h-[40%] flex flex-col bg-white p-3">
              <p className="text-[.8rem] hidden sm:block">
                不簡單的青海路，相遇不平凡的青世代 獻給，鍾情市中心的菁英家庭
                致邀，職住共生的青創企業家
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center">
                <b className="text-[.8rem] mr-3 mt-4">
                  {" "}
                  NEWS:神隱青海│2-3房│含精裝修{" "}
                </b>
                <button class="group relative inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-neutral-950 font-medium text-neutral-200">
                  <div class="translate-x-0 transition group-hover:translate-x-[300%]">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                    >
                      <path
                        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div class="absolute -translate-x-[300%] transition group-hover:translate-x-0 duration-1000">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                    >
                      <path
                        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </button>{" "}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content"></div>
    </ReactLenis>
  );
}
