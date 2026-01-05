import type { Metadata } from "next";
import AboutPageContent from "@/app-pages/marketing/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Tribe's mission to build better community tools. Our story, values, and the team behind the privacy-first platform for groups and communities that gather in person.",
  keywords: [
    "about Tribe",
    "community platform company",
    "privacy-first mission",
    "community software team",
  ],
  openGraph: {
    title: "About - Tribe",
    description:
      "Our mission is to build community tools that respect privacy and actually work. Learn about the team behind Tribe.",
    images: [
      {
        url: "/app-screenshots-1024/tribe_timeline_light.png",
        width: 1024,
        height: 768,
        alt: "Tribe activity timeline showing community engagement",
      },
    ],
  },
  twitter: {
    title: "About - Tribe",
    description:
      "The mission, story, and team behind the privacy-first community platform.",
    images: ["/app-screenshots-1024/tribe_timeline_light.png"],
  },
};

export default function AboutPage() {
  return <AboutPageContent />;
}
