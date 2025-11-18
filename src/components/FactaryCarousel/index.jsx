import React from "react";
import EmblaCarousel from "./EmblaCarousel";
// Assuming Header and Footer are in the same directory
// import Header from "./Header";
// import Footer from "./Footer";

// Carousel options remain the same
const OPTIONS = { dragFree: true, loop: true };

// New slide data for health supplements
const SLIDES = [
  {
    image: "/images/2491274-cover-Photoroom.png", // Replace with your actual image paths
    title: "Advanced Probiotics",
    shortDescription: "Supports gut health and immune function.",
    description:
      "A powerful blend of 60 billion CFUs to promote digestive balance and a healthy microbiome.",
    tags: ["Digestion", "Wellness"],
    publishDate: "2024-05-10",
    region: "USA",
  },
  {
    image: "/images/2491274-cover-Photoroom.png", // Replace with your actual image paths
    title: "Omega-3 Fish Oil",
    shortDescription: "Promotes heart and brain health.",
    description:
      "Sustainably sourced, high-potency fish oil rich in EPA and DHA for cardiovascular and cognitive support.",
    tags: ["Heart Health", "Cognitive"],
    publishDate: "2024-04-22",
    region: "Norway",
  },
  {
    image: "/images/2491274-cover-Photoroom.png", // Replace with your actual image paths
    title: "Vitamin D3 + K2",
    shortDescription: "For strong bones and a healthy immune system.",
    description:
      "A crucial vitamin pairing that supports calcium absorption, bone density, and immune response.",
    tags: ["Bone Support", "Immunity"],
    publishDate: "2024-05-01",
    region: "Canada",
  },
  {
    image: "/images/2491274-cover-Photoroom.png", // Replace with your actual image paths
    title: "Daily Multivitamin",
    shortDescription: "Complete nutritional support for everyday vitality.",
    description:
      "A comprehensive formula with essential vitamins and minerals to fill nutritional gaps and boost energy.",
    tags: ["Energy", "Overall Health"],
    publishDate: "2024-03-15",
    region: "Germany",
  },
  {
    image: "/images/2491274-cover-Photoroom.png", // Replace with your actual image paths
    title: "Collagen Peptides",
    shortDescription: "For vibrant skin, hair, and healthy joints.",
    description:
      "Hydrolyzed collagen powder that is easily absorbed to support skin elasticity, hair strength, and joint flexibility.",
    tags: ["Beauty", "Joints"],
    publishDate: "2024-05-05",
    region: "Japan",
  },
  {
    image: "/images/2491274-cover-Photoroom.png", // Replace with your actual image paths
    title: "Turmeric Curcumin",
    shortDescription: "Natural anti-inflammatory and antioxidant support.",
    description:
      "High-potency turmeric extract with black pepper for enhanced absorption, helping to reduce inflammation.",
    tags: ["Anti-inflammatory", "Antioxidant"],
    publishDate: "2024-04-18",
    region: "India",
  },
];

const App = () => (
  <>
    {/* Uncomment the lines below if you have header and footer components */}
    {/* <Header /> */}
    <main>
      <EmblaCarousel slides={SLIDES} options={OPTIONS} />
    </main>
    {/* <Footer /> */}
  </>
);

export default App;
