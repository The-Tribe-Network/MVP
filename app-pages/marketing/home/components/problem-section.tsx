import { SectionContainer } from "@/components/marketing/section-container";
import { MapPinOff, Radio, Puzzle } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      icon: MapPinOff,
      title: "Third Spaces Are Dying",
      description:
        "Coffee shops and community centers are fading. More time online, less connection.",
    },
    {
      icon: Radio,
      title: "Broadcasting, Not Belonging",
      description:
        "Social platforms optimize for strangers and engagement. Reach over relationships.",
    },
    {
      icon: Puzzle,
      title: "Scattered Across Five Apps",
      description:
        "Events here, photos there, group chat somewhere else. No single home.",
    },
  ];

  return (
    <SectionContainer background="muted">
      <div className="max-w-4xl mx-auto text-center space-y-16">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold">
            The Infrastructure for Community Is Broken
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The U.S. Surgeon General declared loneliness a public health epidemic — with health risks as deadly as smoking 15 cigarettes daily. We spend 70% less time with friends in person since 2003. More connected than ever — lonelier than ever.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {problems.map((problem) => {
            const Icon = problem.icon;
            return (
              <div key={problem.title} className="space-y-4">
                <div className="w-14 h-14 mx-auto rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold">{problem.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
}
