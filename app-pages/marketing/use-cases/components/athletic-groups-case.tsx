import { SectionContainer } from "@/components/marketing/section-container";
import { Calendar, Users, Camera } from "lucide-react";

export function AthleticGroupsCase() {
  return (
    <SectionContainer>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Placeholder */}
          <div className="rounded-2xl border bg-secondary/20 aspect-[4/3] flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground text-center px-4">
              Team schedule & game day photo gallery
            </p>
          </div>

          {/* Text */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Athletic & Recreation Groups
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're organizing weekend leagues or training for your
                next adventure, keep your team coordinated and motivated
                together.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Game & Meetup Scheduling</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Schedule practices, games, and group runs with built-in
                    RSVPs and capacity limits. No more chasing down
                    confirmations in group chats.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Team Roster Management</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Keep your member directory up to date. Find teammates,
                    coordinate carpools, and build connections that last beyond
                    the season.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Event Photo Galleries</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Capture race finishes, game-day moments, and training
                    milestones. Auto-organize photos by event in The Vault.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
