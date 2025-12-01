import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, Share2, Download } from "lucide-react"
import Link from "next/link"
import type { Album } from "./types"
import { useParams, useRouter } from "next/navigation"

interface AlbumHeaderProps {
  album: Album
}

export function AlbumHeader({ album }: AlbumHeaderProps) {
  const router = useRouter();
  const { tribe_id: tribeId } = useParams<{ tribe_id: string }>();

  if (!tribeId) return;

  return (
    <div className="mb-8">
      <Link
        href={`/tribe/${tribeId}/media`}
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Albums
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{album.name}</h1>
          <p className="text-muted-foreground max-w-2xl mb-4">{album.description}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={album.creator.avatar || "/placeholder.svg"} />
                <AvatarFallback>{album.creator.name[0]}</AvatarFallback>
              </Avatar>
              <span>
                Created by <span className="font-medium text-foreground">{album.creator.name}</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {album.date}
            </span>
            <span>{album.stats.photos} photos</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>
    </div>
  )
}

