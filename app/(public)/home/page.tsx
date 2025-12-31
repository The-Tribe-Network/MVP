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
  },
  twitter: {
    title: "Tribe - Community Organization, Perfected",
    description:
      "Privacy-first community platform with photo archives, event management, and granular permissions.",
  },
};

export default function HomePage() {
  return <HomePageContent />;
}
