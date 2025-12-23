import { SectionContainer } from "@/components/marketing/section-container";
import { Calendar, Users, BarChart3 } from "lucide-react";

export function EventsFeature() {
  const eventFeatures = [
    {
      icon: Calendar,
      title: "Real RSVPs",
      description: "See who's coming, who's not, and who's maybe. Capacity limits and waitlists included.",
    },
    {
      icon: BarChart3,
      title: "Event Polls",
      description: "Can't decide on a date? Let members vote. Democracy for scheduling.",
    },
    {
      icon: Users,
      title: "Attendee Management",
      description: "Control who sees the attendee list. Public, members-only, or admins-only.",
    },
  ];

  return (
    <SectionContainer background="muted">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Real Coordination
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                Structured Events
              </h2>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Stop using Google Forms for RSVPs. Tribe's event system is built for
              communities that actually coordinate in real life.
            </p>

            <div className="space-y-6 pt-4">
              {eventFeatures.map((feature) => {
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

          {/* Placeholder */}
          <div className="rounded-2xl border bg-background/50 aspect-square flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground">Screenshot: Event detail page</p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
