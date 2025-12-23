import { SectionContainer } from "@/components/marketing/section-container";

export function UseCasesHero() {
  return (
    <SectionContainer className="pt-32 md:pt-40">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          Your Community, <span className="text-primary">Your Way</span>
        </h1>
        <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          From diaspora communities to Greek life, fitness studios to VIP lists — Tribe adapts to your community's unique needs.
        </p>
      </div>
    </SectionContainer>
  );
}
