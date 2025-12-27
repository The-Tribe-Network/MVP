'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, Loader2, Image as ImageIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTribeMedia } from '@/lib/hooks/use-media'
import { useTribeAlbums } from '@/lib/hooks/use-albums'
import { cn } from '@/lib/utils'
import type { MediaItem } from '@/lib/hooks/use-media'

interface SelectMediaSectionProps {
  tribeId: string
  selectedMediaIds: Set<string>
  onSelectedMediaChange: (ids: Set<string>) => void
}

export function SelectMediaSection({
  tribeId,
  selectedMediaIds,
  onSelectedMediaChange,
}: SelectMediaSectionProps) {
  const [albumFilter, setAlbumFilter] = useState<string | null | 'all'>('all')

  // Fetch albums for dropdown
  const { data: albums = [], isLoading: isLoadingAlbums } = useTribeAlbums(tribeId)

  // Fetch media based on album filter
  const { data: media = [], isLoading: isLoadingMedia } = useTribeMedia(
    tribeId,
    albumFilter === 'all' ? undefined : { albumId: albumFilter === 'null' ? null : albumFilter }
  )

  const handleToggleMedia = (mediaId: string) => {
    const newSet = new Set(selectedMediaIds)
    if (newSet.has(mediaId)) {
      newSet.delete(mediaId)
    } else {
      newSet.add(mediaId)
    }
    onSelectedMediaChange(newSet)
  }

  const handleSelectAll = () => {
    const allMediaIds = new Set(media.map((m: MediaItem) => m.mediaId))
    onSelectedMediaChange(allMediaIds)
  }

  const handleClearAll = () => {
    onSelectedMediaChange(new Set())
  }

  const handleAlbumFilterChange = (value: string) => {
    if (value === 'all') {
      setAlbumFilter('all')
    } else if (value === 'null') {
      setAlbumFilter('null')
    } else {
      setAlbumFilter(value)
    }
  }

  const isLoading = isLoadingAlbums || isLoadingMedia

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Select Media</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Choose existing photos from your tribe to add to this album
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="h-4 w-4" />
            Tribe Media
          </CardTitle>
          <CardDescription>
            Select photos that are already uploaded to your tribe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Label className="whitespace-nowrap">Filter by Album:</Label>
              <Select
                value={albumFilter === null ? 'null' : albumFilter || 'all'}
                onValueChange={handleAlbumFilterChange}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Albums</SelectItem>
                  <SelectItem value="null">General (No Album)</SelectItem>
                  {albums.map((album) => (
                    <SelectItem key={album.id} value={album.id}>
                      {album.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isLoading || media.length === 0}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={isLoading || selectedMediaIds.size === 0}
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Media Grid */}
          <div className="border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : media.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No media found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {albumFilter === 'all'
                    ? 'Upload some photos to your tribe first!'
                    : 'This album has no media yet.'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {media.map((item: MediaItem) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleMedia(item.mediaId)}
                      className={cn(
                        'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                        selectedMediaIds.has(item.mediaId)
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-transparent hover:border-muted-foreground/30'
                      )}
                    >
                      <Image
                        src={item.fileUrl}
                        alt={item.altText || 'Media'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                      {selectedMediaIds.has(item.mediaId) && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
                            <Check className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Selection Counter */}
          <p className="text-sm text-muted-foreground text-center">
            {selectedMediaIds.size === 0
              ? 'No media selected'
              : `${selectedMediaIds.size} media ${selectedMediaIds.size === 1 ? 'item' : 'items'} selected`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
