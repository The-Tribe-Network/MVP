import { MessageCircle } from 'lucide-react'

export function EventCommentsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
    </div>
  )
}
