"use client"

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Users } from "lucide-react";
import TribeLocation from "./tribe-location";
import { TribeInfoWidgetSkeleton } from "./tribe-info-widget-skeleton";
import { TribeInfoWidgetError } from "./tribe-info-widget-error";
import { useDialogStore } from "@/lib/stores/dialog-store";
import { useQuery } from "@tanstack/react-query";
import { tribeDetailOptions } from "@/lib/query-options";

interface TribeInfoWidgetProps {
  tribeId: string;
};

export default function TribeInfoWidget({
  tribeId,
}: TribeInfoWidgetProps) {
  const {
    data: tribe,
    isLoading, error,
    isError,
    refetch
  } = useQuery(tribeDetailOptions(tribeId));
  const openDialog = useDialogStore((s) => s.openDialog);

  if (isLoading && !tribe) {
    return <TribeInfoWidgetSkeleton />
  }

  if (isError || !tribe) {
    return <TribeInfoWidgetError error={error} onRetry={() => refetch()} />
  }

  const avatarFallback = tribe.name.substring(0, 2).toUpperCase();

  return (
    <Card>
      <CardHeader className="text-center pb-3">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => {
              if (tribe.avatar && tribe.avatar !== "/placeholder.svg") {
                openDialog('image-preview', { imageUrl: tribe.avatar, altText: `${tribe.name} avatar` })
              }
            }}
            className="cursor-pointer hover:opacity-90 transition-opacity disabled:cursor-default disabled:opacity-100"
            disabled={!tribe.avatar || tribe.avatar === "/placeholder.svg"}
            aria-label="View tribe avatar"
          >
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={tribe.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{avatarFallback}</AvatarFallback>
            </Avatar>
          </button>
        </div>
        <CardTitle className="text-2xl">{tribe.name}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openDialog('tribe-members', { tribeId })}
          className="text-muted-foreground hover:text-foreground"
        >
          <Users className="h-4 w-4" />
          <span className="font-medium">{tribe.memberCount.toLocaleString()} member{tribe.memberCount === 1 ? '' : 's'}</span>
        </Button>
        <TribeLocation tribeLocation={tribe.location} />
        <CardDescription className="text-balance">
          {tribe.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" size="sm" onClick={() => openDialog('invite', { tribeId, tribeName: tribe.name })}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Members
        </Button>
      </CardContent>
    </Card>
  )
}
