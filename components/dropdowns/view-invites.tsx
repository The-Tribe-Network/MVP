"use client"

import { Badge, Check, Mail, X } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { TooltipButton } from "../ui/tooltip-button";
import { useUserInvitations, useAcceptInvitation, useRejectInvitation } from "@/lib/hooks/use-tribes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
}

export function ViewInvitesDropdown() {
  const router = useRouter();
  const { data: invites = [], isLoading } = useUserInvitations();
  const acceptInvitation = useAcceptInvitation();
  const rejectInvitation = useRejectInvitation();

  const handleAcceptInvite = async (inviteId: string, tribeId: string) => {
    try {
      await acceptInvitation.mutateAsync(inviteId);
      toast.success("Invitation accepted!");
      // Navigate to the tribe dashboard
      router.push(`/tribe/${tribeId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept invitation");
    }
  }

  const handleRejectInvite = async (inviteId: string) => {
    try {
      await rejectInvitation.mutateAsync(inviteId);
      toast.success("Invitation declined");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject invitation");
    }
  }
  return (
    <DropdownMenu>
      <TooltipButton
        message={"invites"}
        variant="ghost"
        size="icon"
        className="relative"
        wrapper={DropdownMenuTrigger}
      >
        <Mail className="h-5 w-5" />
        {invites.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />}
      </TooltipButton>
      <DropdownMenuContent align="start" className="w-96">
        <div className="px-3 py-2">
          <h3 className="font-semibold">Tribe Invites</h3>
          <p className="text-sm text-muted-foreground">
            You have {invites.length} pending {invites.length === 1 ? "invite" : "invites"}
          </p>
        </div>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="px-3 py-8 text-center text-muted-foreground">
            <p className="text-sm">Loading invitations...</p>
          </div>
        ) : invites.length === 0 ? (
          <div className="px-3 py-8 text-center text-muted-foreground">
            <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pending invites</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {invites.map((invite) => (
              <div key={invite.id} className="px-3 py-3 hover:bg-accent/50">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={invite.tribeAvatar || "/placeholder.svg"} alt={invite.tribeName} />
                    <AvatarFallback>{invite.tribeName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm truncate">{invite.tribeName}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Invited by {invite.invitedBy}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(new Date(invite.createdAt))}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="flex-1 h-8"
                        onClick={() => handleAcceptInvite(invite.id, invite.tribeId)}
                        disabled={acceptInvitation.isPending || rejectInvitation.isPending}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 bg-transparent"
                        onClick={() => handleRejectInvite(invite.id)}
                        disabled={acceptInvitation.isPending || rejectInvitation.isPending}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}