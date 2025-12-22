import { MetricCard } from './metric-card'
import type { Metric } from '../../lib/types'

interface MetricsGridProps {
  metrics: Metric[]
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} metric={metric} />
      ))}
    </div>
  )
}

