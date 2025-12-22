"use client";

import Link from "next/link";
import { AlbumIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTribeMedia } from "@/lib/hooks/use-media";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Empty, EmptyTitle, EmptyDescription, EmptyHeader, EmptyContent } from "@/components/ui/empty";
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlbumIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Media</CardTitle>
          </div>

          <Link href={`/tribe/${tribeId}/media`} className="flex items-center">
            <Button variant="ghost" size="sm" className="h-auto p-0 hover:text-primary/80 hover:cursor-pointer space-x-2">
              View all
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ContentSkeleton />
        ) : error ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Failed to load media</EmptyTitle>
              <EmptyDescription>{error.message}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm" onClick={() => {
                refetch();
              }}>Retry</Button>
            </EmptyContent>
          </Empty>
        ) : !media || media.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No media available</EmptyTitle>
              <EmptyDescription>No media available</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {media.map((mediaItem) => (
              <div
                key={mediaItem.id}
                className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity cursor-pointer"
              >
                <img
                  src={mediaItem.fileUrl || "/placeholder.svg"}
                  alt={mediaItem.altText || `Media ${mediaItem.id}`}
                  className="w-full h-full object-cover"
                  onClick={() => openDialog('image-preview', { imageUrl: mediaItem.fileUrl || "/placeholder.svg", altText: mediaItem.altText || `Media ${mediaItem.id}` })}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
};

function ContentSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[1, 2, 3, 4].map((idx) => (
        <div
          key={idx}
          className="aspect-square rounded-lg overflow-hidden bg-muted animate-pulse"
        />
      ))}
    </div>
  )
}
export const mockMediaWidgetData = [
  '/summer-party.png',
  '/team-hiking.jpg',
  '/game-night-fun.png',
  '/beach-day.jpg'
];