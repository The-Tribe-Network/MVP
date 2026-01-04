import type { Metadata } from "next";
import UseCasesPageContent from "@/app-pages/marketing/use-cases";

export const metadata: Metadata = {
  title: "Use Cases",
  description:
    "See how Tribe works for groups and communities of all kinds. Real solutions for real communities that gather in person.",
  keywords: [
    "social group app",
    "club platform",
    "community organization app",
    "group management",
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
      "For groups and communities that gather in person. See how Tribe works for communities like yours.",
  },
  twitter: {
    title: "Use Cases - Tribe",
    description:
      "For groups and communities that gather in person. See how Tribe works for you.",
  },
};

export default function UseCasesPage() {
  return <UseCasesPageContent />;
}
