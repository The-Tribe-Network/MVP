import { SectionContainer } from "@/components/marketing/section-container";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { Heart } from "lucide-react";

export function TeamSection() {
  return (
    <SectionContainer background="muted">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">Built with Purpose</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Tribe is built by a small, dedicated team passionate about giving communities the tools they deserve. We're developers, designers, and community organizers who've felt the pain of existing platforms firsthand.
          </p>
        </div>

        <div className="p-8 md:p-12 bg-card rounded-2xl border text-center space-y-8">
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              We're just getting started, and we'd love to have you along for the journey.
            </p>
            <p className="text-xl font-semibold">
              Join the waitlist and help us build something special.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <WaitlistForm source="about-team" variant="inline" />
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Want to reach us? Questions, feedback, or just want to chat?</p>
          <p className="mt-2">We'd love to hear from you.</p>
        </div>
      </div>
    </SectionContainer>
  );
}
