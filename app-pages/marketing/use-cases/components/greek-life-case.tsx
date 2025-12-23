import { SectionContainer } from "@/components/marketing/section-container";
import { GraduationCap, Users, Shield } from "lucide-react";

export function GreekLifeCase() {
  return (
    <SectionContainer>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Placeholder */}
          <div className="rounded-2xl border bg-secondary/20 aspect-[4/3] flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground text-center px-4">
              Chapter roster & event calendar
            </p>
          </div>

          {/* Text */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Greek Life
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Fraternities and sororities need more than GroupMe. Manage your chapter, plan events, and preserve memories.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Executive Board Permissions</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Give your E-board the tools they need. Granular permissions for officers, committee chairs, and general members.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Alumni Network</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Keep alums connected. Share updates, coordinate reunions, and maintain that lifelong bond.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Chapter Albums</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    From formal to philanthropy events, keep every memory organized by semester and event type.
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
