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
} from "lucide-react";
import Image from "next/image";

// User avatars for attendees
const attendees = [
  { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
  { name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
  { name: "Emma Watson", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
  { name: "James Morrison", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
];

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
    <SectionContainer>
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
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 overflow-hidden shadow-xl order-1 md:order-none p-6 md:p-8">
            <div className="space-y-4">
              {/* Event card */}
              <div className="bg-background rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">Spring Fitness Challenge</h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">Peak Performance Gym</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Feb 1, 2026 · 8:00 AM</p>
                  </div>
                </div>

                {/* RSVP buttons */}
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Going
                    </span>
                  </div>
                  <div className="flex-1 py-2 rounded-lg bg-muted/50 border flex items-center justify-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Maybe
                    </span>
                  </div>
                  <div className="flex-1 py-2 rounded-lg bg-muted/50 border flex items-center justify-center gap-1.5">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Can't Go
                    </span>
                  </div>
                </div>

                {/* Attendee avatars - real photos */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex -space-x-2">
                    {attendees.map((attendee, i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-background overflow-hidden">
                        <Image
                          src={attendee.avatar}
                          alt={attendee.name}
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                      +63
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">67</span>/100
                    spots
                  </div>
                </div>
              </div>

              {/* Date poll */}
              <div className="bg-background rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 text-primary text-xs font-medium mb-3">
                  <Vote className="w-3.5 h-3.5" />
                  When should we do the team dinner?
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-8 rounded-lg bg-primary/20 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-primary/30 rounded-lg"
                        style={{ width: "75%" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-3">
                        <span className="text-xs font-medium">Friday, Jan 10</span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1">
                            <div className="w-4 h-4 rounded-full border border-background overflow-hidden">
                              <Image src={attendees[0].avatar} alt="" width={16} height={16} className="w-full h-full object-cover" />
                            </div>
                            <div className="w-4 h-4 rounded-full border border-background overflow-hidden">
                              <Image src={attendees[1].avatar} alt="" width={16} height={16} className="w-full h-full object-cover" />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">9</span>
                        </div>
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
                        <span className="text-xs font-medium">Saturday, Jan 11</span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1">
                            <div className="w-4 h-4 rounded-full border border-background overflow-hidden">
                              <Image src={attendees[2].avatar} alt="" width={16} height={16} className="w-full h-full object-cover" />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deadline notice */}
              <div className="bg-background/60 rounded-xl p-3.5 shadow border flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">RSVP Deadline</p>
                  <p className="text-xs text-muted-foreground">January 8, 2026 at 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
