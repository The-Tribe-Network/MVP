"use client";

import { HeroSection } from "./components/hero-section";
// import { InteractiveDemo } from "./components/interactive-demo";
import { SolutionSection } from "./components/solution-section";
import { FAQSection } from "./components/faq-section";
import { FinalCTA } from "./components/final-cta";

export default function HomePageContent() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      {/* <InteractiveDemo /> */}
      <SolutionSection />
      <FAQSection />
      <FinalCTA />
    </div>
  );
}
