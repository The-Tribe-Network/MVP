import { Activity } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function ActivityFeedEmpty() {
  return (
    <Card className="border-border/50 bg-card/50 lg:col-span-2">
      <div className="border-b border-border/50 p-6">
        <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
      </div>
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Activity className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No recent activity</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          When members of your tribes post updates, share photos, or create events, you&apos;ll see them here.
        </p>
      </div>
    </Card>
  )
}

