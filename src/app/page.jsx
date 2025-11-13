import Client from "./home";

export const metadata = {
  title: "UFLOW｜功能性保健食品與營養補給｜專為亞洲體質研發・安心第三方檢驗",
  description:
    "UFLOW 專注於功能性保健食品與日常營養補給：益生菌、魚油、葉黃素、維生素 D3/K2、關節與睡眠配方等。嚴選原料、無多餘添加，並通過第三方檢驗，讓你補得安心、每日有感。",
  keywords: [
    "保健食品",
    "營養補充品",
    "益生菌",
    "魚油",
    "葉黃素",
    "維生素D3",
    "維生素K2",
    "關節保健",
    "睡眠保健",
    "機能飲品",
    "第三方檢驗",
    "UFLOW",
  ],
  icons: {
    icon: "/images/logo/uflow.ico",
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "https://www.uflow.com",
    siteName: "UFLOW",
    title: "UFLOW｜功能性保健食品與營養補給｜專為亞洲體質研發・安心第三方檢驗",
    description:
      "嚴選原料、無多餘添加，並通過第三方檢驗的功能性保健食品。從視力、腸道、關節到睡眠，UFLOW 讓日常補給更有效率。",
    images: [
      {
        url: "https://www.uflow.com/images/og/uflow-og.jpg",
        width: 1200,
        height: 630,
        alt: "UFLOW 功能性保健食品品牌形象",
      },
    ],
  },
  alternates: {
    canonical: "https://www.uflow.com",
  },
};

export const revalidate = 60;

export default function Page() {
  return <Client />;
}
