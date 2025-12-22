import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import UploadMediaBtn from './upload-media-btn'
import { TooltipButton } from '@/components/ui/tooltip-button'

interface MediaHeaderProps {
  tribeId: string
}

export function MediaHeader({ tribeId }: MediaHeaderProps) {

  return (
    <div className="flex items-center justify-between pt-6">
      <div className="flex items-center gap-2">
        <TooltipButton message="Back to tribe dashboard" variant="ghost" size="icon" tooltipSide="bottom" tooltipAlign="start">
          <Link href={`/tribe/${tribeId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Link>
        </TooltipButton>
        <h1 className="text-4xl font-bold">Tribe Media</h1>
      </div>
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

