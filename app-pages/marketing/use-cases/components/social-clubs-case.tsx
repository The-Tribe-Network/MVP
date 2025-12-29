import { SectionContainer } from "@/components/marketing/section-container";
import { Users, Camera, MessageSquare } from "lucide-react";

export function SocialClubsCase() {
  return (
    <SectionContainer background="muted">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Social Clubs & Friend Groups
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Book clubs, dinner groups, neighborhood associations, or just your close friends — give your group a home that's not buried in a group chat.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Shared Photo Albums</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Stop asking "can you send me those photos?" Everyone can contribute to and access shared albums from trips, dinners, and hangouts.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Announcements That Stick</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Important updates don't get lost in endless text threads. Post once, everyone sees it.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Easy Event Planning</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Plan your next meetup with polls and RSVPs. Know who's coming before you book the table.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder */}
          <div className="rounded-2xl border bg-background/50 aspect-[4/3] flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground text-center px-4">
              Group photos & event planning
            </p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
