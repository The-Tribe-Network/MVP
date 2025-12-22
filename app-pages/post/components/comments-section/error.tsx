import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CommentsErrorProps {
  message?: string
  onRetry?: () => void
}

export function CommentsError({ message, onRetry }: CommentsErrorProps) {
  return (
    <div className="py-6 text-center space-y-4">
      <div className="flex flex-col items-center gap-2">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {message || "Failed to load comments"}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      )}
    </div>
  )
}
