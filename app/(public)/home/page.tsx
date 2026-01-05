import type { Metadata } from "next";
import HomePageContent from "@/app-pages/marketing/home";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Tribe is the privacy-first community platform built for groups that deserve better. Photo archives that last forever, structured events, and granular permissions. No ads, no data mining.",
  openGraph: {
    title: "Tribe - Community Organization, Perfected",
    description:
      "The privacy-first platform for communities that deserve better than GroupMe chaos and Instagram ephemerality.",
    images: [
      {
        url: "/app-screenshots-1024/home_dashboard_light.png",
        width: 1024,
        height: 768,
        alt: "Tribe home dashboard showing your communities at a glance",
      },
    ],
  },
  twitter: {
    title: "Tribe - Community Organization, Perfected",
    description:
      "Privacy-first community platform with photo archives, event management, and granular permissions.",
    images: ["/app-screenshots-1024/home_dashboard_light.png"],
  },
};

export default function HomePage() {
  return <HomePageContent />;
}
