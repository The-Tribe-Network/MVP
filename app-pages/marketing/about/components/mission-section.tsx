import { SectionContainer } from "@/components/marketing/section-container";

export function MissionSection() {
  return (
    <SectionContainer className="pt-32 md:pt-40">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          The Infrastructure for Communities Is{" "}
          <span className="text-primary">Broken</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          Third spaces are dying. The coffee shops, barbershops, and community centers where people once gathered organically are fading away.
        </p>

        <div className="pt-8 space-y-6 text-left max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground text-center">Our Story</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Since 2003, the amount of time we spend with friends in person has decreased by 70%. Today, 17% of Americans report having zero close friends, up from 1% in 1990. We spend more time online than ever, yet feel less connected to those around us.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            This is a byproduct of the advancements in technology. Platforms we use today are built for broadcasting, not belonging. They optimize for strangers and engagement metrics to capture attention, not nurture real connections.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            And we're drowning in noise because of it. Endless feeds of irrelevant content bury what actually matters. The communities that <em>do</em> gather are scattered across multiple of apps, losing memories to disappearing stories and coordination to buried group chats.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            That's why we're building Tribe — <strong className="text-foreground">digital third place infrastructure</strong> to provide the tools needed to strengthen the bonds in communities. One home for members, memories, and the real-world moments that truly matter.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
