import type { ActivityWithUser } from '@/lib/database/types'
import { formatRelativeTime } from '@/lib/utils'
import type { Activity } from './types'

/**
 * Transform API activity data to the Activity interface used by the UI
 */
export function transformActivityData(activity: ActivityWithUser): Activity {
  return {
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
  }
}

