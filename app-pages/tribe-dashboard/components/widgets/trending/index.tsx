'use client'

import { TrendingUp } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface TrendItem {
  topic: string
  posts: number
}

interface TrendingWidgetProps {
  trends: TrendItem[]
}

export default function TrendingWidget({ trends }: TrendingWidgetProps) {
  return (
    <div className="space-y-3">
      <Separator />

      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Trending
        </h3>
      </div>

      {/* Trend items */}
      <div className="space-y-1">
        {trends.map((trend, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-1.5 rounded hover:bg-muted/30 cursor-pointer transition-colors px-1 -mx-1"
          >
            <div>
              <p className="text-sm font-medium">{trend.topic}</p>
              <p className="text-xs text-muted-foreground">{trend.posts} posts</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const trendingWidgetMockData: TrendItem[] = [
  { topic: '#SummerPlans', posts: 42 },
  { topic: '#GameNight', posts: 28 },
  { topic: '#FitnessChallenge', posts: 19 },
  { topic: '#MovieMarathon', posts: 15 },
  { topic: '#RecipeShare', posts: 12 }
]
