import { SectionContainer } from "@/components/marketing/section-container";

export function FeaturesHero() {
  return (
    <SectionContainer className="pt-32 md:pt-40">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          Everything Your Community{" "}
          <span className="text-primary">Needs</span>
        </h1>
        <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Powerful features designed for real communities. From photo archives to
          event coordination, we've thought of everything.
        </p>
      </div>
    </SectionContainer>
  );
}
