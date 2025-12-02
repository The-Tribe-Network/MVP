"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  ExternalLink,
  X,
  Paperclip
} from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"

interface EventAttachmentsSectionProps {
  eventId: string
}

interface MediaAttachment {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  uploadedBy: {
    name: string
    avatar?: string | null
  }
  uploadedAt: Date
}

interface LinkAttachment {
  id: string
  url: string
  title?: string
  description?: string
  thumbnail?: string
  addedBy: {
    name: string
  }
  addedAt: Date
}

// Mock data
const mockMedia: MediaAttachment[] = [
  {
    id: "1",
    type: "image",
    url: "/placeholder.svg",
    uploadedBy: { name: "Sarah Chen" },
    uploadedAt: new Date()
  },
  {
    id: "2",
    type: "image",
    url: "/placeholder.svg",
    uploadedBy: { name: "John Doe" },
    uploadedAt: new Date()
  }
]

const mockLinks: LinkAttachment[] = [
  {
    id: "1",
    url: "https://example.com/event-details",
    title: "Event Parking Information",
    description: "Details about parking and directions to the venue",
    addedBy: { name: "Sarah Chen" },
    addedAt: new Date()
  }
]

export function EventAttachmentsSection({ eventId }: EventAttachmentsSectionProps) {
  const [media] = useState<MediaAttachment[]>(mockMedia)
  const [links] = useState<LinkAttachment[]>(mockLinks)
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [showAddLink, setShowAddLink] = useState(false)

  // TODO: Implement real hooks
  // const { data: media } = useEventMedia(eventId)
  // const { data: links } = useEventLinks(eventId)
  // const { mutate: uploadMedia } = useUploadEventMedia()
  // const { mutate: addLink } = useAddEventLink()

  const handleUploadMedia = () => {
    // TODO: Implement file upload
    console.log('Upload media')
  }

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return

    // TODO: Call real API
    console.log('Adding link:', newLinkUrl)
    setNewLinkUrl("")
    setShowAddLink(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Attachments
          </CardTitle>
          <Badge variant="secondary">
            {media.length + links.length} total
          </Badge>
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

          {/* Media Tab */}
          <TabsContent value="media" className="mt-4 space-y-4">
            <Button
              onClick={handleUploadMedia}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo or Video
            </Button>

            <ScrollArea className="h-[400px] pr-4">
              {media.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No media uploaded yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share photos and videos from the event
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-lg overflow-hidden border bg-muted"
                    >
                      <AspectRatio ratio={1}>
                        <img
                          src={item.url}
                          alt="Event media"
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                        >
                          View
                        </Button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-xs text-white truncate">
                          By {item.uploadedBy.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links" className="mt-4 space-y-4">
            {!showAddLink ? (
              <Button
                onClick={() => setShowAddLink(true)}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste URL here..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                  />
                  <Button onClick={handleAddLink} size="sm">
                    Add
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddLink(false)
                      setNewLinkUrl("")
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <ScrollArea className="h-[400px] pr-4">
              {links.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <LinkIcon className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No links added yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share useful links related to the event
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {links.map((link) => (
                    <Card key={link.id} className="p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex gap-3">
                        {link.thumbnail && (
                          <div className="w-16 h-16 rounded bg-muted flex-shrink-0">
                            <img
                              src={link.thumbnail}
                              alt=""
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate mb-1">
                            {link.title || link.url}
                          </h4>
                          {link.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {link.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              Added by {link.addedBy.name}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7"
                              onClick={() => window.open(link.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
