"use client"

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Users } from "lucide-react";
import { useTribe } from "@/lib/hooks/use-tribes";
import TribeLocation from "./tribe-location";
import { TribeInfoWidgetSkeleton } from "./tribe-info-widget-skeleton";
import { TribeInfoWidgetError } from "./tribe-info-widget-error";
import { useTribeDashboardStore } from "../../store-provider";
import { useQuery } from "@tanstack/react-query";
import { tribeDetailOptions } from "@/lib/query-options";

interface TribeInfoWidgetProps {
  tribeId: string;
};

export default function TribeInfoWidget({
  tribeId,
}: TribeInfoWidgetProps) {
  const { data: tribeData, isLoading, error, isError, refetch } = useQuery({
    ...tribeDetailOptions(tribeId),
  });
  const openDialog = useTribeDashboardStore((s) => s.openDialog);

  if (isLoading && !tribeData) {
    return <TribeInfoWidgetSkeleton />
  }

  if (isError || !tribeData) {
    return <TribeInfoWidgetError error={error} onRetry={() => refetch()} />
  }

  const {
    name: tribeName,
    description: tribeDescription,
    memberCount: tribeMembers,
    avatar: tribeAvatar,
    location: tribeLocation,
  } = tribeData
  const avatarFallback = tribeName.substring(0, 2).toUpperCase();

  return (
    <Card>
      <CardHeader className="text-center pb-3">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => {
              if (tribeAvatar && tribeAvatar !== "/placeholder.svg") {
                openDialog('image-preview', { imageUrl: tribeAvatar, altText: `${tribeName} avatar` })
              }
            }}
            className="cursor-pointer hover:opacity-90 transition-opacity disabled:cursor-default disabled:opacity-100"
            disabled={!tribeAvatar || tribeAvatar === "/placeholder.svg"}
            aria-label="View tribe avatar"
          >
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={tribeAvatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{avatarFallback}</AvatarFallback>
            </Avatar>
          </button>
        </div>
        <CardTitle className="text-2xl">{tribeName}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openDialog('tribe-members', { tribeId })}
          className="text-muted-foreground hover:text-foreground"
        >
          <Users className="h-4 w-4" />
          <span className="font-medium">{tribeMembers.toLocaleString()} member{tribeMembers === 1 ? '' : 's'}</span>
        </Button>
        <TribeLocation tribeLocation={tribeLocation} />
        <CardDescription className="text-balance">
          {tribeDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" size="sm" onClick={() => openDialog('invite', { tribeId, tribeName })}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Members
        </Button>
      </CardContent>
    </Card>
  )
}
