"use client";

import { HeroSection } from "./components/hero-section";
import { AppShowcase } from "./components/app-showcase";
import { ProblemSection } from "./components/problem-section";
import { SolutionSection } from "./components/solution-section";
import { FeaturesPreview } from "./components/features-preview";
import { FinalCTA } from "./components/final-cta";

export default function HomePageContent() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AppShowcase />
      <ProblemSection />
      <SolutionSection />
      <FeaturesPreview />
      <FinalCTA />
    </div>
  );
}
