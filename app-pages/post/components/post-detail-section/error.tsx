import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"

interface PostDetailErrorProps {
  message?: string
  onRetry?: () => void
}

export function PostDetailError({ message, onRetry }: PostDetailErrorProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="pt-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
              <AlertCircle className="size-5" />
            </EmptyMedia>
            <EmptyTitle>Failed to load post</EmptyTitle>
            <EmptyDescription>
              {message || "Something went wrong while loading the post. Please try again."}
            </EmptyDescription>
          </EmptyHeader>

          {onRetry && (
            <EmptyContent>
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="size-4 mr-2" />
                Try again
              </Button>
            </EmptyContent>
          )}
        </Empty>
      </CardContent>
    </Card>
  )
}
