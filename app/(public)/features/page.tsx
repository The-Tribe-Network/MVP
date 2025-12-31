import type { Metadata } from "next";
import FeaturesPageContent from "@/app-pages/marketing/features";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore Tribe's powerful features: organized photo archives, structured event RSVPs, activity feeds, announcements, and granular permission controls. See how we compare to GroupMe and Instagram.",
  keywords: [
    "community features",
    "photo archive",
    "event RSVP",
    "activity feed",
    "group announcements",
    "permission controls",
    "GroupMe alternative",
  ],
  openGraph: {
    title: "Features - Tribe",
    description:
      "Photo archives, event RSVPs, activity feeds, and granular permissions. Everything your community needs, nothing it doesn't.",
  },
  twitter: {
    title: "Features - Tribe",
    description:
      "Photo archives, event RSVPs, activity feeds, and granular permissions for your community.",
  },
};

export default function FeaturesPage() {
  return <FeaturesPageContent />;
}
