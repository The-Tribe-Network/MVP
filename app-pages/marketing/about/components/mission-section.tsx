import { SectionContainer } from "@/components/marketing/section-container";

export function MissionSection() {
  return (
    <SectionContainer className="pt-32 md:pt-40">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          Building Tools Communities{" "}
          <span className="text-primary">Deserve</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          Your data. Your privacy. Your community. Tools that work for you — not advertisers.
        </p>

        <div className="pt-8 space-y-6 text-left max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground leading-relaxed">
            We're in a loneliness epidemic. Third spaces are disappearing. What's left? Platforms built for strangers, optimized for engagement over belonging.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            But real communities still exist that gather, coordinate, and build bonds that matter. They just lack the infrastructure they deserve.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            That's why we're building Tribe — <strong className="text-foreground">digital third place infrastructure</strong> for communities that already exist. One home for members, memories, and the real-world moments that strengthen connection.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
