import React from "react";
import { useEffect } from "react";
import Marquee from "react-fast-marquee";
import AnimatedLink from "../AnimatedLink";
import Image from "next/image";
import Link from "next/link";
import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish-input";
export default function Content() {
  // ✅ 修正卡住滾動的 bug：每次進入頁面都清除 .page-transition
  useEffect(() => {
    document.body.classList.remove("page-transition");
    sessionStorage.removeItem("transitioning"); // 順便清除狀態
  }, []);
  const placeholders = [
    "理想的家，該具備哪些元素？",
    "選擇房子時，你最在意什麼？",
    "如何找到兼具品質與舒適的住宅？",
    "買房是投資還是生活選擇？",
    "未來的家，會是什麼模樣？",
  ];
  const handleChange = (e) => {
    console.log(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("submitted");
  };
  return (
    <div
      id="dark-section"
      className="pb-2  pt-20 sm:pt-[300px] md:pt-[360px] xl:pt-[380px] 2xl:pt-[350px] bg-[url('/images/hero-img/footer03.png')] bg-left bg-no-repeat bg-cover py-8 2xl:px-[200px] lg:px-[150px] px-[40px] h-full  w-full flex flex-col justify-center"
    >
      <Section2 />
      <div className=" md:w-1/2 max-w-[900px] flex justify-start"></div>
      {/* <Marquee className="mb-12">
        <div className="flex justify-center items-center">
          <b className="text-[4.3vmin] mr-3 font-normal text-gray-50">
            YI YUAN BUILDING DESIGN
          </b>
          <b className="text-[5.3vmin] mr-3 font-normal text-gray-50">
            YI YUAN BUILDING DESIGN
          </b>
          <b className="text-[4.3vmin] mr-3 font-normal text-gray-50">
            YI YUAN BUILDING DESIGN
          </b>
          <b className="text-[4.3vmin] mr-3 font-normal text-gray-50">
            YI YUAN BUILDING DESIGN
          </b>
          <b className="text-[4.3vmin] mr-3 font-normal text-gray-50">
            YI YUAN BUILDING DESIGN
          </b>
          <b className="text-[4.3vmin] mr-3 font-normal text-gray-50">
            YI YUAN BUILDING DESIGN
          </b>
          <b className="text-[4.3vmin] mr-3 font-normal text-gray-50">
            YI YUAN BUILDING DESIGN
          </b>
        </div>
      </Marquee> */}
    </div>
  );
}

const Section2 = () => {
  const placeholders = [
    "理想的家，該具備哪些元素？",
    "選擇房子時，你最在意什麼？",
    "如何找到兼具品質與舒適的住宅？",
    "買房是投資還是生活選擇？",
    "未來的家，會是什麼模樣？",
  ];
  const handleChange = (e) => {
    console.log(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("submitted");
  };
  return (
    <footer className=" border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        {/* 上半：左連結 + 右社群／認證 */}
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left */}
          <div className="lg:col-span-8">
            <div className="flex items-center">
              {/* Logo */}
              <div className="mr-8 text-3xl font-extrabold">
                {/* 若沒有 <Logo/>，改成文字 */}
                {/* <div className="text-2xl font-extrabold tracking-widest">KOREDAKE</div> */}
                UFLOW
              </div>
            </div>

            {/* 主連結（直式、字距大、全大寫） */}
            <nav className="mt-6">
              <ul className="space-y-4 tracking-widest text-sm">
                <li>
                  <Link href="/products" className="hover:opacity-70">
                    PRODUCTS
                  </Link>
                </li>
                <li>
                  <Link href="/nutrition" className="hover:opacity-70">
                    NUTRITION
                  </Link>
                </li>
                <li>
                  <Link href="/ingredients" className="hover:opacity-70">
                    INGREDIENTS
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:opacity-70">
                    FAQ
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Right */}
          <div className="lg:col-span-4 flex items-start justify-between lg:justify-end gap-10">
            {/* 社群 icon */}
            <div className="flex items-center gap-5">
              {/* Instagram */}
              <Link
                href="https://instagram.com"
                aria-label="Instagram"
                className="transition hover:opacity-70"
              >
                <Image
                  src="/images/social/instagram.svg"
                  alt="instagram"
                  width={26}
                  height={26}
                />
              </Link>
              {/* X（Twitter） */}
              <Link
                href="https://x.com"
                aria-label="X"
                className="transition hover:opacity-70"
              >
                {/* 你也可以放 /images/social/x.svg */}
                <span className="inline-block h-[26px] w-[26px] leading-[26px] text-[18px] font-black">
                  X
                </span>
              </Link>
              {/* LINE */}
              <Link
                href="https://line.me"
                aria-label="LINE"
                className="transition hover:opacity-70"
              >
                <Image
                  src="/images/social/line.svg"
                  alt="line"
                  width={28}
                  height={28}
                />
              </Link>
            </div>

            {/* B Corp 認證（右側） */}
            <div className="shrink-0">
              <Image
                src="/images/logo-01.png" // 放到 /public/images/cert/bcorp.png
                alt="Certified B Corporation"
                width={380}
                height={380}
                className="w-[150px]"
                priority
              />
            </div>
          </div>
        </div>

        {/* 下半：條款連結 + 版權 */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-6 text-xs text-gray-500 sm:flex-row">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li>
              <Link href="/contact" className="hover:text-black">
                お問い合わせ
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-black">
                プライバシーポリシー
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-black">
                利用規約
              </Link>
            </li>
            <li>
              <Link href="/law" className="hover:text-black">
                特定商取引法に基づく表示
              </Link>
            </li>
          </ul>

          <div className="text-gray-500">
            © {new Date().getFullYear()} KOREDAKE
          </div>
        </div>
      </div>
    </footer>
  );
};
