"use client";

import { useDialogStore, type DialogPayloadMap } from "@/lib/stores/dialog-store";
import PhotoMediaDialog from "@/components/dialogs/photo-media";
import InviteDialogContent from "@/components/dialogs/invite";
import TribeMembersDialog from "@/components/dialogs/tribe-members";
import UploadMediaDialog from "@/components/dialogs/upload-media";
import { DeletePostDialog } from "@/components/dialogs/delete-post";
import { DeleteCommentDialog } from "@/components/dialogs/delete-comment";
import { PhotoCarouselDialog } from "@/components/dialogs/photo-carousel";

export function GlobalDialogContainer() {
  const isDialogOpen = useDialogStore((s) => s.isDialogOpen);
  const selectedDialog = useDialogStore((s) => s.selectedDialog);
  const dialogPayload = useDialogStore((s) => s.dialogPayload);
  const closeDialog = useDialogStore((s) => s.closeDialog);

  if (!selectedDialog || !dialogPayload) return null;

  switch (selectedDialog) {
    case "image-preview": {
      const payload = dialogPayload as DialogPayloadMap["image-preview"];
      return (
        <PhotoMediaDialog
          isOpen={isDialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
          imageUrl={payload.imageUrl}
        />
      );
    }
    case "invite": {
      const payload = dialogPayload as DialogPayloadMap["invite"];
      return (
        <InviteDialogContent
          isOpen={isDialogOpen}
          setIsOpen={(open) => !open && closeDialog()}
          tribeId={payload.tribeId}
          tribeName={payload.tribeName}
        />
      );
    }
    case "tribe-members": {
      const payload = dialogPayload as DialogPayloadMap["tribe-members"];
      return (
        <TribeMembersDialog
          isOpen={isDialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
          tribeId={payload.tribeId}
        />
      );
    }
    case "media-upload": {
      const payload = dialogPayload as DialogPayloadMap["media-upload"];
      return (
        <UploadMediaDialog
          isOpen={isDialogOpen}
          onOpenChange={(open: boolean) => !open && closeDialog()}
          tribeId={payload.tribeId}
        />
      );
    }
    case "delete-post": {
      const payload = dialogPayload as DialogPayloadMap["delete-post"];
      return (
        <DeletePostDialog
          isOpen={isDialogOpen}
          onOpenChange={(open: boolean) => !open && closeDialog()}
          tribeId={payload.tribeId}
          postId={payload.postId}
          postContent={payload.postContent}
        />
      );
    }
    case "delete-comment": {
      const payload = dialogPayload as DialogPayloadMap["delete-comment"];
      return (
        <DeleteCommentDialog
          isOpen={isDialogOpen}
          onOpenChange={(open: boolean) => !open && closeDialog()}
          tribeId={payload.tribeId}
          postId={payload.postId}
          commentId={payload.commentId}
          commentContent={payload.commentContent}
        />
      );
    }
    case "event-preview":
      // TODO: Implement event preview dialog when available
      return null;
    case "photo-carousel": {
      const payload = dialogPayload as DialogPayloadMap["photo-carousel"];
      return (
        <PhotoCarouselDialog
          isOpen={isDialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
          photos={payload.photos}
          initialIndex={payload.initialIndex}
        />
      );
    }
    default:
      return null;
  }
}

