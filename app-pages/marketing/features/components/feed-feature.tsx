import { SectionContainer } from "@/components/marketing/section-container";
import { MessageSquare, Heart, ImageIcon, CornerDownRight } from "lucide-react";

export function FeedFeature() {
  const feedFeatures = [
    {
      icon: MessageSquare,
      title: "Rich Posts & Comments",
      description:
        "Share updates, announcements, and memories. Nested replies keep conversations organized.",
    },
    {
      icon: Heart,
      title: "Engagement That Matters",
      description:
        "Likes, comments, and reactions from people who actually know you.",
    },
    {
      icon: ImageIcon,
      title: "Media-Rich Timeline",
      description:
        "Photos and albums integrated into your feed. Every post can be a memory.",
    },
  ];

  return (
    <SectionContainer background="muted">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8 order-2 md:order-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Your Community's Heartbeat
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">The Feed</h2>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              A timeline built for real communities. Share updates, celebrate
              wins, and keep everyone in the loop — without the noise of public
              social media.
            </p>

            <div className="space-y-6 pt-4">
              {feedFeatures.map((feature) => {
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
              {/* Mock post with media */}
              <div className="bg-background rounded-xl p-5 shadow-lg">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/50" />
                  <div className="flex-1">
                    <div className="h-3.5 bg-foreground/15 rounded w-24 mb-1.5" />
                    <div className="h-2.5 bg-foreground/10 rounded w-16" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3.5 bg-foreground/10 rounded w-full" />
                  <div className="h-3.5 bg-foreground/10 rounded w-4/5" />
                </div>
                {/* Mock image */}
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 h-32 mb-4 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-primary/40" />
                </div>
                {/* Engagement bar */}
                <div className="flex items-center gap-4 pt-2 border-t">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Heart className="w-4 h-4 fill-primary" />
                    <span className="text-xs font-medium">24</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">8</span>
                  </div>
                </div>
              </div>

              {/* Mock comment thread */}
              <div className="bg-background rounded-xl p-5 shadow-lg">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-500/50" />
                  <div className="flex-1">
                    <div className="h-3 bg-foreground/15 rounded w-20 mb-2" />
                    <div className="h-3 bg-foreground/10 rounded w-full" />
                  </div>
                </div>
                {/* Nested reply */}
                <div className="ml-8 pl-3 border-l-2 border-primary/20">
                  <div className="flex items-start gap-2">
                    <CornerDownRight className="w-3.5 h-3.5 text-primary/40 mt-1 flex-shrink-0" />
                    <div className="flex items-start gap-2 flex-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-500/50" />
                      <div className="flex-1">
                        <div className="h-2.5 bg-foreground/10 rounded w-16 mb-1.5" />
                        <div className="h-2.5 bg-foreground/10 rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock simple post */}
              <div className="bg-background/60 rounded-xl p-5 shadow border">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400/30 to-purple-500/50" />
                  <div className="flex-1">
                    <div className="h-3 bg-foreground/10 rounded w-28 mb-2" />
                    <div className="h-3 bg-foreground/5 rounded w-full" />
                    <div className="h-3 bg-foreground/5 rounded w-2/3 mt-1.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
