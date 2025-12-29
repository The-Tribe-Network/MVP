import { SectionContainer } from "@/components/marketing/section-container";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { Trophy, Calendar, Camera } from "lucide-react";

export function SportsCase() {
  return (
    <SectionContainer>
      <div className="max-w-6xl mx-auto space-y-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Placeholder */}
          <div className="rounded-2xl border bg-secondary/20 aspect-[4/3] flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground text-center px-4">
              Team roster & game schedule
            </p>
          </div>

          {/* Text */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Sports Leagues & Teams
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Rec leagues, running clubs, intramural teams, and pickup groups. Coordinate games, track attendance, and celebrate wins together.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Game Day RSVPs</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Post your schedule and get RSVPs. Know if you have enough players before game time.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Season Archives</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Document your season with organized photo albums. Championship photos, team celebrations, and memorable moments.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Team Updates</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Share location changes, cancellations, and announcements. Everyone stays in the loop.
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
