import { SectionContainer } from "@/components/marketing/section-container";

export function PricingHero() {
  return (
    <SectionContainer className="pt-32 md:pt-40">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          Start Free, <span className="text-primary">Grow as You Need</span>
        </h1>

        <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          No credit card required. No hidden fees. Just transparent pricing that grows with your community.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          Join the Waitlist — Free for all early access users
        </div>
      </div>
    </SectionContainer>
  );
}
