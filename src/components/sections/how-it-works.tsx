import Features from "./features-vertical";
import Section from "./section";
import { Sparkles, Upload, Zap } from "lucide-react";

const data = [
  {
    id: 1,
    title: "第一步：決定您的網站長什麼樣",
    content:
      "您需要先想清楚「我想要的網站是什麼？」網路商店、部落格，還是公司介紹？還有，網站需要什麼功能，比如購物車、聯絡表單，或者圖片展示？只要把這些需求整理好，接下來的步驟就會變得簡單又順利！",
    image:
      "/images/三步驟建立您的網站_設計您的網站主視覺風格定位-極客網頁設計.png",
    icon: <Upload className="w-6 h-6 text-primary" />,
  },
  {
    id: 2,
    title: "第二步：選擇工具來建立網站",
    content:
      "例如，您可以選擇網站建置平台，像是 Wix 或 WordPress或者客製化網站。另外，別忘了選一個好記的網域名稱。最後，挑選可靠的主機服務商，確保網站能夠順暢運行。",
    image: "/images/三步驟建立您的網站_開始製作您的網站-極客網頁設計.png",
    icon: <Zap className="w-6 h-6 text-primary" />,
  },
  {
    id: 3,
    title: "第三步：填寫內容並發布",
    content:
      "現在只需要把您的文字、圖片或影片放進去！先撰寫清楚的內容，例如公司介紹、產品資訊或部落格文章，再搭配吸引訪客目光的漂亮圖片。接著，別忘了測試網站上的每個按鈕、表單或連結，確保它們都能正常運作。",
    image:
      "/images/三步驟建立您的網站_加入您的文案、美化你的網站-極客網頁設計.png",
    icon: <Sparkles className="w-6 h-6 text-primary" />,
  },
];

export default function Component() {
  return (
    <Section title="How it works" subtitle="三步驟建立您的網站 ">
      <p className="sm:w-2/3 lg:w-1/2 mx-auto text-center">
        想要擁有自己的網站，但覺得很難嗎？別擔心！其實建立網站就像學做一道簡單的菜，只要跟著步驟走，你也可以輕鬆完成。以下是三個簡單的步驟，讓您輕鬆入門：
      </p>
      <Features data={data} />
    </Section>
  );
}
