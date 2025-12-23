import { SectionContainer } from "@/components/marketing/section-container";
import { Lock, Ban, Eye } from "lucide-react";

export function PrivacyFeature() {
  const privacyFeatures = [
    {
      icon: Ban,
      title: "No Ads, Ever",
      description: "Your community isn't a product. We don't sell your data or show ads.",
    },
    {
      icon: Lock,
      title: "Invite-Only",
      description: "Control exactly who can join. No randos, no bots, no spam.",
    },
    {
      icon: Eye,
      title: "You Own Your Data",
      description: "Export everything, anytime. Your photos, your posts, your community.",
    },
  ];

  return (
    <SectionContainer>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Placeholder */}
          <div className="rounded-2xl border bg-secondary/20 aspect-square flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground">Screenshot: Privacy settings</p>
          </div>

          {/* Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Your Data, Your Rules
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">Privacy-First</h2>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Facebook mines your data. Instagram sells your attention. Tribe respects
              your privacy. No ads, no tracking, no algorithmic manipulation.
            </p>

            <div className="space-y-6 pt-4">
              {privacyFeatures.map((feature) => {
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
