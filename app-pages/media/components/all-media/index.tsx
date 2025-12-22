'use client'

import Image from "next/image";

import { useQuery } from "@tanstack/react-query";
import { tribeMediaOptions } from "@/lib/query-options";
import { useDialogStore, type CarouselPhoto } from "@/lib/stores/dialog-store";
import { AllMediaSkeleton } from "./loading";
import { AllMediaEmpty } from "./empty";
import { AllMediaError } from "./error";

interface AllMediaSectionProps {
  tribeId: string;
}

export default function AllMediaSection({ tribeId }: AllMediaSectionProps) {
  const { data: media, isLoading, error, isError, refetch } = useQuery(tribeMediaOptions(tribeId));
  const openDialog = useDialogStore((s) => s.openDialog);

  const handlePhotoClick = (index: number) => {
    if (!media) return;
    
    const photos: CarouselPhoto[] = media.map((item) => ({
      id: item.id,
      url: item.fileUrl,
      caption: item.altText || `Photo by ${item.uploader.name}`,
      likes: item.likeCount,
      comments: item.commentCount,
      date: new Date(item.createdAt).toLocaleDateString(),
    }));

    openDialog('photo-carousel', { photos, initialIndex: index });
  };

  if (isLoading) return <AllMediaSkeleton />
  if (isError) return <AllMediaError message={error.message} onRetry={() => refetch()} />
  if (!media || media.length === 0) return <AllMediaEmpty />

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-4">All Media</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item, index) => (
          <div
            key={item.id}
            className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => handlePhotoClick(index)}
          >
            <Image
              src={item.fileUrl}
              alt={item.altText || 'Media'}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-sm">{item.uploader.name}</div>
                <div className="text-xs text-gray-300 mt-1">
                  {item.likeCount} likes - {item.commentCount} comments
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}