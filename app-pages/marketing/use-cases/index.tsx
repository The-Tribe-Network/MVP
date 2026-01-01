"use client";

import { UseCasesHero } from "./components/use-cases-hero";
import { FaithCommunitiesCase } from "./components/faith-communities-case";
import { AthleticGroupsCase } from "./components/athletic-groups-case";
import { ProfessionalNetworksCase } from "./components/professional-networks-case";
import { HobbyGroupsCase } from "./components/hobby-groups-case";

export default function UseCasesPageContent() {
  return (
    <div className="min-h-screen">
      <UseCasesHero />
      <FaithCommunitiesCase />
      <AthleticGroupsCase />
      <ProfessionalNetworksCase />
      <HobbyGroupsCase />
    </div>
  );
}
