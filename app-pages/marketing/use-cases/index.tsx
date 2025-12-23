"use client";

import { UseCasesHero } from "./components/use-cases-hero";
import { DiasporaCase } from "./components/diaspora-case";
import { GreekLifeCase } from "./components/greek-life-case";
import { FitnessCase } from "./components/fitness-case";
import { HospitalityCase } from "./components/hospitality-case";

export default function UseCasesPageContent() {
  return (
    <div className="min-h-screen">
      <UseCasesHero />
      <DiasporaCase />
      <GreekLifeCase />
      <FitnessCase />
      <HospitalityCase />
    </div>
  );
}
