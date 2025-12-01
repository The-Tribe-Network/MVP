'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Plus, Upload, Check, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useCreateAlbum } from '@/lib/hooks/use-albums'
import { usePublicMedia } from '@/lib/hooks/use-media'
import { useUploadAlbumCover } from '@/lib/hooks/use-upload'
import { useDeleteMedia } from '@/lib/hooks/use-upload'
import type { MediaItem } from '@/lib/hooks/use-media'
import Image from 'next/image'

interface CreateAlbumDialogProps {
  tribeId: string
}

export function CreateAlbumDialog({ tribeId }: CreateAlbumDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  // Basic Info
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Cover Selection
  const [selectedCoverId, setSelectedCoverId] = useState<string | null>(null)
  const [uploadedCoverId, setUploadedCoverId] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  // Media Selection
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<string>>(new Set())

  // Mutations and Queries
  const createAlbum = useCreateAlbum(tribeId)
  const { data: publicMedia = [], isLoading: isLoadingMedia } = usePublicMedia(tribeId)
  const uploadCover = useUploadAlbumCover()
  const deleteMedia = useDeleteMedia()

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCoverFile(file)

    try {
      const result = await uploadCover.mutateAsync({ file, tribeId })
      setUploadedCoverId(result.id)
      setSelectedCoverId(result.id)
    } catch (error) {
      console.error('Failed to upload cover:', error)
    }
  }

  const handleCoverSelect = (mediaId: string) => {
    setSelectedCoverId(selectedCoverId === mediaId ? null : mediaId)
  }

  const handleMediaToggle = (mediaId: string) => {
    setSelectedMediaIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId)
      } else {
        newSet.add(mediaId)
      }
      return newSet
    })
  }

  const handleSelectAllMedia = () => {
    setSelectedMediaIds(new Set(publicMedia.map((m: MediaItem) => m.id)))
  }

  const handleClearAllMedia = () => {
    setSelectedMediaIds(new Set())
  }

  const handleCancel = async () => {
    // Clean up uploaded cover if user cancels
    if (uploadedCoverId) {
      try {
        await deleteMedia.mutateAsync(uploadedCoverId)
      } catch (error) {
        console.error('Failed to delete uploaded cover:', error)
      }
    }

    // Reset state
    setName('')
    setDescription('')
    setSelectedCoverId(null)
    setUploadedCoverId(null)
    setCoverFile(null)
    setSelectedMediaIds(new Set())
    setActiveTab('basic')
    setOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createAlbum.mutateAsync({
        name,
        description: description || undefined,
        coverId: selectedCoverId || undefined,
        mediaIds: Array.from(selectedMediaIds),
      })

      // Reset state (but don't delete uploaded cover - it's part of the album now)
      setName('')
      setDescription('')
      setSelectedCoverId(null)
      setUploadedCoverId(null)
      setCoverFile(null)
      setSelectedMediaIds(new Set())
      setActiveTab('basic')
      setOpen(false)
    } catch (error) {
      console.error('Failed to create album:', error)
    }
  }

  const selectedCover = publicMedia.find((m: MediaItem) => m.id === selectedCoverId)
  const isSubmitting = createAlbum.isPending

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleCancel()
      } else {
        setOpen(true)
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Album
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Album</DialogTitle>
          <DialogDescription>
            Create a new album to organize your tribe's photos and memories.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="cover">
                Cover
                {selectedCoverId && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                    <Check className="h-3 w-3" />
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="media">
                Media
                {selectedMediaIds.size > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                    {selectedMediaIds.size}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="flex-1 overflow-auto space-y-4 mt-4">
              {createAlbum.error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {createAlbum.error instanceof Error ? createAlbum.error.message : 'Failed to create album'}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Album Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Summer Vibes 2024"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-sm text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this album is about..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  rows={4}
                />
              </div>
            </TabsContent>

            {/* Cover Tab */}
            <TabsContent value="cover" className="flex-1 overflow-hidden flex flex-col mt-4">
              <div className="space-y-4">
                {/* Upload Section */}
                <div className="space-y-2">
                  <Label htmlFor="cover-upload">Upload New Cover</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileChange}
                      disabled={uploadCover.isPending || isSubmitting}
                      className="flex-1"
                    />
                    {uploadCover.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {selectedCover && uploadedCoverId === selectedCoverId && (
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {coverFile?.name}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or select from existing
                    </span>
                  </div>
                </div>

                {/* Selection Grid */}
                <div className="flex-1 overflow-hidden">
                  <Label className="mb-2 block">Select Existing Media</Label>
                  {isLoadingMedia ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : publicMedia.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No media available. Upload some photos first!
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[250px] rounded-md border p-2">
                      <div className="grid grid-cols-3 gap-2">
                        {publicMedia.map((media: MediaItem) => (
                          <button
                            key={media.id}
                            type="button"
                            onClick={() => handleCoverSelect(media.id)}
                            disabled={isSubmitting}
                            className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${selectedCoverId === media.id
                                ? 'border-primary ring-2 ring-primary ring-offset-2'
                                : 'border-transparent hover:border-muted-foreground/30'
                              }`}
                          >
                            <Image
                              src={media.fileUrl}
                              alt={media.altText || 'Media'}
                              fill
                              className="object-cover"
                            />
                            {selectedCoverId === media.id && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <Check className="h-6 w-6 text-primary bg-background rounded-full p-1" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="flex-1 overflow-hidden flex flex-col mt-4">
              <div className="space-y-4 flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <Label>Select Media to Include</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllMedia}
                      disabled={isSubmitting || publicMedia.length === 0}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllMedia}
                      disabled={isSubmitting || selectedMediaIds.size === 0}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                {isLoadingMedia ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : publicMedia.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No media available. Upload some photos first!
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 rounded-md border p-2">
                    <div className="grid grid-cols-3 gap-2">
                      {publicMedia.map((media: MediaItem) => (
                        <button
                          key={media.id}
                          type="button"
                          onClick={() => handleMediaToggle(media.id)}
                          disabled={isSubmitting}
                          className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${selectedMediaIds.has(media.id)
                              ? 'border-primary ring-2 ring-primary ring-offset-2'
                              : 'border-transparent hover:border-muted-foreground/30'
                            }`}
                        >
                          <Image
                            src={media.fileUrl}
                            alt={media.altText || 'Media'}
                            fill
                            className="object-cover"
                          />
                          {selectedMediaIds.has(media.id) && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Check className="h-6 w-6 text-primary bg-background rounded-full p-1" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Album'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
