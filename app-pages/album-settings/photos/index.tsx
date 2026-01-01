'use client';

import { useState, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  Image,
  ImagePlus,
  Trash2,
  Plus,
  Check,
} from 'lucide-react';
import { albumDetailOptions } from '@/lib/query-options/albums';
import { tribeMediaOptions } from '@/lib/query-options/media';
import { useAddMediaToAlbum, useRemoveMediaFromAlbum } from '@/lib/hooks/use-albums';
import { cn } from '@/lib/utils';

interface AlbumPhotosProps {
  tribeId: string;
  albumId: string;
}

export function AlbumPhotos({ tribeId, albumId }: AlbumPhotosProps) {
  const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(new Set());
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());

  const {
    data: album,
    isLoading: isLoadingAlbum,
    isError: isAlbumError,
    error: albumError,
    refetch: refetchAlbum,
  } = useQuery(albumDetailOptions(tribeId, albumId));

  const {
    data: tribeMedia,
    isLoading: isLoadingMedia,
  } = useQuery(tribeMediaOptions(tribeId, { type: 'image' }));

  const { mutate: addMedia, isPending: isAdding } = useAddMediaToAlbum();
  const { mutate: removeMedia, isPending: isRemoving } = useRemoveMediaFromAlbum();

  // Filter out media that's already in the album
  const availableMedia = useMemo(() => {
    if (!tribeMedia || !album?.media) return [];
    const albumMediaIds = new Set(album.media.map((m) => m.id));
    return tribeMedia.filter((m) => !albumMediaIds.has(m.id));
  }, [tribeMedia, album?.media]);

  const handleToggleRemove = (mediaId: string) => {
    const newSelected = new Set(selectedToRemove);
    if (newSelected.has(mediaId)) {
      newSelected.delete(mediaId);
    } else {
      newSelected.add(mediaId);
    }
    setSelectedToRemove(newSelected);
  };

  const handleToggleAdd = (mediaId: string) => {
    const newSelected = new Set(selectedToAdd);
    if (newSelected.has(mediaId)) {
      newSelected.delete(mediaId);
    } else {
      newSelected.add(mediaId);
    }
    setSelectedToAdd(newSelected);
  };

  const handleRemoveSelected = () => {
    if (selectedToRemove.size === 0) return;

    removeMedia(
      {
        tribeId,
        albumId,
        mediaIds: Array.from(selectedToRemove),
      },
      {
        onSuccess: () => {
          toast.success(`${selectedToRemove.size} photo(s) removed from album`);
          setSelectedToRemove(new Set());
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to remove photos');
        },
      }
    );
  };

  const handleAddSelected = () => {
    if (selectedToAdd.size === 0) return;

    addMedia(
      {
        tribeId,
        albumId,
        mediaIds: Array.from(selectedToAdd),
      },
      {
        onSuccess: () => {
          toast.success(`${selectedToAdd.size} photo(s) added to album`);
          setSelectedToAdd(new Set());
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to add photos');
        },
      }
    );
  };

  if (isLoadingAlbum) {
    return <AlbumPhotosSkeleton />;
  }

  if (isAlbumError || !album) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load album</h2>
        <p className="text-muted-foreground mb-4">
          {albumError?.message || 'Album not found'}
        </p>
        <Button onClick={() => refetchAlbum()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Manage Photos</h2>
        <p className="text-muted-foreground mt-1">
          Add or remove photos from this album
        </p>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Current Photos ({album.media?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            Add Photos ({availableMedia.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Album Photos
                  </CardTitle>
                  <CardDescription>
                    Select photos to remove from this album
                  </CardDescription>
                </div>
                {selectedToRemove.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveSelected}
                    disabled={isRemoving}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove {selectedToRemove.size} Photo(s)
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!album.media || album.media.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No photos in this album yet</p>
                  <p className="text-sm mt-1">
                    Add photos from the "Add Photos" tab
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {album.media.map((media) => (
                    <PhotoCard
                      key={media.id}
                      imageUrl={media.fileUrl}
                      isSelected={selectedToRemove.has(media.id)}
                      onToggle={() => handleToggleRemove(media.id)}
                      disabled={isRemoving}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImagePlus className="h-5 w-5" />
                    Add from Tribe
                  </CardTitle>
                  <CardDescription>
                    Select photos from your tribe to add to this album
                  </CardDescription>
                </div>
                {selectedToAdd.size > 0 && (
                  <Button
                    size="sm"
                    onClick={handleAddSelected}
                    disabled={isAdding}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {selectedToAdd.size} Photo(s)
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMedia ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : availableMedia.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ImagePlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No photos available to add</p>
                  <p className="text-sm mt-1">
                    All tribe photos are already in this album
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {availableMedia.map((media) => (
                    <PhotoCard
                      key={media.id}
                      imageUrl={media.fileUrl}
                      isSelected={selectedToAdd.has(media.id)}
                      onToggle={() => handleToggleAdd(media.id)}
                      disabled={isAdding}
                      variant="add"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PhotoCardProps {
  imageUrl: string;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  variant?: 'remove' | 'add';
}

function PhotoCard({
  imageUrl,
  isSelected,
  onToggle,
  disabled,
  variant = 'remove',
}: PhotoCardProps) {
  return (
    <div
      className={cn(
        'relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 transition-all',
        isSelected
          ? variant === 'remove'
            ? 'border-destructive ring-2 ring-destructive/20'
            : 'border-primary ring-2 ring-primary/20'
          : 'border-transparent hover:border-muted-foreground/30'
      )}
      onClick={disabled ? undefined : onToggle}
    >
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full object-cover"
      />
      <div
        className={cn(
          'absolute inset-0 transition-opacity',
          isSelected
            ? variant === 'remove'
              ? 'bg-destructive/20'
              : 'bg-primary/20'
            : 'bg-black/0 group-hover:bg-black/10'
        )}
      />
      <div className="absolute top-2 left-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={disabled ? undefined : onToggle}
          disabled={disabled}
          className={cn(
            'h-5 w-5 border-2 bg-white',
            isSelected && variant === 'remove' && 'border-destructive data-[state=checked]:bg-destructive',
            isSelected && variant === 'add' && 'border-primary data-[state=checked]:bg-primary'
          )}
        />
      </div>
      {isSelected && (
        <div
          className={cn(
            'absolute bottom-2 right-2 p-1 rounded-full',
            variant === 'remove' ? 'bg-destructive' : 'bg-primary'
          )}
        >
          {variant === 'remove' ? (
            <Trash2 className="h-4 w-4 text-destructive-foreground" />
          ) : (
            <Check className="h-4 w-4 text-primary-foreground" />
          )}
        </div>
      )}
    </div>
  );
}

function AlbumPhotosSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <Skeleton className="h-10 w-64" />

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
