import { SectionContainer } from "@/components/marketing/section-container";
import {
  Activity,
  Bell,
  TrendingUp,
  Heart,
  MessageSquare,
  ImageIcon,
  UserPlus,
  Trophy,
} from "lucide-react";
import Image from "next/image";

// User avatars for activity feed
const users = {
  sarah: {
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  },
  alex: {
    name: "Alex Rivera",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
  emma: {
    name: "Emma Watson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  jordan: {
    name: "Jordan Lee",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  },
  marcus: {
    name: "Marcus Johnson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
};

export function ActivityFeature() {
  const activityFeatures = [
    {
      icon: Activity,
      title: "Live Activity Feed",
      description:
        "See what's happening across your tribe. New posts, photo uploads, event RSVPs — all in one place.",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description:
        "Get notified about what matters. Mentions, replies, and event updates without the noise.",
    },
    {
      icon: TrendingUp,
      title: "Milestone Tracking",
      description:
        "Celebrate wins together. See when posts hit milestones, members join, and your tribe grows.",
    },
  ];

  return (
    <SectionContainer>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Illustration */}
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 overflow-hidden shadow-xl p-6 md:p-8">
            <div className="space-y-3">
              {/* Milestone notification */}
              <div className="bg-background rounded-xl p-3.5 shadow-lg border-l-4 border-amber-500">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-500/50 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      Post hit 50 likes!
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Your Saturday HIIT class photo is trending
                    </p>
                  </div>
                </div>
              </div>

              {/* Like notification */}
              <div className="bg-background rounded-xl p-3.5 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-rose-500/20">
                    <Image
                      src={users.sarah.avatar}
                      alt={users.sarah.name}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{users.sarah.name}</span>
                      <span className="text-muted-foreground"> liked your post</span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      "Great progress on your fitness goals!"
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span className="text-[10px] text-muted-foreground">2m</span>
                  </div>
                </div>
              </div>

              {/* Comment notification */}
              <div className="bg-background rounded-xl p-3.5 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary/20">
                    <Image
                      src={users.alex.avatar}
                      alt={users.alex.name}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{users.alex.name}</span>
                      <span className="text-muted-foreground"> commented</span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      "Count me in for next week's session!"
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] text-muted-foreground">15m</span>
                  </div>
                </div>
              </div>

              {/* New member notification */}
              <div className="bg-background rounded-xl p-3.5 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-emerald-500/20">
                    <Image
                      src={users.jordan.avatar}
                      alt={users.jordan.name}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{users.jordan.name}</span>
                      <span className="text-muted-foreground"> joined the tribe</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Welcome to Peak Performance Fitness!
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] text-muted-foreground">1h</span>
                  </div>
                </div>
              </div>

              {/* Photo upload notification */}
              <div className="bg-background/60 rounded-xl p-3.5 shadow border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-purple-500/20">
                    <Image
                      src={users.marcus.avatar}
                      alt={users.marcus.name}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{users.marcus.name}</span>
                      <span className="text-muted-foreground"> added 5 photos</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      to Spring Fitness Challenge album
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-[10px] text-muted-foreground">2h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Never Miss a Moment
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Activity className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                Activity & Notifications
              </h2>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Your central hub for everything happening in your community. No
              more checking multiple apps or scrolling through endless chats to
              stay in the loop.
            </p>

            <div className="space-y-6 pt-4">
              {activityFeatures.map((feature) => {
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
