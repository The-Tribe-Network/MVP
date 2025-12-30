"use client";

import { MissionSection } from "./components/mission-section";
import { SurgeonGeneralQuote } from "../home/components/surgeon-general-quote";
import { StorySection } from "./components/story-section";
import { ValuesSection } from "./components/values-section";
import { TeamSection } from "./components/team-section";

export default function AboutPageContent() {
  return (
    <div className="min-h-screen">
      <MissionSection />
      <SurgeonGeneralQuote />
      <StorySection />
      <ValuesSection />
      <TeamSection />
    </div>
  );
}
