'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import { CreateAlbumDialog } from './create-album-dialog'
import { MediaUploadDialog } from './media-upload-dialog'

interface MediaHeaderProps {
  tribeId: string
  onMediaUploaded?: () => void
  onAlbumCreated?: () => void
}

export function MediaHeader({ tribeId, onMediaUploaded, onAlbumCreated }: MediaHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <Link href={`/tribe/${tribeId}`}>
        <Button variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="flex gap-2">
        <MediaUploadDialog tribeId={tribeId} onMediaUploaded={onMediaUploaded} />
        <CreateAlbumDialog tribeId={tribeId} onAlbumCreated={onAlbumCreated} />
      </div>
    </div>
  )
}

