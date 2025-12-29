"use client";

import { FeaturesHero } from "./components/features-hero";
import { FeedFeature } from "./components/feed-feature";
import { AnnouncementsFeature } from "./components/announcements-feature";
import { ActivityFeature } from "./components/activity-feature";
import { EventRSVPFeature } from "./components/event-rsvp-feature";
import { ComparisonTable } from "./components/comparison-table";

export default function FeaturesPageContent() {
  return (
    <div className="min-h-screen">
      <FeaturesHero />
      <FeedFeature />
      <AnnouncementsFeature />
      <ActivityFeature />
      <EventRSVPFeature />
      <ComparisonTable />
    </div>
  );
}
