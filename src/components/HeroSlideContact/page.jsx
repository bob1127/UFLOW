"use client";
import { useRef } from "react";
import "./page.css";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

const Photos = () => {
  const sliderImagesRef = useRef(null);
  const counterRef = useRef(null);
  const titlesRef = useRef(null);
  const indicatorsRef = useRef(null);
  const previewsRef = useRef(null);
  const sliderRef = useRef(null);

  // ✅ 指定圖片路徑
  const imagePaths = [
    "https://d2w53g1q050m78.cloudfront.net/koredakecojp/uploads/images/pages/index/index-message01_pc.jpg",
    "https://d2w53g1q050m78.cloudfront.net/koredakecojp/uploads/images/pages/index/index-product_pc.jpg",
    "https://hfa-mqt-qoqix3fm.landinghub.site/.landinghub/https%3A%2F%2Fd2w53g1q050m78.cloudfront.net%2Fkoredakecojp%2Fuploads%2Fimages%2Fpages%2Fnutrients%2Fnutrition-intro_pc.jpg",
  ];

  useGSAP(
    () => {
      gsap.registerPlugin(CustomEase);
      CustomEase.create(
        "hop2",
        "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1"
      );

      let currentImg = 1;
      const totalSlides = imagePaths.length;
      let indicatorRotation = 0;

      function updateCounterAndTitlePosition() {
        const counterY = -20 * (currentImg - 1);
        const titleY = -60 * (currentImg - 1);

        gsap.to(counterRef.current, {
          y: counterY,
          duration: 1,
          ease: "hop2",
        });

        gsap.to(titlesRef.current, {
          y: titleY,
          duration: 1,
          ease: "hop2",
        });
      }

      function updateActiveSlidePreview() {
        previewsRef.current?.forEach((prev) => prev.classList.remove("active"));
        previewsRef.current?.[currentImg - 1]?.classList.add("active");
      }

      function animateSlide(direction) {
        const currentSlide = sliderImagesRef.current.lastElementChild;

        const slideImg = document.createElement("div");
        slideImg.classList.add("img");

        const slideImgElem = document.createElement("img");
        slideImgElem.src = imagePaths[currentImg - 1];
        gsap.set(slideImgElem, { x: direction === "left" ? -500 : 500 });

        slideImg.appendChild(slideImgElem);
        sliderImagesRef.current.appendChild(slideImg);

        const tl = gsap.timeline();

        tl.to(currentSlide.querySelector("img"), {
          x: direction === "left" ? 500 : -500,
          duration: 1.5,
          ease: "hop2",
        })
          .fromTo(
            slideImg,
            {
              clipPath:
                direction === "left"
                  ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)"
                  : "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
            },
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 1.5,
              ease: "hop2",
            },
            0
          )
          .to(
            slideImgElem,
            {
              x: 0,
              duration: 1.5,
              ease: "hop2",
            },
            0
          )
          .call(() => cleanupSlides(), null, 1.5);

        indicatorRotation += direction === "left" ? -90 : 90;
        gsap.to(indicatorsRef.current?.children, {
          rotate: indicatorRotation,
          duration: 1,
          ease: "hop2",
        });
      }

      function cleanupSlides() {
        const imgElements = sliderImagesRef.current.querySelectorAll(".img");
        if (imgElements.length > totalSlides) {
          gsap.to(imgElements[0], {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
              imgElements[0].remove();
            },
          });
        }
      }

      function nextSlide() {
        currentImg = currentImg < totalSlides ? currentImg + 1 : 1;
        animateSlide("right");
        updateActiveSlidePreview();
        updateCounterAndTitlePosition();
      }

      const autoSlideInterval = setInterval(nextSlide, 4000);

      function handleClick(event) {
        const sliderWidth = sliderRef.current.clientWidth;
        const clickPosition = event.clientX;

        if (event.target.closest(".slider-preview")) {
          const clickedPrev = event.target.closest(".preview");
          if (clickedPrev) {
            const clickedIndex =
              Array.from(previewsRef.current).indexOf(clickedPrev) + 1;
            if (clickedIndex !== currentImg) {
              currentImg = clickedIndex;
              animateSlide(clickedIndex < currentImg ? "left" : "right");
              updateActiveSlidePreview();
              updateCounterAndTitlePosition();
            }
          }
          return;
        }

        if (clickPosition < sliderWidth / 2 && currentImg !== 1) {
          currentImg--;
          animateSlide("left");
        } else if (
          clickPosition > sliderWidth / 2 &&
          currentImg !== totalSlides
        ) {
          currentImg++;
          animateSlide("right");
        }

        updateActiveSlidePreview();
        updateCounterAndTitlePosition();
      }

      sliderRef.current.addEventListener("click", handleClick);

      return () => {
        sliderRef.current?.removeEventListener("click", handleClick);
        clearInterval(autoSlideInterval);
      };
    },
    { scope: sliderRef, dependencies: [] }
  );

  return (
    <>
      <div className="slider" ref={sliderRef}>
        <div className="slider-images" ref={sliderImagesRef}>
          <div className="img">
            <img
              src="/images/小資專案/468661269_122223979160031935_3338016445612834353_n.jpg"
              alt="slide-1"
            />
          </div>
        </div>

        <div className="slider-title">
          <div className="slider-title-wrapper" ref={titlesRef}>
            <p>Above The Canvas</p>
            <p>Above The Canvas</p>
            <p>Harmony in Every Note</p>
            <p>Redefining Imagination</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Photos;
