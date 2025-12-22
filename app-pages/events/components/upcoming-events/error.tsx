import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface UpcomingEventsErrorProps {
  message?: string
  onRetry: () => void
}

export function UpcomingEventsError({ message, onRetry }: UpcomingEventsErrorProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load events</h3>
        <p className="text-muted-foreground mb-4">
          {message || 'Something went wrong while loading upcoming events'}
        </p>
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      </CardContent>
    </Card>
  )
}
