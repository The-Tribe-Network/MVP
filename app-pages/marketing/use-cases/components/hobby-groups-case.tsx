import { SectionContainer } from "@/components/marketing/section-container";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { Palette, UserPlus, MessageSquare } from "lucide-react";

export function HobbyGroupsCase() {
  return (
    <SectionContainer>
      <div className="max-w-6xl mx-auto space-y-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Placeholder */}
          <div className="rounded-2xl border bg-secondary/20 aspect-[4/3] flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground text-center px-4">
              Project gallery & community discussion feed
            </p>
          </div>

          {/* Text */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Social & Hobby Groups
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From book clubs to maker spaces, bring your passion community
                together. Share creations, coordinate gatherings, and welcome
                new members with ease.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Share Your Creations</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Post photos of projects, artworks, and accomplishments. The
                    Vault keeps your community's creative output beautifully
                    organized.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Easy Onboarding</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Invite new members with controlled access levels. Set
                    permissions so newcomers can participate without
                    overwhelming admin duties.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Community Discussion</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Rich posts with comments, likes, and nested replies. Build
                    conversations around shared interests, not scattered across
                    multiple apps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA for Use Cases */}
        <div className="text-center space-y-8 pt-16">
          <div className="space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold">
              Ready to Build Your Community?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join the waitlist and be among the first to try Tribe.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <WaitlistForm source="use-cases" variant="inline" />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
