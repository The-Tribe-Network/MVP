import { SectionContainer } from "@/components/marketing/section-container";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { Check } from "lucide-react";
import Link from "next/link";

export function PricingTiers() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started. All core features included.",
      features: [
        "Unlimited members",
        "The Vault (photo archives)",
        "Event management & RSVPs",
        "Granular permissions (20+)",
        "Privacy-first, no ads",
        "Community timeline & posts",
        "Comments & reactions",
        "Basic analytics",
      ],
      cta: "Join Waitlist",
      highlighted: true,
      note: "Join the waitlist for early access",
    },
    {
      name: "Pro",
      price: "TBD",
      period: "per month",
      description: "For communities that need more power and customization.",
      features: [
        "Everything in Free",
        "Advanced analytics & insights",
        "Custom branding & theming",
        "Priority support",
        "Advanced moderation tools",
        "Custom roles & permissions",
        "API access",
        "Dedicated account manager",
      ],
      cta: "Coming Soon",
      highlighted: false,
      note: "Pricing announced at launch",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with specific needs.",
      features: [
        "Everything in Pro",
        "SSO integration (SAML, OAuth)",
        "Custom SLA guarantees",
        "Dedicated infrastructure",
        "Advanced security features",
        "Custom integrations",
        "On-premise deployment option",
        "24/7 premium support",
      ],
      cta: "Contact Sales",
      highlighted: false,
      note: "Tailored to your needs",
    },
  ];

  return (
    <SectionContainer>
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
                    <span className="text-muted-foreground">/{tier.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
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
                ) : tier.name === "Pro" ? (
                  <Button className="w-full" disabled variant="outline">
                    {tier.cta}
                  </Button>
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
            <Link href="/about" className="text-primary hover:underline">
              Get in touch
            </Link>
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
