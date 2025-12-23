"use client";

import { HeroSection } from "./components/hero-section";
import { ProblemSection } from "./components/problem-section";
import { SolutionSection } from "./components/solution-section";
import { FeaturesPreview } from "./components/features-preview";
import { FinalCTA } from "./components/final-cta";

export default function HomePageContent() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesPreview />
      <FinalCTA />
    </div>
  );
}
