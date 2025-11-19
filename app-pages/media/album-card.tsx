'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, ImageIcon, TrendingUp } from 'lucide-react'
import { Album } from './types'

interface AlbumCardProps {
  album: Album
  variant?: 'trending' | 'default'
}

export function AlbumCard({ album, variant = 'default' }: AlbumCardProps) {
  if (variant === 'trending') {
    return (
      <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={album.cover || "/placeholder.svg"}
            alt={album.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-3 right-3 bg-primary">
            <TrendingUp className="h-3 w-3 mr-1" />
            Trending
          </Badge>
        </div>
        <CardHeader>
          <CardTitle className="text-xl">{album.name}</CardTitle>
        </CardHeader>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <ImageIcon className="h-4 w-4" />
            {album.photoCount} photos
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {album.date}
          </span>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={album.cover || "/placeholder.svg"}
          alt={album.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {album.trending && (
          <Badge className="absolute top-2 right-2 bg-primary/90">
            <TrendingUp className="h-3 w-3" />
          </Badge>
        )}
      </div>
      <CardContent className="pt-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{album.name}</h3>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            {album.photoCount}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {album.date}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

