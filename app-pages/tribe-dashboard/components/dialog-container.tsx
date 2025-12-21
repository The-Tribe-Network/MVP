"use client"

import InviteDialogContent from "@/components/dialogs/invite";
import PhotoMediaDialog from "@/components/dialogs/photo-media";
import TribeMembersDialog from "@/components/dialogs/tribe-members";
import { useTribeDashboardStore } from "./providers/store";
import type { DialogPayload } from "../lib/store";

export function TribeDashboardDialogContainer() {
  const isDialogOpen = useTribeDashboardStore((s) => s.isDialogOpen);
  const selectedDialog = useTribeDashboardStore((s) => s.selectedDialog);
  const dialogPayload = useTribeDashboardStore((s) => s.dialogPayload);
  const closeDialog = useTribeDashboardStore((s) => s.closeDialog);

  return (
    <>
      {selectedDialog === 'invite' && dialogPayload && (
        <InviteDialogContent
          isOpen={isDialogOpen}
          setIsOpen={(open) => !open && closeDialog()}
          {...(dialogPayload as DialogPayload['invite'])}
        />
      )}
      {selectedDialog === 'image-preview' && dialogPayload && (
        <PhotoMediaDialog
          isOpen={isDialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
          imageUrl={(dialogPayload as DialogPayload['image-preview']).imageUrl}
        />
      )}
      {selectedDialog === 'tribe-members' && dialogPayload && (
        <TribeMembersDialog
          isOpen={isDialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
          tribeId={(dialogPayload as DialogPayload['tribe-members']).tribeId}
        />
      )}
      {/* Add event-preview dialog here when implemented */}
    </>
  );
}
