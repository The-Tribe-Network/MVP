import { SectionContainer } from "@/components/marketing/section-container";
import { Check, Minus } from "lucide-react";

interface FeatureRow {
  feature: string;
  free: string | boolean;
  pro: string | boolean;
  business: string | boolean;
}

export function PricingComparison() {
  const features: FeatureRow[] = [
    // Core Limits
    { feature: "Members", free: "50", pro: "Unlimited", business: "Unlimited" },
    { feature: "Storage", free: "10GB", pro: "100GB", business: "Unlimited" },
    { feature: "Video quality", free: "1080p max", pro: "4K+", business: "4K+" },
    { feature: "Active events", free: "3", pro: "Unlimited", business: "Unlimited" },

    // Roles & Permissions
    { feature: "Basic roles (4)", free: true, pro: true, business: true },
    { feature: "Per-member permission overrides", free: false, pro: true, business: true },
    { feature: "Role customization", free: false, pro: true, business: true },
    { feature: "Audit logs", free: false, pro: false, business: true },

    // Events & Polls
    { feature: "Recurring events", free: true, pro: true, business: true },
    { feature: "Basic RSVPs", free: true, pro: true, business: true },
    { feature: "Multiple polls per event", free: false, pro: true, business: true },
    { feature: "Capacity limits & waitlists", free: false, pro: true, business: true },
    { feature: "Private events (invite-only)", free: false, pro: true, business: true },
    { feature: "Event templates", free: false, pro: false, business: true },
    { feature: "Co-hosts", free: false, pro: false, business: true },
    { feature: "Check-in system", free: false, pro: false, business: true },

    // Integrations
    { feature: "Discord integration", free: false, pro: true, business: true },
    { feature: "Google Calendar sync", free: false, pro: true, business: true },
    { feature: "Slack integration", free: false, pro: false, business: true },
    { feature: "Gmail integration", free: false, pro: false, business: true },

    // Extras
    { feature: "Analytics", free: false, pro: false, business: true },
    { feature: "White-label branding", free: false, pro: false, business: true },
    { feature: "Priority support", free: false, pro: true, business: true },
  ];

  const renderCell = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <Minus className="w-5 h-5 text-muted-foreground/40 mx-auto" />
      );
    }
    return <span className="font-medium">{value}</span>;
  };

  return (
    <SectionContainer>
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Compare Plans
          </h2>
          <p className="text-muted-foreground text-lg">
            See which plan fits your community
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-4 px-4 text-left font-semibold">Feature</th>
                <th className="py-4 px-4 text-center font-semibold">Free</th>
                <th className="py-4 px-4 text-center font-semibold bg-primary/5 rounded-t-lg">
                  Pro
                </th>
                <th className="py-4 px-4 text-center font-semibold">Business</th>
              </tr>
            </thead>
            <tbody>
              {features.map((row, index) => (
                <tr
                  key={row.feature}
                  className={index % 2 === 0 ? "bg-muted/30" : ""}
                >
                  <td className="py-3 px-4 text-sm">{row.feature}</td>
                  <td className="py-3 px-4 text-center text-sm">
                    {renderCell(row.free)}
                  </td>
                  <td className="py-3 px-4 text-center text-sm bg-primary/5">
                    {renderCell(row.pro)}
                  </td>
                  <td className="py-3 px-4 text-center text-sm">
                    {renderCell(row.business)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionContainer>
  );
}
