import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlbumIcon, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTribeMedia } from "@/lib/hooks/use-media";

interface MediaWidgetProps {
  tribeId: string;
}

export default function MediaWidget({ tribeId }: MediaWidgetProps) {
  const { data: media, isLoading, error } = useTribeMedia(tribeId, {
    type: "image",
    limit: 4,
    offset: 0,
  });

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
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="aspect-square rounded-lg overflow-hidden bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-sm text-muted-foreground">Failed to load media</div>
        ) : !media || media.length === 0 ? (
          <div className="text-sm text-muted-foreground">No media available</div>
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
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
};

export const mockMediaWidgetData = [
  '/summer-party.png',
  '/team-hiking.jpg',
  '/game-night-fun.png',
  '/beach-day.jpg'
];