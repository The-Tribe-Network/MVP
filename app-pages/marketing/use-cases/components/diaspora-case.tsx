import { SectionContainer } from "@/components/marketing/section-container";
import { Globe, Calendar, Archive } from "lucide-react";

export function DiasporaCase() {
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
                Diaspora & Cultural Communities
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Keep your community connected across continents. Preserve cultural events, share memories, and coordinate gatherings — all in one place.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Archive className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cultural Event Archives</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Document festivals, weddings, and community gatherings. The Vault keeps your culture's story alive.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Event Coordination</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Organize community events with RSVPs, polls, and capacity limits. See who's coming before you book the venue.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Multi-Generational</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Simple enough for elders, powerful enough for organizers. Everyone stays in the loop.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder */}
          <div className="rounded-2xl border bg-background/50 aspect-[4/3] flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground text-center px-4">
              Community event photos & RSVP interface
            </p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
