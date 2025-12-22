import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import UploadMediaBtn from './upload-media-btn'

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
        <UploadMediaBtn tribeId={tribeId} />
        <Link href={`/tribe/${tribeId}/media/album/new`}>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Album
          </Button>
        </Link>
      </div>
    </div>
  )
}

