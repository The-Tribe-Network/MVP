"use client";

import { FeaturesHero } from "./components/features-hero";
import { VaultFeature } from "./components/vault-feature";
import { RBACFeature } from "./components/rbac-feature";
import { EventsFeature } from "./components/events-feature";
import { PrivacyFeature } from "./components/privacy-feature";
import { ComparisonTable } from "./components/comparison-table";

export default function FeaturesPageContent() {
  return (
    <div className="min-h-screen">
      <FeaturesHero />
      <VaultFeature />
      <RBACFeature />
      <EventsFeature />
      <PrivacyFeature />
      <ComparisonTable />
    </div>
  );
}
