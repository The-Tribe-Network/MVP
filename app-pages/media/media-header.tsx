'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CreateAlbumDialog } from './create-album-dialog'
import { MediaUploadDialog } from './media-upload-dialog'

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
        <CreateAlbumDialog tribeId={tribeId} />
      </div>
    </div>
  )
}

