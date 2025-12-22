import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PastEventsErrorProps {
  message?: string
  onRetry: () => void
}

export function PastEventsError({ message, onRetry }: PastEventsErrorProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-3" />
        <h3 className="text-base font-semibold mb-2">Failed to load past events</h3>
        <p className="text-sm text-muted-foreground mb-3">
          {message || 'Something went wrong'}
        </p>
        <Button onClick={onRetry} variant="outline" size="sm">
          Try Again
        </Button>
      </CardContent>
    </Card>
  )
}
