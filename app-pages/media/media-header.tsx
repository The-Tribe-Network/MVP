'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import { CreateAlbumDialog } from './create-album-dialog'
import { MediaUploadDialog } from './media-upload-dialog'
import Link from 'next/link'

interface MediaHeaderProps {
  tribeId: string
}

export function MediaHeader({ tribeId }: MediaHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <Link href={`/tribe/${tribeId}`}>
        <Button variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="flex gap-2">
        {/* No callbacks needed - hooks handle invalidation */}
        <MediaUploadDialog tribeId={tribeId} />
        <Link href={`/tribe/${tribeId}/media/album/new`}>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Album
          </Button>
        </Link>
        {/* <CreateAlbumDialog tribeId={tribeId} /> */}
      </div>
    </div>
  )
}

