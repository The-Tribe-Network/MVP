import { SectionContainer } from "@/components/marketing/section-container";
import { Megaphone, Pin, Eye } from "lucide-react";

export function AnnouncementsFeature() {
  const announcementFeatures = [
    {
      icon: Pin,
      title: "Pinned Posts",
      description:
        "Keep important information at the top. Meeting notes, rules, or key updates — always visible.",
    },
    {
      icon: Megaphone,
      title: "Announcements",
      description:
        "Mark posts as announcements to ensure they stand out. No more lost messages.",
    },
    {
      icon: Eye,
      title: "Read Receipts",
      description:
        "Know who's seen important updates. Accountability without awkward follow-ups.",
    },
  ];

  return (
    <SectionContainer>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Illustration placeholder */}
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 overflow-hidden shadow-xl p-12 md:p-16">
            <div className="space-y-6">
              {/* Mock pinned post */}
              <div className="bg-background rounded-xl p-6 shadow-lg border-l-4 border-primary">
                <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
                  <Pin className="w-4 h-4" />
                  Pinned
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-foreground/10 rounded w-3/4" />
                  <div className="h-4 bg-foreground/10 rounded w-1/2" />
                </div>
              </div>

              {/* Mock announcement */}
              <div className="bg-background rounded-xl p-6 shadow-lg border-l-4 border-amber-500">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-medium mb-3">
                  <Megaphone className="w-4 h-4" />
                  Announcement
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-foreground/10 rounded w-2/3" />
                  <div className="h-4 bg-foreground/10 rounded w-4/5" />
                </div>
              </div>

              {/* Mock regular post */}
              <div className="bg-background/60 rounded-xl p-6 shadow border">
                <div className="space-y-2">
                  <div className="h-4 bg-foreground/5 rounded w-1/2" />
                  <div className="h-4 bg-foreground/5 rounded w-3/4" />
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Cut Through the Noise
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Megaphone className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                Announcements & Pins
              </h2>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Important updates shouldn't get buried. Pin critical posts,
              mark announcements, and make sure your community never misses
              what matters most.
            </p>

            <div className="space-y-6 pt-4">
              {announcementFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
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
        </div>
      </div>
    </SectionContainer>
  );
}
