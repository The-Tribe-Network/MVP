"use client";

import { MapPin } from "lucide-react";
import { extractCityAndState } from "@/app-pages/tribe-dashboard/lib/utils";
import { useEffect, useState } from "react";

interface TribeLocationProps {
  tribeLocation: string | null;
};

export default function TribeLocation({ tribeLocation }: TribeLocationProps) {
  const [displayLocation, setDisplayLocation] = useState<string | null>(null);

  useEffect(() => {
    if (tribeLocation) {
      try {
        const parsed = JSON.parse(tribeLocation);
        // If JSON has city and state fields, use them
        if (parsed.city && parsed.state) {
          setDisplayLocation(`${parsed.city}, ${parsed.state}`);
        } else if (parsed.displayName) {
          // Extract city and state from displayName
          setDisplayLocation(extractCityAndState(parsed.displayName));
        } else {
          setDisplayLocation(extractCityAndState(tribeLocation));
        }
      } catch {
        // Not JSON, extract from plain text
        setDisplayLocation(extractCityAndState(tribeLocation));
      }
    }
  }, [tribeLocation]);

  return displayLocation && (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1 mb-2">
      <MapPin className="h-4 w-4" />
      <span className="font-medium truncate" title={displayLocation}>{displayLocation}</span>
    </div>
  )
}