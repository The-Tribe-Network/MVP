import { SectionContainer } from "@/components/marketing/section-container";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

export function WaitlistCTA() {
  return (
    <SectionContainer>
      <div className="max-w-3xl mx-auto text-center space-y-10">
        <div className="space-y-6">
          <h2 className="text-4xl md:text-6xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Join the waitlist today. Be among the first to experience community organization, perfected.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <WaitlistForm source="pricing-cta" variant="inline" />
        </div>

        <div className="pt-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            No credit card required • Free to start • Cancel anytime
          </p>
          <p className="text-xs text-muted-foreground">
            By joining, you'll get exclusive early access and updates on our launch.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
