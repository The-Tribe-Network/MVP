import { SectionContainer } from "@/components/marketing/section-container";
import { MessageSquare, Heart, ImageIcon, CornerDownRight } from "lucide-react";
import Image from "next/image";

// Realistic user data with Unsplash avatars
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
  james: {
    name: "James Morrison",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
};

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
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 overflow-hidden shadow-xl order-1 md:order-none p-6 md:p-8">
            <div className="space-y-4">
              {/* Post with media */}
              <div className="bg-background rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={users.sarah.avatar}
                      alt={users.sarah.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{users.sarah.name}</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <p className="text-sm mb-3 leading-relaxed">
                  Just crushed our Saturday morning HIIT class! 23 members showed up today. The energy was incredible!
                </p>
                {/* Real image */}
                <div className="rounded-lg overflow-hidden mb-3 border">
                  <Image
                    src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=300&fit=crop"
                    alt="Group workout"
                    width={600}
                    height={300}
                    className="w-full h-auto object-cover"
                  />
                </div>
                {/* Engagement bar */}
                <div className="flex items-center gap-4 pt-2 border-t">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Heart className="w-4 h-4 fill-primary" />
                    <span className="text-xs font-medium">34</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">12</span>
                  </div>
                </div>
              </div>

              {/* Comment thread */}
              <div className="bg-background rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={users.alex.avatar}
                      alt={users.alex.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs">{users.alex.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      That was such a great session! See you all next week!
                    </p>
                  </div>
                </div>
                {/* Nested reply */}
                <div className="ml-8 pl-3 border-l-2 border-primary/20">
                  <div className="flex items-start gap-2">
                    <CornerDownRight className="w-3.5 h-3.5 text-primary/40 mt-1 flex-shrink-0" />
                    <div className="flex items-start gap-2 flex-1">
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={users.emma.avatar}
                          alt={users.emma.name}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs">{users.emma.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Count me in! Best workout of the week.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple post */}
              <div className="bg-background/60 rounded-xl p-4 shadow border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={users.james.avatar}
                      alt={users.james.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs">{users.james.name}</p>
                      <span className="text-xs text-muted-foreground">· 1d ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Reminder: Our nutrition workshop is tomorrow at 6 PM. Don't miss it!
                    </p>
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
