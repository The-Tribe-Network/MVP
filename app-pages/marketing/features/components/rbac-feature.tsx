import { SectionContainer } from "@/components/marketing/section-container";
import { Shield, UserCog, Settings } from "lucide-react";

export function RBACFeature() {
  const rbacFeatures = [
    {
      icon: UserCog,
      title: "20+ Permissions",
      description: "Fine-tune what each member can do. Posting, events, albums, moderation — all configurable.",
    },
    {
      icon: Shield,
      title: "Role-Based Defaults",
      description: "Owner, admin, moderator, member. Start with smart defaults, customize as needed.",
    },
    {
      icon: Settings,
      title: "Per-Member Overrides",
      description: "Grant special permissions or restrict specific members without changing their role.",
    },
  ];

  return (
    <SectionContainer>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Placeholder */}
          <div className="rounded-2xl border bg-secondary/20 aspect-square flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground">Screenshot: Permissions UI</p>
          </div>

          {/* Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Fine-Tuned Control
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">Granular RBAC</h2>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Your executive board shouldn't have the same permissions as new members.
              Tribe's role-based access control gives you surgical precision over who
              can do what.
            </p>

            <div className="space-y-6 pt-4">
              {rbacFeatures.map((feature) => {
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
