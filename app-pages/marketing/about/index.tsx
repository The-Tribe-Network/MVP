"use client";

import { MissionSection } from "./components/mission-section";
import { StorySection } from "./components/story-section";
import { ValuesSection } from "./components/values-section";
import { TeamSection } from "./components/team-section";

export default function AboutPageContent() {
  return (
    <div className="min-h-screen">
      <MissionSection />
      <StorySection />
      <ValuesSection />
      <TeamSection />
    </div>
  );
}
