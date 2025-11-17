import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface AlbumsWidgetProps {
  photoAlbum: string[];
}

export default function AlbumsWidget({ photoAlbum }: AlbumsWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Photo Album</CardTitle>
          <Link href="/albums">
            <Button variant="ghost" size="sm" className="h-auto p-0 text-primary hover:text-primary/80">
              <ExternalLink className="h-4 w-4 mr-1" />
              View all
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {photoAlbum.map((photo, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img
                src={photo || "/placeholder.svg"}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
};

export const mockAlbumsWidgetData = [
  '/summer-party.png',
  '/team-hiking.jpg',
  '/game-night-fun.png',
  '/beach-day.jpg'
];