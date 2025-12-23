import { SectionContainer } from "@/components/marketing/section-container";
import { Check, X } from "lucide-react";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

export function ComparisonTable() {
  const features = [
    {
      name: "Organized Photo Albums",
      tribe: true,
      facebook: false,
      whatsapp: false,
      discord: false,
    },
    {
      name: "Granular Permissions (20+)",
      tribe: true,
      facebook: false,
      whatsapp: false,
      discord: true,
    },
    {
      name: "Event RSVPs & Polls",
      tribe: true,
      facebook: true,
      whatsapp: false,
      discord: false,
    },
    {
      name: "No Ads",
      tribe: true,
      facebook: false,
      whatsapp: true,
      discord: true,
    },
    {
      name: "No Data Mining",
      tribe: true,
      facebook: false,
      whatsapp: false,
      discord: true,
    },
    {
      name: "Chronological Feed",
      tribe: true,
      facebook: false,
      whatsapp: true,
      discord: true,
    },
    {
      name: "Built for Communities",
      tribe: true,
      facebook: false,
      whatsapp: false,
      discord: false,
    },
  ];

  return (
    <SectionContainer background="muted">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold">
            How Tribe Compares
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We're not trying to beat Facebook at their game. We're building
            something different.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-card rounded-2xl overflow-hidden shadow-lg">
            <thead>
              <tr className="border-b">
                <th className="text-left p-6 font-semibold">Feature</th>
                <th className="p-6 font-semibold">
                  <span className="text-primary">Tribe</span>
                </th>
                <th className="p-6 font-semibold text-muted-foreground">
                  Facebook Groups
                </th>
                <th className="p-6 font-semibold text-muted-foreground">
                  WhatsApp
                </th>
                <th className="p-6 font-semibold text-muted-foreground">
                  Discord
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={feature.name}
                  className={index !== features.length - 1 ? "border-b" : ""}
                >
                  <td className="p-6 font-medium">{feature.name}</td>
                  <td className="p-6 text-center">
                    {feature.tribe ? (
                      <Check className="w-5 h-5 text-primary mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                    )}
                  </td>
                  <td className="p-6 text-center">
                    {feature.facebook ? (
                      <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                    )}
                  </td>
                  <td className="p-6 text-center">
                    {feature.whatsapp ? (
                      <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                    )}
                  </td>
                  <td className="p-6 text-center">
                    {feature.discord ? (
                      <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 pt-8">
          <p className="text-lg text-muted-foreground">
            Ready to try something better?
          </p>
          <div className="max-w-md mx-auto">
            <WaitlistForm source="features-comparison" variant="inline" />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
