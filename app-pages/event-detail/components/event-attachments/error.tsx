import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface EventAttachmentsErrorProps {
  message?: string
  onRetry?: () => void
}

export function EventAttachmentsError({ message, onRetry }: EventAttachmentsErrorProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load attachments</h3>
        <p className="text-muted-foreground mb-4">
          {message || 'Something went wrong while loading event attachments'}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
