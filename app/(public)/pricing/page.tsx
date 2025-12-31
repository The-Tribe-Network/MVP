import type { Metadata } from "next";
import PricingPageContent from "@/app-pages/marketing/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Tribe. Start free with our community tier. Scale to Pro for larger groups with advanced features. No hidden fees, no data mining.",
  keywords: [
    "community platform pricing",
    "group management cost",
    "free community app",
    "team organization pricing",
  ],
  openGraph: {
    title: "Pricing - Tribe",
    description:
      "Simple, transparent pricing. Start free, scale when you need to. No hidden fees.",
  },
  twitter: {
    title: "Pricing - Tribe",
    description:
      "Simple, transparent pricing for your community. Start free today.",
  },
};

export default function PricingPage() {
  return <PricingPageContent />;
}
