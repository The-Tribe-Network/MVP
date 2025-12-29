import { SectionContainer } from "@/components/marketing/section-container";

export function StorySection() {
  return (
    <SectionContainer background="muted">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">Our Story</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Why we're building Tribe
          </p>
        </div>

        <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
          <div className="p-8 bg-card rounded-2xl border">
            <h3 className="text-2xl font-semibold text-foreground mb-4">The Observation</h3>
            <p>
              Third places are dying. The coffee shops, barbershops, and neighborhood spots where communities once gathered organically — they're disappearing. Since 2003, young people spend 70% less time with friends in person. In 2024, 17% of Americans report having <em>zero</em> close friends, up from 1% in 1990. We're more connected than ever, and lonelier than we've ever been.
            </p>
          </div>

          <div className="p-8 bg-card rounded-2xl border">
            <h3 className="text-2xl font-semibold text-foreground mb-4">The Bigger Picture</h3>
            <p>
              This isn't a tool problem — it's a belonging crisis. The platforms we use are built for broadcasting to strangers, not bonding with our people. They optimize for engagement metrics, not genuine connection. Meanwhile, the communities that <em>do</em> gather — Greek orgs, diaspora groups, fitness studios — are scattered across five apps, losing memories to disappearing stories and coordination to buried group chats. The infrastructure for real community is broken.
            </p>
          </div>

          <div className="p-8 bg-card rounded-2xl border">
            <h3 className="text-2xl font-semibold text-foreground mb-4">The Solution</h3>
            <p>
              So we built Tribe. A private home for communities that actually gather. One place to coordinate events, preserve memories, and manage your members. No algorithms, no ads, no data mining. Just your people.
            </p>
          </div>

          <div className="text-center pt-8">
            <p className="text-xl font-medium text-foreground">
              We're just getting started.
            </p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
