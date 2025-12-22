'use client'

import { useRouter } from 'next/navigation'
import { Calendar, ImageIcon, TrendingUp } from 'lucide-react'

import { AlbumWithMedia } from '@/lib/database/types'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'

interface AlbumCardProps {
  tribeId: string;
  album: AlbumWithMedia;
  variant?: 'trending' | 'default';
}

export function AlbumCard({ tribeId, album, variant = 'default' }: AlbumCardProps) {
  const router = useRouter();
  const isTrending = variant === 'trending';
  const createdAtDate = formatRelativeTime(album.createdAt);

  const handleClick = () => {
    router.push(`/tribe/${tribeId}/media/album/${album.id}`);
  };

  return (
    <Card
      className={`overflow-hidden group cursor-pointer transition-shadow ${isTrending ? 'hover:shadow-lg' : 'hover:shadow-md'}`}
      onClick={handleClick}
    >
      <div className={`relative overflow-hidden ${isTrending ? 'aspect-video' : 'aspect-square'}`}>
        <img
          src={album.coverUrl || "/placeholder.svg"}
          alt={album.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isTrending && (
          <Badge className="absolute top-3 right-3 bg-primary">
            <TrendingUp className="h-3 w-3 mr-1" />
            Trending
          </Badge>
        )}
      </div>

      {isTrending ? (
        <>
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
              {createdAtDate}
            </span>
          </CardFooter>
        </>
      ) : (
        <CardContent className="pt-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{album.name}</h3>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              {album.photoCount}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {createdAtDate}
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

