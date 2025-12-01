'use client'

import { Card, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'

interface PhotoDisplay {
  id: number | string
  url: string
  likes: number
  comments: number
  date: string
}

interface PhotoCardProps {
  photo: PhotoDisplay
}

export function PhotoCard({ photo }: PhotoCardProps) {
  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={photo.url || "/placeholder.svg"}
          alt="Trending photo"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 right-3 bg-primary">
          <TrendingUp className="h-3 w-3 mr-1" />
          Trending
        </Badge>
      </div>
      <CardFooter className="flex justify-between text-sm text-muted-foreground pt-4">
        <span>{photo.likes} likes • {photo.comments} comments</span>
        <span>{photo.date}</span>
      </CardFooter>
    </Card>
  )
}

