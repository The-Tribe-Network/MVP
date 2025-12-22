import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Activity } from '../../lib/types'

interface ActivityItemProps {
  activity: Activity
}

export function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div className="flex gap-4 p-6 transition-colors hover:bg-muted/50">
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
  )
}

