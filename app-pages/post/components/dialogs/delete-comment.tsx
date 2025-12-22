"use client"

import { useDeleteComment } from '@/lib/hooks/use-comments'
import { usePostDetailPageStore } from '../store-provider'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteCommentDialogProps {
  tribeId: string
  postId: string
  commentId: string
  commentContent?: string
}

export function DeleteCommentDialog({ tribeId, postId, commentId, commentContent }: DeleteCommentDialogProps) {
  const deleteCommentMutation = useDeleteComment()
  const isDialogOpen = usePostDetailPageStore((s) => s.isDialogOpen)
  const closeDialog = usePostDetailPageStore((s) => s.closeDialog)

  const handleDelete = async () => {
    try {
      await deleteCommentMutation.mutateAsync({ tribeId, postId, commentId })
      toast.success('Comment deleted successfully')
      closeDialog()
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment')
    }
  }

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete comment?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this comment.
            {commentContent && (
              <span className="block mt-2 text-sm italic truncate">
                "{commentContent}..."
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteCommentMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCommentMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
