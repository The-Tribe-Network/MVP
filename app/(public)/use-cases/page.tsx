import type { Metadata } from "next";
import UseCasesPageContent from "@/app-pages/marketing/use-cases";

export const metadata: Metadata = {
  title: "Use Cases",
  description:
    "See how Tribe works for diaspora communities, Greek life organizations, fitness groups, and hospitality VIP lists. Real solutions for real communities.",
  keywords: [
    "diaspora community app",
    "fraternity sorority platform",
    "Greek life organization",
    "gym community app",
    "VIP list management",
    "hospitality community",
    "fitness group platform",
  ],
  openGraph: {
    title: "Use Cases - Tribe",
    description:
      "From diaspora communities to Greek life, fitness groups to VIP lists. See how Tribe works for your community.",
  },
  twitter: {
    title: "Use Cases - Tribe",
    description:
      "Diaspora communities, Greek life, fitness groups, hospitality VIP lists. Tribe works for all of them.",
  },
};

export default function UseCasesPage() {
  return <UseCasesPageContent />;
}
