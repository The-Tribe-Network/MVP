"use client"

import { useRouter } from 'next/navigation'
import { useDeletePost } from '@/lib/hooks/use-posts'
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

interface DeletePostDialogProps {
  tribeId: string
  postId: string
  postContent?: string
}

export function DeletePostDialog({ tribeId, postId, postContent }: DeletePostDialogProps) {
  const router = useRouter()
  const deletePostMutation = useDeletePost()
  const isDialogOpen = usePostDetailPageStore((s) => s.isDialogOpen)
  const closeDialog = usePostDetailPageStore((s) => s.closeDialog)

  const handleDelete = async () => {
    try {
      await deletePostMutation.mutateAsync({ tribeId, postId })
      toast.success('Post deleted successfully')
      closeDialog()
      router.push(`/tribe/${tribeId}/timeline`)
    } catch (error) {
      console.error('Failed to delete post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete post')
    }
  }

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete post?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this post and all its comments.
            {postContent && (
              <span className="block mt-2 text-sm italic truncate">
                "{postContent}..."
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePostMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deletePostMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deletePostMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
