import { SectionContainer } from "@/components/marketing/section-container";
import { MessageSquareX, ImageOff, ShieldAlert } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      icon: MessageSquareX,
      title: "GroupMe Chaos",
      description:
        "Important messages buried in endless threads. No structure, no organization, just noise.",
    },
    {
      icon: ImageOff,
      title: "Instagram Ephemerality",
      description:
        "Memories disappear after 24 hours. Finding that one photo from last year? Good luck.",
    },
    {
      icon: ShieldAlert,
      title: "Facebook Data Mining",
      description:
        "Your community deserves privacy. Not ads, not tracking, not data harvesting.",
    },
  ];

  return (
    <SectionContainer background="muted">
      <div className="max-w-4xl mx-auto text-center space-y-16">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold">
            Your Community Deserves Better
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Existing tools weren't built for real communities. They're built for engagement, ads, and data collection.
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
