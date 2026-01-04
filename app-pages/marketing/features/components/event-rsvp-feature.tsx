import { SectionContainer } from "@/components/marketing/section-container";
import {
  UserCheck,
  Users,
  Vote,
  Clock,
  Calendar,
  MapPin,
  Check,
  X,
  HelpCircle,
  Lock,
} from "lucide-react";

export function EventRSVPFeature() {
  const rsvpFeatures = [
    {
      icon: UserCheck,
      title: "Real RSVPs",
      description:
        "Going, not going, maybe. See exactly who's attending with clear commitment tracking.",
    },
    {
      icon: Vote,
      title: "Date Polling",
      description:
        "Can't decide on a date? Let members vote. Find the time that works for everyone.",
    },
    {
      icon: Lock,
      title: "Private Events & Invites",
      description:
        "Host invite-only events for select members. Perfect for exec meetings, VIP gatherings, or smaller groups within your community.",
    },
    {
      icon: Users,
      title: "Capacity Limits & Waitlists",
      description:
        "Set max attendees and automatically manage waitlists. First come, first served — fairly.",
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
              system is built for communities that actually need to know who's
              showing up.
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

          {/* Illustration */}
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 overflow-hidden shadow-xl order-1 md:order-none p-8 md:p-12">
            <div className="space-y-5">
              {/* Mock event card */}
              <div className="bg-background rounded-xl p-5 shadow-lg">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-foreground/15 rounded w-3/4 mb-2" />
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <div className="h-3 bg-foreground/10 rounded w-24" />
                    </div>
                  </div>
                </div>

                {/* RSVP buttons */}
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Going
                    </span>
                  </div>
                  <div className="flex-1 py-2.5 rounded-lg bg-muted/50 border flex items-center justify-center gap-2">
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Maybe
                    </span>
                  </div>
                  <div className="flex-1 py-2.5 rounded-lg bg-muted/50 border flex items-center justify-center gap-2">
                    <X className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Can't Go
                    </span>
                  </div>
                </div>

                {/* Attendee avatars */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/50 border-2 border-background" />
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-500/50 border-2 border-background" />
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-500/50 border-2 border-background" />
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400/30 to-purple-500/50 border-2 border-background" />
                    <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                      +5
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">12</span>/20
                    spots filled
                  </div>
                </div>
              </div>

              {/* Mock date poll */}
              <div className="bg-background rounded-xl p-5 shadow-lg">
                <div className="flex items-center gap-2 text-primary text-sm font-medium mb-4">
                  <Vote className="w-4 h-4" />
                  Date Poll
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-8 rounded-lg bg-primary/20 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-primary/30 rounded-lg"
                        style={{ width: "75%" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-3">
                        <span className="text-xs font-medium">Friday 8th</span>
                        <span className="text-xs text-muted-foreground">
                          9 votes
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-8 rounded-lg bg-muted/50 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-foreground/10 rounded-lg"
                        style={{ width: "42%" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-3">
                        <span className="text-xs font-medium">
                          Saturday 9th
                        </span>
                        <span className="text-xs text-muted-foreground">
                          5 votes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock deadline notice */}
              <div className="bg-background/60 rounded-xl p-4 shadow border flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium mb-0.5">
                    RSVP Deadline
                  </div>
                  <div className="h-2.5 bg-foreground/10 rounded w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
