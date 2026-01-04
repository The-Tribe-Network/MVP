"use client";

import { SectionContainer } from "@/components/marketing/section-container";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { Check } from "lucide-react";

interface TierData {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  note: string;
}

export function PricingTiers() {
  const tiers: TierData[] = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for small communities getting started.",
      features: [
        "Up to 50 members",
        "10GB storage (~2,000 photos or ~70 videos)",
        "Video uploads up to 1080p",
        "3 active events + recurring",
        "Basic RSVPs",
        "All 4 roles (owner, admin, mod, member)",
        "Community timeline & posts",
        "No ads, privacy-first",
      ],
      cta: "Join Waitlist",
      highlighted: false,
      note: "Join the waitlist for early access",
    },
    {
      name: "Pro",
      price: "TBD",
      description: "For growing communities with structure.",
      features: [
        "Unlimited members",
        "100GB storage (~20,000 photos or ~700 videos)",
        "4K+ video uploads",
        "Unlimited active events",
        "Private events with invites",
        "Per-member permission overrides",
        "Capacity limits & waitlists",
        "Discord + Google Calendar sync",
      ],
      cta: "Coming Soon",
      highlighted: true,
      note: "Best for fraternities, clubs & communities",
    },
    {
      name: "Business",
      price: "TBD",
      description: "For commercial communities at scale.",
      features: [
        "Everything in Pro",
        "Unlimited storage",
        "Event templates & check-in",
        "Co-hosts for events",
        "All integrations (Slack, Gmail, etc.)",
        "Audit logs & analytics",
        "Custom branding (white-label)",
        "Priority support",
      ],
      cta: "Coming Soon",
      highlighted: false,
      note: "Best for gyms, hospitality & businesses",
    },
  ];

  return (
    <SectionContainer background="muted">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                tier.highlighted
                  ? "border-primary shadow-xl scale-105 bg-primary/5"
                  : "bg-card"
              }`}
            >
              {tier.highlighted && (
                <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wide mb-4">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-muted-foreground">
                      /{tier.period}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                {tier.name === "Free" ? (
                  <WaitlistForm source="pricing-free" className="w-full" />
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    {tier.cta}
                  </Button>
                )}
                <p className="text-xs text-center text-muted-foreground">
                  {tier.note}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            All plans include our core promise: No ads, no data mining, privacy-first.
          </p>
          <p className="text-sm text-muted-foreground">
            Questions about pricing?{" "}
            <a href="/about" className="text-primary hover:underline">
              Get in touch
            </a>
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
