import Image from "next/image";
import { SectionContainer } from "@/components/marketing/section-container";
import { UserCheck, Users, Vote, Clock } from "lucide-react";

export function EventRSVPFeature() {
  const rsvpFeatures = [
    {
      icon: UserCheck,
      title: "Real RSVPs",
      description:
        "Going, not going, maybe. See exactly who's attending with clear commitment tracking.",
    },
    {
      icon: Users,
      title: "Capacity Limits & Waitlists",
      description:
        "Set max attendees and automatically manage waitlists. First come, first served — fairly.",
    },
    {
      icon: Vote,
      title: "Date Polling",
      description:
        "Can't decide on a date? Let members vote. Find the time that works for everyone.",
    },
    {
      icon: Clock,
      title: "RSVP Deadlines",
      description:
        "Set cutoff dates for responses. No more last-minute maybes ruining your headcount.",
    },
  ];

  return (
    <SectionContainer background="muted">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8 order-2 md:order-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Real Coordination
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">Event RSVPs</h2>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Stop using Google Forms and hoping people respond. Tribe's RSVP
              system is built for communities that actually need to know
              who's showing up.
            </p>

            <div className="space-y-6 pt-4">
              {rsvpFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Screenshot */}
          <div className="rounded-2xl border bg-background/50 overflow-hidden shadow-xl order-1 md:order-none">
            <Image
              src="/app-screenshots-1024/event_rsvp_light.png"
              alt="Event RSVPs - Capacity limits, waitlists, and date polling"
              width={1024}
              height={768}
              className="w-full h-auto block dark:hidden"
            />
            <Image
              src="/app-screenshots-1024/event_rsvp_dark.png"
              alt="Event RSVPs - Capacity limits, waitlists, and date polling"
              width={1024}
              height={768}
              className="w-full h-auto hidden dark:block"
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
