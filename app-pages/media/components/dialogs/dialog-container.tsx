"use client"

import { parseDialogPayload } from "@/app-pages/media/lib/utils";
import { imagePreviewSchema, mediaUploadSchema } from "@/app-pages/media/lib/schemas";

import PhotoMediaDialog from "@/components/dialogs/photo-media";
import UploadMediaDialog from "@/app-pages/media/components/dialogs/upload-media";
import { useTribeMediaPageStore } from "@/app-pages/media/components/store-provider";

export function TribeMediaPageDialogContainer() {
  const selectedDialog = useTribeMediaPageStore((s) => s.selectedDialog);
  const dialogPayload = useTribeMediaPageStore((s) => s.dialogPayload);
  const isDialogOpen = useTribeMediaPageStore((s) => s.isDialogOpen);
  const closeDialog = useTribeMediaPageStore((s) => s.closeDialog);

  if (!selectedDialog || !dialogPayload) return null;

  switch (selectedDialog) {
    case "media-upload": {
      const payload = parseDialogPayload(mediaUploadSchema, dialogPayload);
      return payload ? <UploadMediaDialog {...payload} /> : null;
    }
    case "image-preview": {
      const payload = parseDialogPayload(imagePreviewSchema, dialogPayload);
      return payload ? (
        <PhotoMediaDialog
          isOpen={isDialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
          imageUrl={payload.imageUrl}
        />
      ) : null;
    }
    default:
      return null;
  }
}
