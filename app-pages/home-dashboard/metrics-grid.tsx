import { Card } from '@/components/ui/card'
import { Metric } from './types'

interface MetricsGridProps {
  metrics: Metric[]
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="border-border/50 bg-card/50 p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-foreground">{metric.value}</p>
            </div>
            <p className="text-xs text-primary">{metric.change}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}

