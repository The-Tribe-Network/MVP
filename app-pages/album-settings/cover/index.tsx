'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  ImageIcon,
  Check,
  Image,
} from 'lucide-react';
import { albumDetailOptions } from '@/lib/query-options/albums';
import { useUpdateAlbum } from '@/lib/hooks/use-albums';
import { cn } from '@/lib/utils';

interface AlbumCoverProps {
  tribeId: string;
  albumId: string;
}

export function AlbumCover({ tribeId, albumId }: AlbumCoverProps) {
  const [selectedCoverId, setSelectedCoverId] = useState<string | null>(null);

  const {
    data: album,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(albumDetailOptions(tribeId, albumId));

  const { mutate: updateAlbum, isPending } = useUpdateAlbum();

  // Get the current cover URL
  const currentCoverUrl = album?.coverUrl || album?.media?.[0]?.fileUrl;
  const currentCoverId = album?.coverId;

  const handleSelectCover = (mediaId: string) => {
    if (mediaId === currentCoverId) {
      setSelectedCoverId(null);
    } else {
      setSelectedCoverId(mediaId);
    }
  };

  const handleSaveCover = () => {
    if (!selectedCoverId) return;

    updateAlbum(
      {
        tribeId,
        albumId,
        data: {
          coverId: selectedCoverId,
        },
      },
      {
        onSuccess: () => {
          toast.success('Album cover updated successfully');
          setSelectedCoverId(null);
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to update album cover');
        },
      }
    );
  };

  if (isLoading) {
    return <AlbumCoverSkeleton />;
  }

  if (isError || !album) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load album</h2>
        <p className="text-muted-foreground mb-4">
          {error?.message || 'Album not found'}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const hasPhotos = album.media && album.media.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Album Cover</h2>
        <p className="text-muted-foreground mt-1">
          Choose a cover image for your album
        </p>
      </div>

      {/* Current Cover Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Current Cover
          </CardTitle>
          <CardDescription>
            This is the cover image currently displayed for your album
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentCoverUrl ? (
            <div className="relative aspect-video max-w-md rounded-lg overflow-hidden border">
              <img
                src={currentCoverUrl}
                alt="Current album cover"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video max-w-md rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No cover image set</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Select from Album Photos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Select from Album
              </CardTitle>
              <CardDescription>
                Choose a photo from this album to use as the cover
              </CardDescription>
            </div>
            {selectedCoverId && (
              <Button
                onClick={handleSaveCover}
                disabled={isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                {isPending ? 'Saving...' : 'Set as Cover'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!hasPhotos ? (
            <div className="text-center py-12 text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No photos in this album</p>
              <p className="text-sm mt-1">
                Add photos to this album first, then select one as the cover
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {album.media.map((media) => {
                const isCurrentCover = media.id === currentCoverId;
                const isSelected = media.id === selectedCoverId;

                return (
                  <div
                    key={media.id}
                    className={cn(
                      'relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 transition-all',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20'
                        : isCurrentCover
                          ? 'border-green-500 ring-2 ring-green-500/20'
                          : 'border-transparent hover:border-muted-foreground/30'
                    )}
                    onClick={() => handleSelectCover(media.id)}
                  >
                    <img
                      src={media.fileUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={cn(
                        'absolute inset-0 transition-opacity',
                        isSelected
                          ? 'bg-primary/20'
                          : isCurrentCover
                            ? 'bg-green-500/10'
                            : 'bg-black/0 group-hover:bg-black/10'
                      )}
                    />
                    {isCurrentCover && !isSelected && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                        Current
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
                        Selected
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-primary">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AlbumCoverSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="aspect-video max-w-md rounded-lg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
