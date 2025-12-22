import { MessageCircle } from "lucide-react"

export function CommentsEmpty() {
  return (
    <div className="py-6 text-center flex flex-col items-center gap-2">
      <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">
        No comments yet. Be the first to comment!
      </p>
    </div>
  )
}
