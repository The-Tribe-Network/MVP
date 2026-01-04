import { SectionContainer } from "@/components/marketing/section-container";
import { Palette, Users, Heart, Sparkles } from "lucide-react";

export function ValuesSection() {
  const values = [
    {
      icon: Heart,
      title: "Inclusivity & Belonging",
      description: "Everyone deserves a place where they feel seen and valued. We build spaces where authentic connection thrives.",
    },
    {
      icon: Palette,
      title: "Simplicity",
      description: "Powerful features shouldn't require a manual. We build tools that just work.",
    },
    {
      icon: Users,
      title: "Community Control",
      description: "Communities should shape their own spaces. We give you the tools, you make it yours.",
    },
    {
      icon: Sparkles,
      title: "Intimate Moments",
      description: "Life with the right people is ecstatic. We help cultivate environments where shared values, experiences, and desires bring people closer together.",
    },
  ];

  return (
    <SectionContainer>
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">Our Values</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            These principles guide every decision we make.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="p-8 rounded-2xl bg-secondary/10 border hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
}
