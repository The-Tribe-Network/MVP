"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Heart, MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"
import type { CarouselPhoto } from "@/lib/stores/dialog-store"

interface PhotoCarouselDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  photos: CarouselPhoto[]
  initialIndex: number
}

export function PhotoCarouselDialog({
  isOpen,
  onOpenChange,
  photos,
  initialIndex,
}: PhotoCarouselDialogProps) {
  const [api, setApi] = useState<CarouselApi>()

  useEffect(() => {
    if (!api) {
      return
    }

    api.scrollTo(initialIndex)
  }, [api, initialIndex])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-xl w-full h-[90vh] p-0 bg-black/95 border-none text-white">
        <div className="relative w-full h-full flex items-center justify-center">
          <Carousel setApi={setApi} className="w-full max-w-5xl">
            <CarouselContent>
              {photos.map((photo) => (
                <CarouselItem key={photo.id} className="flex items-center justify-center h-[85vh]">
                  <div className="relative max-h-full max-w-full flex flex-col items-center">
                    <img
                      src={photo.url || "/placeholder.svg"}
                      alt={photo.caption}
                      className="max-h-[75vh] w-auto object-contain rounded-md"
                    />
                    <div className="mt-4 text-center">
                      <p className="text-lg font-medium">{photo.caption}</p>
                      <div className="flex items-center justify-center gap-6 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" /> {photo.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" /> {photo.comments}
                        </span>
                        {photo.date && <span>{photo.date}</span>}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 bg-black/50 border-none text-white hover:bg-black/70" />
            <CarouselNext className="right-4 bg-black/50 border-none text-white hover:bg-black/70" />
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  )
}

