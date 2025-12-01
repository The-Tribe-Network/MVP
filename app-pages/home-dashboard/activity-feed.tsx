'use client'

import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUserActivities } from '@/lib/hooks/use-activities'
import { formatRelativeTime } from '@/lib/utils'
import type { ActivityWithUser } from '@/lib/database/types'

export function ActivityFeed() {
  const { data: activities, isLoading, error } = useUserActivities({ limit: 20 })

  // Transform API data to match Activity interface
  const transformedActivities = activities?.map((activity: ActivityWithUser) => ({
    id: activity.id,
    type: activity.type as 'post' | 'photo' | 'event' | 'member',
    user: {
      name: activity.user.name || 'Unknown',
      avatar: activity.user.image || '/placeholder.svg',
    },
    tribe: {
      name: activity.tribe?.name || 'Unknown Tribe',
      avatar: activity.tribe?.avatar || '/placeholder.svg',
    },
    action: activity.action,
    timestamp: formatRelativeTime(activity.createdAt),
    preview: activity.preview || undefined,
  })) || []

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
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              Loading activities...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-destructive">
              {error instanceof Error ? error.message : 'Failed to load activities'}
            </div>
          ) : transformedActivities.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No recent activity
            </div>
          ) : (
            transformedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-4 p-6 transition-colors hover:bg-muted/50"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{activity.user.name}</span>{' '}
                        <span className="text-muted-foreground">{activity.action}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={activity.tribe.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{activity.tribe.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {activity.tribe.name}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>

                  {activity.preview && (
                    <p className="text-sm text-muted-foreground">{activity.preview}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}

