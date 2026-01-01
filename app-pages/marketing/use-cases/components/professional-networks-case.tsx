import { SectionContainer } from "@/components/marketing/section-container";
import { Briefcase, MapPin, Shield } from "lucide-react";

export function ProfessionalNetworksCase() {
  return (
    <SectionContainer background="muted">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Professional & Alumni Networks
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Maintain the connections that matter most. Coordinate industry
                events, keep alumni engaged, and build networks that grow with
                your community.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Member Directory</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Searchable profiles help members find each other by
                    industry, location, or expertise. Your network, always at
                    your fingertips.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Event Coordination</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Plan networking events, reunions, and industry meetups with
                    RSVPs and attendance tracking. See who's attending before
                    you book the venue.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Privacy-First Networking</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Control who sees what with granular permissions. Perfect for
                    exclusive alumni groups and professional communities that
                    value discretion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder */}
          <div className="rounded-2xl border bg-background/50 aspect-[4/3] flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground text-center px-4">
              Member directory & networking event RSVPs
            </p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
