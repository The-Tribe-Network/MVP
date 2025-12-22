import { Card } from '@/components/ui/card'
import type { Metric } from '../../lib/types'

interface MetricCardProps {
  metric: Metric
}

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 p-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{metric.label}</p>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold text-foreground">{metric.value}</p>
        </div>
        <p className="text-xs text-primary">{metric.change}</p>
      </div>
    </Card>
  )
}

