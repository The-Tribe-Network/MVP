'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface TrendItem {
  topic: string
  posts: number
}

interface TrendingWidgetProps {
  trends: TrendItem[]
};

export default function TrendingWidget({ trends }: TrendingWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trends.map((trend, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <div>
              <p className="font-medium text-sm">{trend.topic}</p>
              <p className="text-xs text-muted-foreground">{trend.posts} posts</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export const trendingWidgetMockData: TrendItem[] = [
  { topic: '#SummerPlans', posts: 42 },
  { topic: '#GameNight', posts: 28 },
  { topic: '#FitnessChallenge', posts: 19 },
  { topic: '#MovieMarathon', posts: 15 },
  { topic: '#RecipeShare', posts: 12 }
];