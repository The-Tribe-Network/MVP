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

interface GeneralSettingsErrorProps {
  message?: string
  onRetry?: () => void
}

export function GeneralSettingsError({ message, onRetry }: GeneralSettingsErrorProps) {
  return (
    <Empty className="border border-destructive/20 bg-destructive/5 min-h-[400px]">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
          <AlertCircle className="size-5" />
        </EmptyMedia>
        <EmptyTitle>Failed to load settings</EmptyTitle>
        <EmptyDescription>
          {message || "Something went wrong while loading the tribe settings. Please try again."}
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
  )
}

