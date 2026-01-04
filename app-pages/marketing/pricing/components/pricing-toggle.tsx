"use client";

import { cn } from "@/lib/utils";

interface PricingToggleProps {
  billingCycle: "monthly" | "annual";
  onToggle: (cycle: "monthly" | "annual") => void;
}

export function PricingToggle({ billingCycle, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => onToggle("monthly")}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
          billingCycle === "monthly"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Monthly
      </button>
      <button
        onClick={() => onToggle("annual")}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-lg transition-colors relative",
          billingCycle === "annual"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Annual
        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded-full">
          Save 20%
        </span>
      </button>
    </div>
  );
}
