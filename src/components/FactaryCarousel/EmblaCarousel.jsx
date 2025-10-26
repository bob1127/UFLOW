import React, { useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";
import { DotButton, useDotButton } from "./EmblaCarosuelDotButton";
import { gsap } from "gsap";
import Image from "next/image";
const EmblaCarousel = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const dragIndicatorRef = useRef(null);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const handleMouseEnter = () => {
    gsap.to(dragIndicatorRef.current, { opacity: 1, scale: 1, duration: 0.5 });
    document.body.style.cursor = "grab";
  };

  const handleMouseLeave = () => {
    gsap.to(dragIndicatorRef.current, {
      opacity: 0,
      scale: 0.5,
      duration: 0.5,
    });
    document.body.style.cursor = "default";
  };

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi
      .on("reInit", () => {})
      .on("scroll", () => {})
      .on("slideFocus", () => {});
  }, [emblaApi]);

  return (
    <div
      className="w-full py-8 mx-auto  bg-[#EEEBE2]"
      style={{
        "--slide-height": "19rem",
        "--slide-spacing": "1rem",
        "--slide-size": "26%", // Default value for larger screens
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style>
        {`
         @media (max-width: 1700px) {
        .embla__viewport {
          --slide-size: 32%;
        }
      }
          @media (max-width: 1000px) {
        .embla__viewport {
          --slide-size: 36%;
        }
      }
      @media (max-width: 550px) {
        .embla__viewport {
          --slide-size: 80%;
        }
      }
    `}
      </style>
      <div className="embla__viewport " ref={emblaRef}>
        <div
          className="embla__container flex touch-pan-y touch-pinch-zoom h-auto"
          style={{ marginLeft: "calc(var(--slide-spacing) * -1)" }}
        >
          {slides.map((slide, index) => (
            <div
              className="embla__slide relative  transform flex-none h-full min-w-0"
              key={index}
              style={{
                transform: "translate3d(0, 0, 0)",
                flex: "0 0 var(--slide-size)",
                paddingLeft: "var(--slide-spacing)",
              }}
            >
              <div className="bottom-btn absolute z-30 bottom-[-20px] left-1/2 -translate-x-1/2">
                <div className="bg-[#333] w-[50px] rounded-full flex justify-center items-center h-[50px] text-white">
                  ▼
                </div>
              </div>
              <div
                className="embla__slide__number border border-black   bg-white   pt-0 pb-[35px] flex flex-col items-center justify-center "
                style={{
                  boxShadow: "inset 0 0 0 0.2rem var(--detail-medium-contrast)",
                  borderRadius: "1.8rem",
                  fontSize: "4rem",
                  height: "100%",
                  userSelect: "none",
                }}
              >
                <a href="/" className="w-full">
                  <div className="flex  flex-col justify-center items-center">
                    <div>
                      <b className="text-[16px] text-center">{slide.title}</b>
                    </div>
                    {slide.content ? (
                      slide.content
                    ) : (
                      <div className="w-full aspect-[4/3] relative overflow-hidden ">
                        <Image
                          src={slide.image}
                          alt={`Slide ${index + 1}`}
                          fill
                          sizes="100vw"
                          className="object-cover"
                          placeholder="empty"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="txt mt-5 flex-col flex justify-center items-center w-4/5 mx-auto">
                      <p className="text-[14px] font-normal text-center">
                        {slide.description}
                      </p>
                      <div className="mt-2 flex flex-wrap justify-center gap-2">
                        {slide.tags?.map((tag, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1 bg-black text-white px-2 py-[2px] rounded-full text-[12px]"
                          >
                            <img
                              src="https://kobeurbanfarming.jp/dist/img/main/logo-tag.svg"
                              alt="tag icon"
                              className="w-[12px] h-[12px] invert brightness-0"
                            />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* 顯示地區與發佈日期 */}
                      <div className="mt-2 text-center text-[12px] text-gray-600">
                        <p>
                          {slide.region} ｜ {slide.publishDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls absolute bottom-0 left-6 grid grid-cols-[auto_1fr] justify-between flex inline-block border border-black gap-3 mt-7">
        <div className="embla__buttons absolute left-[-50%] bottom-[10%] flex justify-center">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        <div className="embla__dots">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={"embla__dot".concat(
                index === selectedIndex ? " embla__dot--selected" : ""
              )}
            />
          ))}
        </div>
      </div>

      <div
        ref={dragIndicatorRef}
        className="drag-indicator absolute top-[-5%] left-[-5%] transform  rounded-full text-white text-center text-[10px] bg-black flex items-center justify-center"
        style={{
          opacity: 0,
          scale: 0.5,
          width: "100px",
          height: "100px",
          fontSize: "20px",
        }}
      >
        <div className="flex flex-col justify-center items-center">
          <p className="text-white text-center text-[14px]">100%</p>{" "}
          <p className="text-center text-white text-[10px]">Made In Taiwan</p>
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;
