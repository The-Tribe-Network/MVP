import { SectionContainer } from "@/components/marketing/section-container";
import { Archive, Shield, Calendar } from "lucide-react";

export function SolutionSection() {
  const solutions = [
    {
      icon: Archive,
      title: "The Vault",
      description:
        "Organized photo albums that are actually searchable. Your memories, perfectly preserved and easy to find.",
      highlight: "The Sticky Feature",
    },
    {
      icon: Shield,
      title: "Granular Control",
      description:
        "20+ per-member permissions. Role-based access that actually works for your community structure.",
      highlight: "Fine-Tuned Permissions",
    },
    {
      icon: Calendar,
      title: "Structured Events",
      description:
        "Real RSVP systems, polls for planning, capacity limits. Events that actually get organized.",
      highlight: "Real Coordination",
    },
  ];

  return (
    <SectionContainer>
      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold">
            Tribe Changes Everything
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Built from the ground up for communities. Privacy-first, ad-free, and actually useful.
          </p>
        </div>

        <div className="space-y-24">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={solution.title}
                className={`grid md:grid-cols-2 gap-16 items-center ${
                  isEven ? "" : "md:grid-flow-dense"
                }`}
              >
                {/* Text */}
                <div className={`space-y-6 ${isEven ? "" : "md:col-start-2"}`}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {solution.highlight}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold">
                      {solution.title}
                    </h3>
                  </div>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    {solution.description}
                  </p>
                </div>

                {/* Placeholder for screenshot */}
                <div
                  className={`rounded-2xl border bg-secondary/20 aspect-[4/3] flex items-center justify-center ${
                    isEven ? "" : "md:col-start-1"
                  }`}
                >
                  <p className="text-muted-foreground text-sm">Screenshot placeholder</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
}
