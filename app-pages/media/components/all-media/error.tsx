import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"

interface AllMediaErrorProps {
  message?: string
  onRetry?: () => void
}

export function AllMediaError({ message, onRetry }: AllMediaErrorProps) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-4">All Media</h2>
      
      <Empty className="border border-destructive/20 bg-destructive/5 min-h-[300px]">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
            <AlertCircle className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Failed to load media</EmptyTitle>
          <EmptyDescription>
            {message || "Something went wrong while loading the media. Please try again."}
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
    </section>
  )
}

