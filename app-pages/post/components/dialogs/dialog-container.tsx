"use client"

import { parseDialogPayload } from "@/app-pages/post/lib/utils"
import { imagePreviewSchema, deletePostSchema, deleteCommentSchema } from "@/app-pages/post/lib/schemas"
import { usePostDetailPageStore } from "@/app-pages/post/components/store-provider"

import PhotoMediaDialog from "@/components/dialogs/photo-media"
import { DeletePostDialog } from "./delete-post"
import { DeleteCommentDialog } from "./delete-comment"

export function PostDetailDialogContainer() {
  const selectedDialog = usePostDetailPageStore((s) => s.selectedDialog)
  const dialogPayload = usePostDetailPageStore((s) => s.dialogPayload)
  const isDialogOpen = usePostDetailPageStore((s) => s.isDialogOpen)
  const closeDialog = usePostDetailPageStore((s) => s.closeDialog)

  if (!selectedDialog || !dialogPayload) return null

  switch (selectedDialog) {
    case "image-preview": {
      const payload = parseDialogPayload(imagePreviewSchema, dialogPayload)
      return payload ? (
        <PhotoMediaDialog
          isOpen={isDialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
          imageUrl={payload.imageUrl}
        />
      ) : null
    }
    case "delete-post": {
      const payload = parseDialogPayload(deletePostSchema, dialogPayload)
      return payload ? <DeletePostDialog {...payload} /> : null
    }
    case "delete-comment": {
      const payload = parseDialogPayload(deleteCommentSchema, dialogPayload)
      return payload ? <DeleteCommentDialog {...payload} /> : null
    }
    default:
      return null
  }
}
