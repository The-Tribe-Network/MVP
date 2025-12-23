import { SectionContainer } from "@/components/marketing/section-container";

export function StorySection() {
  return (
    <SectionContainer background="muted">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">Our Story</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From frustration to solution
          </p>
        </div>

        <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
          <div className="p-8 bg-card rounded-2xl border">
            <h3 className="text-2xl font-semibold text-foreground mb-4">The Problem</h3>
            <p>
              Every community we talked to had the same complaints: GroupMe threads were chaotic, Instagram stories disappeared too quickly, Facebook mined their data, and WhatsApp wasn't built for structured organization.
            </p>
          </div>

          <div className="p-8 bg-card rounded-2xl border">
            <h3 className="text-2xl font-semibold text-foreground mb-4">The Gap</h3>
            <p>
              We realized there was no platform purpose-built for existing, high-density communities. Discord was for gamers. Slack was for work. Facebook was for... well, everyone (which meant it was optimized for no one).
            </p>
          </div>

          <div className="p-8 bg-card rounded-2xl border">
            <h3 className="text-2xl font-semibold text-foreground mb-4">The Solution</h3>
            <p>
              So we built Tribe. Privacy-first. Ad-free. Actually useful for communities that exist in real life. The Vault for preserving memories. Granular permissions for real organizational structures. Events that actually help you coordinate.
            </p>
          </div>

          <div className="text-center pt-8">
            <p className="text-xl font-medium text-foreground">
              We're just getting started.
            </p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
