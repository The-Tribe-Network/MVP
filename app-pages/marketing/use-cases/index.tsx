"use client";

import { UseCasesHero } from "./components/use-cases-hero";
import { FamiliesCase } from "./components/families-case";
import { ReligiousCase } from "./components/religious-case";
import { SocialClubsCase } from "./components/social-clubs-case";
import { SportsCase } from "./components/sports-case";

export default function UseCasesPageContent() {
  return (
    <div className="min-h-screen">
      <UseCasesHero />
      <FamiliesCase />
      <ReligiousCase />
      <SocialClubsCase />
      <SportsCase />
    </div>
  );
}
