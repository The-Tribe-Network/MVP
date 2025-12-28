'use client'

import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
// API imports preserved for future use
// import { useUserActivities } from '@/lib/hooks/use-activities'
// import { transformActivityData } from '../../lib/utils'
// import { ActivityWithUser } from '@/lib/database/types'
// import { ActivityFeedSkeleton } from './loading'
// import { ActivityFeedEmpty } from './empty'
// import { ActivityFeedError } from './error'
import { ActivityItem } from './activity-item'
import { mockActivities } from '../../mock/data'

// Set to true to use real API data, false for mock data (for screenshots)
const USE_MOCK_DATA = true

export default function ActivityFeed() {
  // API functionality preserved - uncomment to use real data
  // const { data: activities, isLoading, error, isError, refetch } = useUserActivities({ limit: 20 })

  // if (!USE_MOCK_DATA) {
  //   if (isLoading) {
  //     return <ActivityFeedSkeleton />
  //   }
  //
  //   if (isError) {
  //     return (
  //       <ActivityFeedError
  //         message={error instanceof Error ? error.message : 'Failed to load activities'}
  //         onRetry={() => refetch()}
  //       />
  //     )
  //   }
  //
  //   const transformedActivities = activities?.map((activity) => transformActivityData(activity as unknown as ActivityWithUser)) || []
  //
  //   if (transformedActivities.length === 0) {
  //     return <ActivityFeedEmpty />
  //   }
  // }

  // Use mock data for screenshots
  const displayActivities = USE_MOCK_DATA ? mockActivities : []

  return (
    <Card className="border-border/50 bg-card/50 lg:col-span-2">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          <Button variant="ghost" size="sm">
            View All
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="h-[600px]">
        <div className="divide-y divide-border/50">
          {displayActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}

