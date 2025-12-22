"use client"

import { PhotoCard } from "../photo-card"
import { useDialogStore, type CarouselPhoto } from "@/lib/stores/dialog-store"

interface PhotoGridProps {
  photos: CarouselPhoto[]
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const openDialog = useDialogStore((s) => s.openDialog);

  const handlePhotoClick = (index: number) => {
    openDialog('photo-carousel', {
      photos,
      initialIndex: index,
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          index={index}
          onPhotoClick={handlePhotoClick}
        />
      ))}
    </div>
  )
}

