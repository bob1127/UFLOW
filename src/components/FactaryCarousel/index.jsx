import React from "react";
import EmblaCarousel from "./EmblaCarousel";
import Header from "./Header";
import Footer from "./Footer";

const OPTIONS = { dragFree: true, loop: true };

// Define an array of slide objects with iframe content
const SLIDES = [
  {
    image: "/images/factary/unnamed.webp",
    title: "Fourth Slide",
    description: "Description for the fourth slide.",
    tags: ["親子活動", "手作DIY"],
    publishDate: "2024-05-01",
    region: "台中",
  },
  {
    image: "/images/factary/unnamed (1).webp",
    title: "Third Slide",
    description: "Description for the third slide.",
    tags: ["親子活動", "手作DIY"],
    publishDate: "2024-05-01",
    region: "台中",
  },
  {
    image: "/images/800x (7).webp",
    title: "Third Slide",
    description: "Description for the third slide.",
    tags: ["親子活動", "手作DIY"],
    publishDate: "2024-05-01",
    region: "台中",
  },
  {
    image: "/images/800x (8).webp",
    title: "Fourth Slide",
    description: "Description for the fourth slide.",
    tags: ["親子活動", "手作DIY"],
    publishDate: "2024-05-01",
    region: "台中",
  },
  {
    image: "/images/800x (9).webp",
    title: "Fifth Slide",
    description: "Description for the fifth slide.",
    tags: ["親子活動", "手作DIY"],
    publishDate: "2024-05-01",
    region: "台中",
  },
  {
    image: "/images/800x (10).webp",
    title: "Fourth Slide",
    description: "Description for the fourth slide.",
    tags: ["親子活動", "手作DIY"],
    publishDate: "2024-05-01",
    region: "台中",
  },
];

const App = () => (
  <>
    {/* Uncomment the lines below if you have header and footer components */}
    {/* <Header /> */}
    <EmblaCarousel slides={SLIDES} options={OPTIONS} />
    {/* <Footer /> */}
  </>
);

export default App;
