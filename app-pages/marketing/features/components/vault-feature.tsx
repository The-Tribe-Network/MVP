import { SectionContainer } from "@/components/marketing/section-container";
import { Archive, Search, FolderOpen, Clock } from "lucide-react";

export function VaultFeature() {
  const vaultFeatures = [
    {
      icon: FolderOpen,
      title: "Organized Albums",
      description: "Create albums for events, trips, or any occasion. Keep everything organized.",
    },
    {
      icon: Search,
      title: "Actually Searchable",
      description: "Find photos by date, event, or uploader. No more endless scrolling.",
    },
    {
      icon: Clock,
      title: "Chronological",
      description: "See your community's history unfold. Memories in order, always.",
    },
  ];

  return (
    <SectionContainer background="muted">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              The Sticky Feature
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Archive className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">The Vault</h2>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Never lose a memory again. The Vault is your community's photo archive —
              organized, searchable, and built to last. Instagram stories disappear.
              The Vault doesn't.
            </p>

            <div className="space-y-6 pt-4">
              {vaultFeatures.map((feature) => {
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

          {/* Placeholder */}
          <div className="rounded-2xl border bg-background/50 aspect-square flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground">Screenshot: Photo album grid</p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
