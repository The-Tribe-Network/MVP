import { SectionContainer } from "@/components/marketing/section-container";
import { Heart, Camera, Calendar } from "lucide-react";

export function FamiliesCase() {
  return (
    <SectionContainer background="muted">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium uppercase tracking-wide">
              For Every Generation
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Families
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Keep your family connected across generations and distances. Preserve memories, coordinate gatherings, and stay in touch — all in one private space.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Family Photo Archives</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    From holiday gatherings to everyday moments, keep every memory organized and accessible to the whole family.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Reunion Planning</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Coordinate family reunions, holiday dinners, and birthday parties with RSVPs and polls. No more endless group text chains.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Multigenerational Access</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Simple enough for grandparents, safe for kids. Control who can post and what younger family members can see.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder */}
          <div className="rounded-2xl border bg-background/50 aspect-[4/3] flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground text-center px-4">
              Family photo albums & reunion planning
            </p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
