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
          We believe communities should own their data, control their privacy, and have tools that actually work for them — not advertisers.
        </p>

        <div className="pt-8 space-y-6 text-left max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Tribe started from a simple observation: existing social platforms weren't built for communities. They were built for engagement metrics, ad revenue, and data collection.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Real communities — diaspora groups, Greek organizations, fitness studios, cultural associations — deserve better. They deserve privacy, control, and tools designed for their actual needs.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            That's why we're building Tribe: a platform that puts communities first.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
