'use client'

import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUserActivities } from '@/lib/hooks/use-activities'
import { ActivityItem } from './activity-item'
import { ActivityFeedSkeleton } from './loading'
import { ActivityFeedEmpty } from './empty'
import { ActivityFeedError } from './error'
import { transformActivityData } from '../../lib/utils'

export default function ActivityFeed() {
  const { data: activities, isLoading, error, isError, refetch } = useUserActivities({ limit: 20 })

  if (isLoading) {
    return <ActivityFeedSkeleton />
  }

  if (isError) {
    return (
      <ActivityFeedError
        message={error instanceof Error ? error.message : 'Failed to load activities'}
        onRetry={() => refetch()}
      />
    )
  }

  const transformedActivities = activities?.map(transformActivityData) || []

  if (transformedActivities.length === 0) {
    return <ActivityFeedEmpty />
  }

  return (
    <Card className="border-border/50 bg-card/50 lg:col-span-2">
      <div className="border-b border-border/50 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          <Button variant="ghost" size="sm">
            View All
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="divide-y divide-border/50">
          {transformedActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}

