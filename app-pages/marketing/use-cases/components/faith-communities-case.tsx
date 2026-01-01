import { SectionContainer } from "@/components/marketing/section-container";
import { Heart, Calendar, Archive } from "lucide-react";

export function FaithCommunitiesCase() {
  return (
    <SectionContainer background="muted">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium uppercase tracking-wide">
              Primary Use Case
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Religious & Faith Communities
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From weekly services to annual celebrations, bring your
                congregation together. Coordinate volunteers, preserve sacred
                moments, and strengthen your community bond.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Multi-Generational Engagement
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Simple enough for all ages, powerful enough for leadership.
                    Keep every generation connected to community life, from
                    youth groups to elder councils.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Sacred Event Coordination
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Plan services, holy day celebrations, and community
                    gatherings with RSVPs and volunteer sign-ups. Know who's
                    bringing what before the potluck begins.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Archive className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Preserve Your Traditions</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Document celebrations, ceremonies, and milestone moments in
                    The Vault. Build a living archive of your community's
                    spiritual journey.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder */}
          <div className="rounded-2xl border bg-background/50 aspect-[4/3] flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground text-center px-4">
              Service announcements & community photo archives
            </p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
