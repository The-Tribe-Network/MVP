import type { Metadata } from "next";
import WaitlistPageContent from "@/app-pages/marketing/waitlist";

export const metadata: Metadata = {
  title: "Join the Waitlist",
  description:
    "Be first in line for Tribe - the privacy-first community platform. Sign up for early access to photo archives, event coordination, and granular permissions for your community.",
  keywords: [
    "community platform waitlist",
    "early access",
    "privacy-first community",
    "group organization app",
  ],
  openGraph: {
    title: "Join the Waitlist - Tribe",
    description:
      "Be first in line for the privacy-first community platform. Sign up for early access.",
    images: [
      {
        url: "/app-screenshots-1024/tribe_dashboard_light.png",
        width: 1024,
        height: 768,
        alt: "Tribe community dashboard preview",
      },
    ],
  },
  twitter: {
    title: "Join the Waitlist - Tribe",
    description:
      "Be first in line for the privacy-first community platform.",
    images: ["/app-screenshots-1024/tribe_dashboard_light.png"],
  },
};

export default function WaitlistPage() {
  return <WaitlistPageContent />;
}
