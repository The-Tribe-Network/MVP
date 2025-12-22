'use client'

import { MediaHeader } from '@/app-pages/media/components/media-header'
import FeaturedMediaSection from '@/app-pages/media/components/featured-media'
import AllMediaSection from '@/app-pages/media/components/all-media'
import { TribeMediaPageStoreProvider } from '@/app-pages/media/components/store-provider';
import { TribeMediaPageDialogContainer } from '@/app-pages/media/components/dialogs/dialog-container';
import { Separator } from '@/components/ui/separator';

interface MediaPageProps {
  tribeId: string;
}

export default function MediaPage({ tribeId }: MediaPageProps) {
  return (
    <TribeMediaPageStoreProvider>
      <MediaHeader tribeId={tribeId} />

      <Separator className="my-6" />

      <FeaturedMediaSection tribeId={tribeId} />

      <AllMediaSection tribeId={tribeId} />

      <TribeMediaPageDialogContainer />
    </TribeMediaPageStoreProvider>
  )
}
