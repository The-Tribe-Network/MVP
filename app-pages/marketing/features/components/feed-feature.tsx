import Image from "next/image";
import { SectionContainer } from "@/components/marketing/section-container";
import { MessageSquare, Heart, ImageIcon } from "lucide-react";

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
          <div className="space-y-8">
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

          {/* Screenshot */}
          <div className="rounded-2xl border bg-background/50 overflow-hidden shadow-xl">
            <Image
              src="/app-screenshots-1024/tribe_timeline_light.png"
              alt="Tribe Feed - A timeline of posts, updates, and community engagement"
              width={1024}
              height={768}
              className="w-full h-auto block dark:hidden"
            />
            <Image
              src="/app-screenshots-1024/tribe_timeline_dark.png"
              alt="Tribe Feed - A timeline of posts, updates, and community engagement"
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
