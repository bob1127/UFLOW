// 修正與優化重構
"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import Link from "next/link";
import ImageReveal from "../../components/ImageReveal.jsx";
import { motion } from "framer-motion";
import GsapText from "../../components/RevealText/index";
import Image from "next/image";
import ImageTextSlider from "../../components/ImageTextSlider.jsx";

import Swiper from "../../components/SwiperCarousel/SwiperCard.jsx";
import SwiperSingle from "../../components/SwiperCarousel/SwiperCardFood.jsx";
import BaseballParallax from "../../components/BaseballParallaxContent/page.jsx";
import HeroSlider from "../../components/HeroSlideContact/page.jsx";
import { ReactLenis } from "@studio-freight/react-lenis";
import BoxReveal from "../../components/ui/box-reveal.js";
import Carousel from "../../components/FactaryCarousel/index";
// 背景圖片陣列
const backgroundImages = [
  "https://takidanifudouson.or.jp/cms/wp-content/themes/takidanifudouson/assets/images/top/img__fvbottom__image__lg@2x.jpg?rev=20201228174103",
  "https://shiroyamakumano-jinja.jp/wp/wp-content/themes/shiroyama/assets/img/about_1.jpg",
];

export default function ProjectListPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNav, setShowNav] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let lastScrollY = 0;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNav(currentScrollY < lastScrollY);
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const OPTIONS = { dragFree: true, loop: true };
  const SLIDE_COUNT = 5;
  const SLIDES = Array.from(Array(SLIDE_COUNT).keys());
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
      <div className="">
        <section className="  pb-[100px]">
          <HeroSlider />
        </section>
        <section>
          <ImageTextSlider />
        </section>
        <section className="section_where_go h-auto mt-[10px]">
          <div className="section-title py-[50px] flex flex-col justify-center items-center ">
            <h2 className="text-slate-900 text-[45px]">關於保健知識？</h2>
            <p>BLOG</p>
          </div>
          <div className="grid  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 ">
            <div className="article-card bg-white group border-[.5px] border-gray-200">
              <div className="card-img aspect-[4/3] overflow-hidden relative">
                <Image
                  src="https://coralclub.ru/news/img/banner_0521.jpeg"
                  alt-=""
                  fill
                  placeholder="empty"
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                ></Image>
              </div>
              <div className="card-conetent group px-5 py-3">
                <div className="title">
                  <b>文章</b>
                  <p className="max-w-[300px]">
                    <span
                      className="
      inline 
      bg-gradient-to-r from-black to-black 
      bg-[length:0%_2px] 
      bg-no-repeat 
      bg-left-bottom 
      group-hover:bg-[length:100%_2px] 
      transition-[background-size] 
      duration-500 
      text-[.9rem] 
      tracking-wider
    "
                    >
                      打造健康的身體，營養均衡的飲食是必不可少的。
                      但是，在忙碌的每一天裡好好攝取營養是一件非常困難的事情。
                      既費力又費時。
                    </span>
                  </p>
                </div>
                <div className="tag mt-4">
                  <b className="text-[.9rem]">・保健食品 ・健康須知</b>
                </div>
                <div className="date">
                  <span className="text-[.7rem] text-gray-500">
                    {" "}
                    <span className="text-[.65rem] text-gray-500">
                      {" "}
                      PUBLISH DATE
                    </span>{" "}
                    | 2025.05.05
                  </span>
                </div>
              </div>
            </div>
            <div className="article-card bg-white group border-[.5px] border-gray-200">
              <div className="card-img aspect-[4/3] overflow-hidden relative">
                <Image
                  src="https://ru.coral.club//upload/resize_cache/iblock/68e/526_295_1/pt9romse16oxrpyvelhsa3aew4vzbbnv.webp"
                  alt=""
                  fill
                  placeholder="empty"
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="card-conetent group px-5 py-3">
                <div className="title">
                  <b>文章</b>
                  <p className="max-w-[300px]">
                    <span
                      className="
      inline 
      bg-gradient-to-r from-black to-black 
      bg-[length:0%_2px] 
      bg-no-repeat 
      bg-left-bottom 
      group-hover:bg-[length:100%_2px] 
      transition-[background-size] 
      duration-500 
      text-[.9rem] 
      tracking-wider
    "
                    >
                      打造健康的身體，營養均衡的飲食是必不可少的。
                      但是，在忙碌的每一天裡好好攝取營養是一件非常困難的事情。
                      既費力又費時。
                    </span>
                  </p>
                </div>
                <div className="tag mt-4">
                  <b className="text-[.9rem]">・保健食品 ・健康須知</b>
                </div>
                <div className="date">
                  <span className="text-[.7rem] text-gray-500">
                    {" "}
                    <span className="text-[.65rem] text-gray-500">
                      {" "}
                      PUBLISH DATE
                    </span>{" "}
                    | 2025.05.05
                  </span>
                </div>
              </div>
            </div>
            <div className="article-card bg-white group border-[.5px] border-gray-200">
              <div className="card-img aspect-[4/3] overflow-hidden relative">
                <Image
                  src="https://ru.coral.club//upload/resize_cache/iblock/63d/526_295_1/9g42wb97dif8lriowley5rgdb926hdpc.webp"
                  alt-=""
                  fill
                  placeholder="empty"
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                ></Image>
              </div>
              <div className="card-conetent group px-5 py-3">
                <div className="title">
                  <b>文章</b>
                  <p className="max-w-[300px]">
                    <span
                      className="
      inline 
      bg-gradient-to-r from-black to-black 
      bg-[length:0%_2px] 
      bg-no-repeat 
      bg-left-bottom 
      group-hover:bg-[length:100%_2px] 
      transition-[background-size] 
      duration-500 
      text-[.9rem] 
      tracking-wider
    "
                    >
                      打造健康的身體，營養均衡的飲食是必不可少的。
                      但是，在忙碌的每一天裡好好攝取營養是一件非常困難的事情。
                      既費力又費時。
                    </span>
                  </p>
                </div>
                <div className="tag mt-4">
                  <b className="text-[.9rem]">・保健食品 ・健康須知</b>
                </div>
                <div className="date">
                  <span className="text-[.7rem] text-gray-500">
                    {" "}
                    <span className="text-[.65rem] text-gray-500">
                      {" "}
                      PUBLISH DATE
                    </span>{" "}
                    | 2025.05.05
                  </span>
                </div>
              </div>
            </div>
            <div className="article-card bg-white group border-[.5px] border-gray-200">
              <div className="card-img aspect-[4/3] overflow-hidden relative">
                <Image
                  src="https://ru.coral.club//upload/resize_cache/iblock/1ea/526_295_1/vxzcs1fptiopwh3fvxmzsm3tdj7ww3w2.webp"
                  alt-=""
                  fill
                  placeholder="empty"
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                ></Image>
              </div>
              <div className="card-conetent group px-5 py-3">
                <div className="title">
                  <b>文章</b>
                  <p className="max-w-[300px]">
                    <span
                      className="
      inline 
      bg-gradient-to-r from-black to-black 
      bg-[length:0%_2px] 
      bg-no-repeat 
      bg-left-bottom 
      group-hover:bg-[length:100%_2px] 
      transition-[background-size] 
      duration-500 
      text-[.9rem] 
      tracking-wider
    "
                    >
                      打造健康的身體，營養均衡的飲食是必不可少的。
                      但是，在忙碌的每一天裡好好攝取營養是一件非常困難的事情。
                      既費力又費時。
                    </span>
                  </p>
                </div>
                <div className="tag mt-4">
                  <b className="text-[.9rem]">・保健食品 ・健康須知</b>
                </div>
                <div className="date">
                  <span className="text-[.7rem] text-gray-500">
                    {" "}
                    <span className="text-[.65rem] text-gray-500">
                      {" "}
                      PUBLISH DATE
                    </span>{" "}
                    | 2025.05.05
                  </span>
                </div>
              </div>
            </div>
            <div className="article-card bg-white group border-[.5px] border-gray-200">
              <div className="card-img aspect-[4/3] overflow-hidden relative">
                <Image
                  src="https://ru.coral.club//upload/resize_cache/iblock/b24/355_210_1/beti1e3qps1lh9n811bxwmh211k7jy3b.webp"
                  alt-=""
                  fill
                  placeholder="empty"
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                ></Image>
              </div>
              <div className="card-conetent group px-5 py-3">
                <div className="title">
                  <b>文章</b>
                  <p className="max-w-[300px]">
                    <span
                      className="
      inline 
      bg-gradient-to-r from-black to-black 
      bg-[length:0%_2px] 
      bg-no-repeat 
      bg-left-bottom 
      group-hover:bg-[length:100%_2px] 
      transition-[background-size] 
      duration-500 
      text-[.9rem] 
      tracking-wider
    "
                    >
                      打造健康的身體，營養均衡的飲食是必不可少的。
                      但是，在忙碌的每一天裡好好攝取營養是一件非常困難的事情。
                      既費力又費時。
                    </span>
                  </p>
                </div>
                <div className="tag mt-4">
                  <b className="text-[.9rem]">・保健食品 ・健康須知</b>
                </div>
                <div className="date">
                  <span className="text-[.7rem] text-gray-500">
                    {" "}
                    <span className="text-[.65rem] text-gray-500">
                      {" "}
                      PUBLISH DATE
                    </span>{" "}
                    | 2025.05.05
                  </span>
                </div>
              </div>
            </div>
            <div className="article-card bg-white group border-[.5px] border-gray-200">
              <div className="card-img aspect-[4/3] overflow-hidden relative">
                <Image
                  src="https://ru.coral.club//upload/resize_cache/iblock/e60/355_210_1/bpt8vfadff62uya986ui0hj946yacyls.webp"
                  alt=""
                  fill
                  placeholder="empty"
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="card-conetent group px-5 py-3">
                <div className="title">
                  <b>文章</b>
                  <p className="max-w-[300px]">
                    <span
                      className="
      inline 
      bg-gradient-to-r from-black to-black 
      bg-[length:0%_2px] 
      bg-no-repeat 
      bg-left-bottom 
      group-hover:bg-[length:100%_2px] 
      transition-[background-size] 
      duration-500 
      text-[.9rem] 
      tracking-wider
    "
                    >
                      打造健康的身體，營養均衡的飲食是必不可少的。
                      但是，在忙碌的每一天裡好好攝取營養是一件非常困難的事情。
                      既費力又費時。
                    </span>
                  </p>
                </div>
                <div className="tag mt-4">
                  <b className="text-[.9rem]">・保健食品 ・健康須知</b>
                </div>
                <div className="date">
                  <span className="text-[.7rem] text-gray-500">
                    {" "}
                    <span className="text-[.65rem] text-gray-500">
                      {" "}
                      PUBLISH DATE
                    </span>{" "}
                    | 2025.05.05
                  </span>
                </div>
              </div>
            </div>
            <div className="article-card bg-white group border-[.5px] border-gray-200">
              <div className="card-img aspect-[4/3] overflow-hidden relative">
                <Image
                  src="https://ru.coral.club//upload/resize_cache/iblock/be3/355_210_1/48xwk15til3l8r0fndms9k3q5g9ztazu.webp"
                  alt-=""
                  fill
                  placeholder="empty"
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                ></Image>
              </div>
              <div className="card-conetent group px-5 py-3">
                <div className="title">
                  <b>文章</b>
                  <p className="max-w-[300px]">
                    <span
                      className="
      inline 
      bg-gradient-to-r from-black to-black 
      bg-[length:0%_2px] 
      bg-no-repeat 
      bg-left-bottom 
      group-hover:bg-[length:100%_2px] 
      transition-[background-size] 
      duration-500 
      text-[.9rem] 
      tracking-wider
    "
                    >
                      打造健康的身體，營養均衡的飲食是必不可少的。
                      但是，在忙碌的每一天裡好好攝取營養是一件非常困難的事情。
                      既費力又費時。
                    </span>
                  </p>
                </div>
                <div className="tag mt-4">
                  <b className="text-[.9rem]">・保健食品 ・健康須知</b>
                </div>
                <div className="date">
                  <span className="text-[.7rem] text-gray-500">
                    {" "}
                    <span className="text-[.65rem] text-gray-500">
                      {" "}
                      PUBLISH DATE
                    </span>{" "}
                    | 2025.05.05
                  </span>
                </div>
              </div>
            </div>
            <div className="article-card bg-white group border-[.5px] border-gray-200">
              <div className="card-img aspect-[4/3] overflow-hidden relative">
                <Image
                  src="https://ru.coral.club//upload/resize_cache/iblock/00b/355_210_1/ghw0uveambkfcwcxyhsdo8o0cqgt6bfx.jpg"
                  alt-=""
                  fill
                  placeholder="empty"
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                ></Image>
              </div>
              <div className="card-conetent group px-5 py-3">
                <div className="title">
                  <b>文章</b>
                  <p className="max-w-[300px]">
                    <span
                      className="
      inline 
      bg-gradient-to-r from-black to-black 
      bg-[length:0%_2px] 
      bg-no-repeat 
      bg-left-bottom 
      group-hover:bg-[length:100%_2px] 
      transition-[background-size] 
      duration-500 
      text-[.9rem] 
      tracking-wider
    "
                    >
                      打造健康的身體，營養均衡的飲食是必不可少的。
                      但是，在忙碌的每一天裡好好攝取營養是一件非常困難的事情。
                      既費力又費時。
                    </span>
                  </p>
                </div>
                <div className="tag mt-4">
                  <b className="text-[.9rem]">・保健食品 ・健康須知</b>
                </div>
                <div className="date">
                  <span className="text-[.7rem] text-gray-500">
                    {" "}
                    <span className="text-[.65rem] text-gray-500">
                      {" "}
                      PUBLISH DATE
                    </span>{" "}
                    | 2025.05.05
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="more-btn bg-slate-200 hover:bg-slate-900 duration-200 text-[20px] flex justify-center text-white py-6 ">
            More Info
          </div>
        </section>
        <section></section>
        {/* 
        <section className="bg-[#171616] py-[100px]">
          <BaseballParallax />
        </section> */}
        {/* <section className="section  bg-[#EEEBE2] pb-[200px]">
          <div className="title py-[50px] flex justify-start items-center flex-col">
            <h2 className="text-[#D41716] text-[2rem] font-bold">TEMPLE</h2>
            <span className="text-[1rem] text-[#D41716] font-bold">
              台灣・廟宇・寺廟
            </span>
            <b className="text-[.85rem] mt-5 text-[#000000]">
              探索台灣的信仰文化：走進廟宇的世界
            </b>
            <p className="text-[.85rem] mt-2 leading-loose tracking-widest max-w-[350px] text-center text-[#000000]">
              台灣遍布各地的廟宇與寺廟，不僅是信仰中心，更是深入在地文化的窗口。
              無論是香火鼎盛的媽祖廟，還是莊嚴靜謐的佛寺，
            </p>
          </div>
          <div className="section-hero w-full aspect-[500/500] sm:aspect-[1024/576] xl:aspect-[1920/768] overflow-hidden relative">
           
            {backgroundImages.map((bg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 1 }}
                animate={{
                  opacity: i === currentIndex ? 1 : 0,
                  scale: i === currentIndex ? 1.15 : 1, 
                }}
                transition={{
                  opacity: { duration: 1.5, ease: "easeInOut" }, 
                  scale: { duration: 20, ease: "linear" }, 
                }}
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
                style={{
                  backgroundImage: `url(${bg})`,
                }}
              />
            ))}

            <div className="bg-black opacity-40 w-full h-full absolute top-0 left-0 z-10" />


            <div className="hero-title  w-1/2 absolute left-[4%] top-[90%] z-[999999]">
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
          </div>
          <div className="relative h-[500px]">
            <div className="lion absolute z-50 left-1/2 -translate-x-1/2  top-[-190px]">
              <div className="flex ">
                <div className="lion-white mx-2">
                  <Image
                    src="/images/temple/temple-lion01.png"
                    alt="temple-lion"
                    placeholder="empty"
                    loading="lazy"
                    width={500}
                    height={500}
                    className="w-[350px] rotate-[-20deg]"
                  ></Image>
                </div>
                <div className="lion-red mx-2">
                  <Image
                    src="/images/temple/temple-lion02.png"
                    alt="temple-lion"
                    placeholder="empty"
                    loading="lazy"
                    width={500}
                    height={500}
                    className="w-[350px] rotate-[20deg]"
                  ></Image>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-row my-20 h-[90vh]">
            <div className="left bg-[url('https://shiroyamakumano-jinja.jp/wp/wp-content/themes/shiroyama/assets/img/about_1.jpg')] bg-center  aspect-5/3 bg-cover bg-no-repeat w-1/2"></div>
            <div className="right w-1/2"></div>
          </div>
          <div className="flex w-full flex-row">
            <div className="left-text flex-col flex justify-center items-center w-1/2">
              <BoxReveal boxColor={"#FFFFFF"} duration={0.5}>
                <GsapText
                  text="TEMPLE"
                  id="gsap-intro"
                  fontSize="2rem"
                  fontWeight="800"
                  color="#fff"
                  lineHeight="30px"
                  className="text-center !text-[#D41716] tracking-widest inline-block mb-0 h-auto"
                />
              </BoxReveal>
              <BoxReveal boxColor={"#FFFFFF"} duration={0.5}>
                <GsapText
                  text="台灣的民俗信仰"
                  id="gsap-intro"
                  fontSize="1.4rem"
                  fontWeight="800"
                  color="#fff"
                  lineHeight="30px"
                  className="text-center !text-[18px] !text-[#D41716] tracking-widest inline-block mb-0 h-auto"
                />
              </BoxReveal>
              <BoxReveal boxColor={"#FFFFFF"} duration={0.5}>
                <p className="!text-[.95rem] w-[60%] mt-5 text-center text-black font-normal">
                  走進台灣的城市與鄉村，不難發現廟宇隨處可見。這些廟宇不只是宗教信仰的中心，更是融合歷史、建築、民俗與社會生活的重要場域。無論是供奉媽祖、關聖帝君、城隍爺、土地公，還是佛教的觀音菩薩，每座廟宇都蘊藏著深厚的信仰文化與社區記憶。
                </p>
              </BoxReveal>
              <div></div>
            </div>
            <div className="img relative w-1-2">
              <div className="img group absolute z-50 w-[200x] h-[200px] rounded-full flex justify-center items-center p-5 flex-col right-[5%] bottom-[-170px] ">
                <Image
                  src="/images/temple/temple-ston-lion.png"
                  alt="temple-02"
                  placeholder="empty"
                  loading="lazy"
                  width={350}
                  height={350}
                  className="w-[150px] h-auto  mx-auto"
                ></Image>
                <p className="font-bold group-hover:opacity-100 duration-300 opacity-0 text-[.85rem] text-center text-[#D41716]">
                  石獅子
                </p>
              </div>
              <Image
                src="https://takidanifudouson.or.jp/cms/wp-content/themes/takidanifudouson/assets/images/top/img__gokitou__detail__lg@2x.jpg?rev=20201228174102"
                alt="temple-02"
                placeholder="empty"
                loading="lazy"
                width={800}
                height={1500}
                className="w-full max-w-[1000px] mx-auto"
              ></Image>
            </div>
          </div>
          <div className="py-20 bg-[#D41716]">
            <div className="txt flex flex-col justify-center items-center">
              <Image
                src="https://www.izumotaisya.jp/taisya/wp/wp-content/themes/izumotaisya_fukui/image/logo_w.svg"
                alt="temple-02"
                placeholder="empty"
                loading="lazy"
                width={400}
                height={200}
                className="w-[200px] max-w-[220px] mx-auto"
              ></Image>
              <p className="text-[#EEEBE2] max-w-[380px] text-center mb-5 mt-3 text-[.85rem] tracking-wider leading-relaxed">
                每年固定的廟會與遶境活動，更是台灣民俗文化的高潮。舞龍舞獅、陣頭、神轎、炮陣等熱鬧場景，不僅展現地方信仰力量，也成為文化觀光的重要資產。
              </p>
            </div>
            <SwiperSingle />
          </div>
        </section> */}
        {/* <section className="section-experience-factary w-full overflow-hidden">
          <Carousel />
        </section> */}

        {/* <Suspense fallback={<div></div>}>
        <ProjectListClient posts={posts} categories={categories} />
      </Suspense> */}
      </div>
    </ReactLenis>
  );
}
