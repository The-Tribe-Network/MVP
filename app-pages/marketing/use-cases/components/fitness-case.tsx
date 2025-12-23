import { SectionContainer } from "@/components/marketing/section-container";
import { Dumbbell, TrendingUp, Calendar } from "lucide-react";

export function FitnessCase() {
  return (
    <SectionContainer background="muted">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Fitness Studios & Gyms
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Turn members into a community. Track progress, coordinate classes, and celebrate transformations together.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Class Schedules & RSVPs</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Post weekly class schedules. Let members RSVP with capacity limits. Know who's coming before class starts.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Progress Galleries</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Members can share transformation photos. Build motivation through community wins.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Member Directory</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Help members connect. Find workout partners, accountability buddies, or just make friends.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder */}
          <div className="rounded-2xl border bg-background/50 aspect-[4/3] flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground text-center px-4">
              Class schedule & member progress gallery
            </p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
