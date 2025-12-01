'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, ImageIcon, TrendingUp } from 'lucide-react'
import { Album } from './types'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import PhotoMediaDialog from '@/components/dialogs/photo-media'

interface AlbumCardProps {
  album: Album
  variant?: 'trending' | 'default';
}

export function AlbumCard({ album, variant = 'default' }: AlbumCardProps) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const router = useRouter();
  const { tribe_id: tribeId } = useParams<{ tribe_id: string }>();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!tribeId) return;
    router.push(`/tribe/${tribeId}/media/album/${album.id}`);
  };

  if (variant === 'trending') {
    return (
      <>
        <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow" onClick={(e) => handleClick(e)}>
          <div className="relative aspect-video overflow-hidden">
            <img
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsImageDialogOpen(true);
              }}
              src={album.cover || "/placeholder.svg"}
              alt={album.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
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
        <PhotoMediaDialog isOpen={isImageDialogOpen} onOpenChange={setIsImageDialogOpen} imageUrl={album.cover} />
      </>
    )
  }

  return (
    <>
      <Card className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow" onClick={(e) => handleClick(e)}>
        <div className="relative aspect-square overflow-hidden">
          <img
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsImageDialogOpen(true);
            }}
            src={album.cover || "/placeholder.svg"}
            alt={album.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
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
      <PhotoMediaDialog isOpen={isImageDialogOpen} onOpenChange={setIsImageDialogOpen} imageUrl={album.cover} />
    </>
  )
}

