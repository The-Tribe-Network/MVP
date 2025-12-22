'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ActivityFeedErrorProps {
  message?: string
  onRetry?: () => void
}

export function ActivityFeedError({ message, onRetry }: ActivityFeedErrorProps) {
  return (
    <Card className="border-border/50 bg-card/50 lg:col-span-2">
      <div className="border-b border-border/50 p-6">
        <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
      </div>
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Failed to load activities</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          {message || 'Something went wrong while loading your activity feed.'}
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        )}
      </div>
    </Card>
  )
}

