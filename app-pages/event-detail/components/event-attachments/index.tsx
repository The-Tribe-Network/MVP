'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Image as ImageIcon, Link as LinkIcon, Paperclip } from 'lucide-react'
import { MediaTab } from './media-tab'
import { LinksTab } from './links-tab'
import { EventAttachmentsSkeleton } from './loading'
import { EventAttachmentsError } from './error'
import { mockMedia, mockLinks } from '../../lib/mock-data'
import type { MediaAttachment, LinkAttachment } from '../../lib/types'

interface EventAttachmentsSectionProps {
  eventId: string
}

/**
 * Event Attachments Section
 *
 * Displays media and link attachments for the event
 *
 * TODO: Replace mock data with real API integration using:
 * const { data: media, isLoading: mediaLoading } = useQuery(eventMediaOptions(eventId))
 * const { data: links, isLoading: linksLoading } = useQuery(eventLinksOptions(eventId))
 * const { mutate: uploadMedia } = useUploadEventMedia()
 * const { mutate: addLink } = useAddEventLink()
 */
export function EventAttachmentsSection({ eventId }: EventAttachmentsSectionProps) {
  // Mock state management (for demonstration)
  const isLoading = false
  const isError = false
  const error = null
  const [media] = useState<MediaAttachment[]>(mockMedia)
  const [links] = useState<LinkAttachment[]>(mockLinks)

  const handleUploadMedia = () => {
    // TODO: Implement file upload
    console.log('Upload media for event:', eventId)
  }

  const handleAddLink = (url: string) => {
    // TODO: Call addLink({ eventId, url })
    console.log('Adding link:', url)
  }

  // Loading state
  if (isLoading) return <EventAttachmentsSkeleton />

  // Error state
  if (isError) {
    return (
      <EventAttachmentsError
        message={error?.message}
        onRetry={() => console.log('Retry loading attachments')}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Attachments
          </CardTitle>
          <Badge variant="secondary">{media.length + links.length} total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="media" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="media" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Media ({media.length})
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              Links ({links.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="media" className="mt-4">
            <MediaTab media={media} onUpload={handleUploadMedia} />
          </TabsContent>

          <TabsContent value="links" className="mt-4">
            <LinksTab links={links} onAddLink={handleAddLink} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
