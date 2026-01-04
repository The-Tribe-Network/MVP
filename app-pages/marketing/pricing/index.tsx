"use client";

import { PricingHero } from "./components/pricing-hero";
import { PricingTiers } from "./components/pricing-tiers";
import { PricingComparison } from "./components/pricing-comparison";
import { PricingFAQ } from "./components/pricing-faq";
import { WaitlistCTA } from "./components/waitlist-cta";

export default function PricingPageContent() {
  return (
    <div className="min-h-screen">
      <PricingHero />
      <PricingTiers />
      {/* <PricingComparison /> */}
      <PricingFAQ />
      <WaitlistCTA />
    </div>
  );
}
