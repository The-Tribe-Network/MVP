import { SectionContainer } from "@/components/marketing/section-container";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { Check } from "lucide-react";

export function FinalCTA() {
  const benefits = [
    "Early access to all features",
    "Help shape the product",
    "Exclusive launch updates",
    "Be part of something special",
  ];

  return (
    <SectionContainer>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-12 md:p-16 text-center space-y-10">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold">
              Be Among the First
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join the waitlist and get early access when we launch. Help us build the community platform you actually want to use.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="max-w-md mx-auto pt-4">
            <WaitlistForm source="final-cta" variant="inline" />
          </div>

          <p className="text-xs text-muted-foreground">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
