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
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 overflow-hidden shadow-xl p-8 md:p-12">
            <div className="space-y-4">
              {/* Milestone notification */}
              <div className="bg-background rounded-xl p-4 shadow-lg border-l-4 border-amber-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-500/50 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1">
                      Post hit 50 likes!
                    </div>
                    <div className="h-2.5 bg-foreground/10 rounded w-3/4" />
                  </div>
                </div>
              </div>

              {/* Like notification */}
              <div className="bg-background rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400/30 to-rose-500/50 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-3 bg-foreground/15 rounded w-20" />
                      <span className="text-xs text-muted-foreground">
                        liked your post
                      </span>
                    </div>
                    <div className="h-2.5 bg-foreground/10 rounded w-1/2" />
                  </div>
                  <div className="text-[10px] text-muted-foreground">2m</div>
                </div>
              </div>

              {/* Comment notification */}
              <div className="bg-background rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/50 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-3 bg-foreground/15 rounded w-16" />
                      <span className="text-xs text-muted-foreground">
                        commented
                      </span>
                    </div>
                    <div className="h-2.5 bg-foreground/10 rounded w-2/3" />
                  </div>
                  <div className="text-[10px] text-muted-foreground">15m</div>
                </div>
              </div>

              {/* New member notification */}
              <div className="bg-background rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-500/50 flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-3 bg-foreground/15 rounded w-24" />
                      <span className="text-xs text-muted-foreground">
                        joined the tribe
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground">1h</div>
                </div>
              </div>

              {/* Photo upload notification */}
              <div className="bg-background/60 rounded-xl p-4 shadow border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400/30 to-purple-500/50 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-3 bg-foreground/10 rounded w-20" />
                      <span className="text-xs text-muted-foreground">
                        added 5 photos
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground">2h</div>
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
