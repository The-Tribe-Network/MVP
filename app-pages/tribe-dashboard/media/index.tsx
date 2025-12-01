import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlbumIcon, ExternalLink } from "lucide-react";
import Link from "next/link";

interface MediaWidgetProps {
  media: string[];
  tribeId: string;
}

export default function MediaWidget({ media, tribeId }: MediaWidgetProps) {
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
        <div className="grid grid-cols-2 gap-2">
          {media.map((mediaItem, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img
                src={mediaItem || "/placeholder.svg"}
                alt={`Media ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
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