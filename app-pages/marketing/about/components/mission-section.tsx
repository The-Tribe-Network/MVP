import { SectionContainer } from "@/components/marketing/section-container";

export function MissionSection() {
  return (
    <SectionContainer className="pt-32 md:pt-40">
      <div className="max-w-4xl mx-auto text-center space-y-8">
      <h2 className="text-2xl font-semibold text-foreground text-center">Our Story</h2>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          The Infrastructure for Communities Is{" "}
          <span className="text-primary">Broken</span>
        </h1>

        <div className="pt-8 space-y-6 text-left max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Third spaces are dying. The coffee shops, barbershops, and community centers where people once gathered organically are on a steady decline.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Since 2003, the amount of time we spend with friends in person has decreased by 70%. Today, 17% of Americans report having zero close friends, up from 1% in 1990. We spend more time online than ever, yet feel less connected to those around us.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Platforms we use today are built for broadcasting, not belonging. They optimize for strangers and engagement metrics to capture attention, not nurture real connections.
            And we're drowning in noise because of it. Endless feeds of irrelevant content buries what actually matters.{" "}
            <a
              href="https://www.youtube.com/watch?v=DRCYS21MBoM&list=PLw1seYwCUpVQSgVZwSiXVWBuwh7EvuOIx&index=1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Watch this video to learn more about the negative impacts.
            </a> (Please note that this video is not affiliated with Tribe.)
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            That's why we're building Tribe — <strong className="text-foreground">digital third place infrastructure</strong> to provide the tools needed to strengthen the bonds in communities. One home for members, memories, and the real-world moments that truly matter.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
