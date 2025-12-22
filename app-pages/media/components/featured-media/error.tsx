import { AlertCircle, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"

interface FeaturedMediaErrorProps {
  message?: string
  onRetry?: () => void
}

export function FeaturedMediaError({ message, onRetry }: FeaturedMediaErrorProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">All Albums</h2>

      <Empty className="border border-destructive/20 bg-destructive/5 min-h-[300px]">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
            <AlertCircle className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Failed to load albums</EmptyTitle>
          <EmptyDescription>
            {message || "Something went wrong while loading the albums. Please try again."}
          </EmptyDescription>
        </EmptyHeader>

        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="size-4 mr-2" />
            Try again
          </Button>
        )}
      </Empty>
    </section>
  )
}

