"use client"

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Users, MapPin } from "lucide-react";
import InviteDialogContent from "@/components/dialogs/invite";
import { TribeMembersModal } from "./tribe-members-modal";

interface TribeInfoWidgetProps {
  tribeId: string;
  tribeName: string;
  tribeDescription: string;
  tribeMembers: number;
  tribeAvatar?: string;
  tribeLocation?: string | null;
};

export const mockTribeInfoWidgetData = {
  tribeName: "The Crew",
  tribeDescription: "Our tight-knit community of friends sharing life&apos;s moments together",
  tribeMembers: 24,
};

// Helper function to extract city and state from address string
function extractCityAndState(address: string): string {
  const parts = address.split(',').map(p => p.trim());
  const usStates = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

  // Find state index
  const stateIndex = parts.findIndex((p, i) => {
    const isState = usStates.includes(p) || (p.length === 2 && /^[A-Z]{2}$/.test(p));
    const nextIsZip = i + 1 < parts.length && /^\d{5}/.test(parts[i + 1]);
    const nextIsCountry = i + 1 < parts.length && parts[i + 1].toLowerCase().includes('united states');
    return isState && (nextIsZip || nextIsCountry || i === parts.length - 2);
  });

  if (stateIndex > 0) {
    // City is typically the part before state (skip county if present)
    // If the part before state contains "County", look one more back
    let cityIndex = stateIndex - 1;
    if (cityIndex >= 0 && parts[cityIndex].toLowerCase().includes('county')) {
      cityIndex = cityIndex - 1;
    }
    if (cityIndex >= 0) {
      return `${parts[cityIndex]}, ${parts[stateIndex]}`;
    }
  }

  // Fallback: return original if we can't parse
  return address;
}

export default function TribeInfoWidget({
  tribeId,
  tribeName,
  tribeDescription,
  tribeMembers,
  tribeAvatar,
  tribeLocation,
}: TribeInfoWidgetProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

  const avatarFallback = tribeName.substring(0, 2).toUpperCase()

  // Parse location to extract only city and state
  let displayLocation: string | null = null;
  if (tribeLocation) {
    try {
      const parsed = JSON.parse(tribeLocation);
      // If JSON has city and state fields, use them
      if (parsed.city && parsed.state) {
        displayLocation = `${parsed.city}, ${parsed.state}`;
      } else if (parsed.displayName) {
        // Extract city and state from displayName
        displayLocation = extractCityAndState(parsed.displayName);
      } else {
        displayLocation = extractCityAndState(tribeLocation);
      }
    } catch {
      // Not JSON, extract from plain text
      displayLocation = extractCityAndState(tribeLocation);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="text-center pb-3">
          <TribeMembersModal tribeId={tribeId} >
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <Users className="h-4 w-4" />
              <span className="font-medium">{tribeMembers.toLocaleString()} member{tribeMembers === 1 ? '' : 's'}</span>
            </button>
          </TribeMembersModal>
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={tribeAvatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{avatarFallback}</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">{tribeName}</CardTitle>
          {displayLocation && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1 mb-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium truncate" title={displayLocation}>{displayLocation}</span>
            </div>
          )}
          <CardDescription className="text-balance">
            {tribeDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">


          <Button className="w-full" size="sm" onClick={() => setIsInviteDialogOpen(!isInviteDialogOpen)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Members
          </Button>
        </CardContent>
      </Card>
      <InviteDialogContent
        isOpen={isInviteDialogOpen}
        setIsOpen={setIsInviteDialogOpen}
        tribeId={tribeId}
        tribeName={tribeName}
      />
    </>
  )
}