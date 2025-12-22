'use client'

import { MediaHeader } from '@/app-pages/media/components/media-header'
import FeaturedMediaSection from '@/app-pages/media/components/featured-media'
import AllMediaSection from '@/app-pages/media/components/all-media'
import { TribeMediaPageStoreProvider } from '@/app-pages/media/components/store-provider';
import { TribeMediaPageDialogContainer } from '@/app-pages/media/components/dialogs/dialog-container';

interface MediaPageProps {
  tribeId: string;
}

export default function MediaPage({ tribeId }: MediaPageProps) {
  return (
    <TribeMediaPageStoreProvider>
      <MediaHeader tribeId={tribeId} />

      <FeaturedMediaSection tribeId={tribeId} />

      <AllMediaSection tribeId={tribeId} />

      <TribeMediaPageDialogContainer />
    </TribeMediaPageStoreProvider>
  )
}
