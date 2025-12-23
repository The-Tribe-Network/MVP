import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/marketing/section-container";
import { Users, Lock, Bell, Sparkles } from "lucide-react";

export function FeaturesPreview() {
  const features = [
    {
      icon: Lock,
      title: "Privacy-First",
      description: "No ads, no tracking, no data mining. Your community, your data.",
    },
    {
      icon: Users,
      title: "Built for Communities",
      description: "Diaspora groups, Greek life, gyms, VIP lists. Made for real people.",
    },
    {
      icon: Bell,
      title: "Stay Coordinated",
      description: "Events, RSVPs, polls. Actually get things organized.",
    },
    {
      icon: Sparkles,
      title: "Chronological Feed",
      description: "No algorithmic chaos. See what matters, when it matters.",
    },
  ];

  return (
    <SectionContainer background="muted">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold">
            Everything You Need, Nothing You Don't
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Focused on what communities actually need to thrive.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex gap-6 p-6 rounded-2xl bg-card hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-8">
          <Link href="/features">
            <Button size="lg" variant="outline" className="text-base px-8">
              Explore All Features
            </Button>
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
}
