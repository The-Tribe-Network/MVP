"use client";

import { HeroSection } from "./components/hero-section";
import { InteractiveDemo } from "./components/interactive-demo";
import { ProblemSection } from "./components/problem-section";
import { SolutionSection } from "./components/solution-section";
import { FeaturesPreview } from "./components/features-preview";
import { FAQSection } from "./components/faq-section";
import { FinalCTA } from "./components/final-cta";

export default function HomePageContent() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <InteractiveDemo />
      <ProblemSection />
      <SolutionSection />
      <FeaturesPreview />
      <FAQSection />
      <FinalCTA />
    </div>
  );
}
