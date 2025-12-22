'use client'

import { useQuery } from '@tanstack/react-query';
import { albumDetailOptions } from '@/lib/query-options';
import { AlbumHeader } from './components/album-header';
import { AlbumHeaderSkeleton } from './components/album-header/loading';
import { PhotoGrid } from './components/photo-grid';
import { PhotoGridSkeleton } from './components/photo-grid/loading';
import { PhotoGridEmpty } from './components/photo-grid/empty';
import { PhotoGridError } from './components/photo-grid/error';
import { transformAlbumMediaToPhotos } from './lib/utils';

interface AlbumPageProps {
  tribeId: string;
  albumId: string;
}

export default function AlbumPage({ tribeId, albumId }: AlbumPageProps) {
  const {
    data: album,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery(albumDetailOptions(tribeId, albumId));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 mt-16">
          <AlbumHeaderSkeleton />
          <PhotoGridSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 mt-16">
          <PhotoGridError
            message={error?.message}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 mt-16">
          <PhotoGridError message="Album not found" />
        </div>
      </div>
    );
  }

  const photos = transformAlbumMediaToPhotos(album);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 mt-16">
        <AlbumHeader album={album} />
        {photos.length === 0 ? (
          <PhotoGridEmpty />
        ) : (
          <PhotoGrid photos={photos} />
        )}
      </div>
    </div>
  );
}
