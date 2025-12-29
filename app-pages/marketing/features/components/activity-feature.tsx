import Image from "next/image";
import { SectionContainer } from "@/components/marketing/section-container";
import { Activity, Bell, TrendingUp } from "lucide-react";

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
          {/* Screenshot */}
          <div className="rounded-2xl border bg-secondary/20 overflow-hidden shadow-xl">
            <Image
              src="/app-screenshots-1024/home_dashboard_light.png"
              alt="Activity Feed - Stay updated on everything happening in your tribe"
              width={1024}
              height={768}
              className="w-full h-auto block dark:hidden"
            />
            <Image
              src="/app-screenshots-1024/home_dashboard_dark.png"
              alt="Activity Feed - Stay updated on everything happening in your tribe"
              width={1024}
              height={768}
              className="w-full h-auto hidden dark:block"
            />
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
              Your central hub for everything happening in your community.
              No more checking multiple apps or scrolling through endless
              chats to stay in the loop.
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
