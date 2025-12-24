import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import UploadMediaBtn from './upload-media-btn'
import { SubpageHeader } from '@/components/shared/subpage-header'

interface MediaHeaderProps {
  tribeId: string
}

export function MediaHeader({ tribeId }: MediaHeaderProps) {
  return (
    <SubpageHeader
      tribeId={tribeId}
      breadcrumbs={[{ label: 'Media' }]}
      title="Tribe Media"
      subtitle="View and manage your tribe's photos and albums"
      className="pt-6"
      actions={
        <>
          <UploadMediaBtn tribeId={tribeId} />
          <Link href={`/tribe/${tribeId}/media/album/new`}>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Album
            </Button>
          </Link>
        </>
      }
    />
  )
}

