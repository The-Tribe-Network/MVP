import { SectionContainer } from "@/components/marketing/section-container";
import { Megaphone, Pin, Eye, CheckCheck } from "lucide-react";
import Image from "next/image";

// User avatars
const users = {
  admin: {
    name: "Maria Santos",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
    role: "Admin",
  },
  coach: {
    name: "Coach Mike",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    role: "Owner",
  },
};

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
          {/* Illustration */}
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 overflow-hidden shadow-xl p-6 md:p-8">
            <div className="space-y-4">
              {/* Pinned post */}
              <div className="bg-background rounded-xl p-4 shadow-lg border-l-4 border-primary">
                <div className="flex items-center gap-2 text-primary text-xs font-medium mb-3">
                  <Pin className="w-3.5 h-3.5" />
                  Pinned
                </div>
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={users.admin.avatar}
                      alt={users.admin.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs">{users.admin.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{users.admin.role}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium mb-1">Community Guidelines</p>
                <p className="text-xs text-muted-foreground">
                  Please review our updated community rules. Be respectful, stay on topic, and support each other.
                </p>
              </div>

              {/* Announcement */}
              <div className="bg-background rounded-xl p-4 shadow-lg border-l-4 border-amber-500">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-medium mb-3">
                  <Megaphone className="w-3.5 h-3.5" />
                  Announcement
                </div>
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={users.coach.avatar}
                      alt={users.coach.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs">{users.coach.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">{users.coach.role}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium mb-1">Schedule Change for Next Week</p>
                <p className="text-xs text-muted-foreground">
                  Due to the holiday, all morning sessions will start at 8 AM instead of 7 AM.
                </p>
                {/* Read receipts */}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-background" />
                    <div className="w-5 h-5 rounded-full bg-primary/20 border border-background" />
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-background" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <CheckCheck className="w-3 h-3 text-emerald-500" />
                    <span>Seen by 45 members</span>
                  </div>
                </div>
              </div>

              {/* Regular post */}
              <div className="bg-background/60 rounded-xl p-4 shadow border">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400/30 to-purple-500/50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Regular post</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      Just sharing some thoughts about today's session...
                    </p>
                  </div>
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
