"use client";

import Link from "next/link";
import { Image } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/lib/stores/dialog-store";
import { tribeMediaOptions } from "@/lib/query-options/media";

interface MediaWidgetProps {
  tribeId: string;
}

export default function MediaWidget({ tribeId }: MediaWidgetProps) {
  const { data: media, isLoading, error, refetch } = useQuery(
    tribeMediaOptions(tribeId, {
      type: "image",
      limit: 4,
      offset: 0,
    })
  );

  const openDialog = useDialogStore((s) => s.openDialog);

  return (
    <div className="space-y-3">
      <Separator />

      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <Link
          href={`/tribe/${tribeId}/media`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Image className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Media
          </h3>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <ContentSkeleton />
      ) : error ? (
        <div className="text-center py-4 px-4">
          <p className="text-xs text-muted-foreground mb-2">Failed to load media</p>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !media || media.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2 px-4">No media yet</p>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 px-4">
          {media.map((mediaItem) => (
            <div
              key={mediaItem.id}
              className="aspect-square rounded-md overflow-hidden bg-muted hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img
                src={mediaItem.fileUrl || "/placeholder.svg"}
                alt={mediaItem.altText || `Media ${mediaItem.id}`}
                className="w-full h-full object-cover"
                onClick={() => openDialog('image-preview', {
                  imageUrl: mediaItem.fileUrl || "/placeholder.svg",
                  altText: mediaItem.altText || `Media ${mediaItem.id}`
                })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-1.5 px-4">
      {[1, 2, 3, 4].map((idx) => (
        <div
          key={idx}
          className="aspect-square rounded-md overflow-hidden bg-muted animate-pulse"
        />
      ))}
    </div>
  );
}

export const mockMediaWidgetData = [
  '/summer-party.png',
  '/team-hiking.jpg',
  '/game-night-fun.png',
  '/beach-day.jpg'
];
