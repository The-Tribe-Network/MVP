import { useRef, useState, DragEvent, useEffect } from 'react'
import Image from 'next/image'
import {
  Upload,
  ArrowLeft,
  X,
  Check,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePublicMedia } from '@/lib/hooks/use-media'
import { useUploadAlbumCover } from '@/lib/hooks/use-upload'
import { useDeleteMedia } from '@/lib/hooks/use-upload'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { CoverMode } from './types'
import type { MediaItem } from '@/lib/hooks/use-media'

interface CoverPhotoStepProps {
  tribeId: string
  coverMode: CoverMode
  uploadedCoverId: string | null
  selectedCoverId: string | null
  onCoverModeChange: (mode: CoverMode) => void
  onUploadedCoverChange: (id: string | null) => void
  onSelectedCoverChange: (id: string | null) => void
}

export function CoverPhotoStep({
  tribeId,
  coverMode,
  uploadedCoverId,
  selectedCoverId,
  onCoverModeChange,
  onUploadedCoverChange,
  onSelectedCoverChange,
}: CoverPhotoStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)

  const uploadCover = useUploadAlbumCover()
  const deleteMedia = useDeleteMedia()
  const { data: publicMedia = [], isLoading: isLoadingMedia } = usePublicMedia(tribeId)

  // Cleanup uploaded cover if user switches to select mode
  useEffect(() => {
    if (uploadedCoverId && coverMode === 'select' && selectedCoverId) {
      deleteMedia.mutate(uploadedCoverId)
      onUploadedCoverChange(null)
      setCoverPreviewUrl(null)
      setCoverFile(null)
    }
  }, [coverMode, uploadedCoverId, selectedCoverId])

  const handleFileSelect = async (file: File | null) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    setCoverFile(file)
    const previewUrl = URL.createObjectURL(file)
    setCoverPreviewUrl(previewUrl)

    try {
      const result = await uploadCover.mutateAsync({ file, tribeId })
      onUploadedCoverChange(result.id)
      onSelectedCoverChange(null) // Clear any selected cover
      setCoverPreviewUrl(result.url)
      toast.success('Cover uploaded successfully')
    } catch (error) {
      console.error('Failed to upload cover:', error)
      toast.error('Failed to upload cover')
      setCoverFile(null)
      setCoverPreviewUrl(null)
    }
  }

  const handleRemoveCover = async () => {
    if (uploadedCoverId) {
      try {
        await deleteMedia.mutateAsync(uploadedCoverId)
        onUploadedCoverChange(null)
        toast.success('Cover removed')
      } catch (error) {
        console.error('Failed to delete cover:', error)
        toast.error('Failed to remove cover')
        return
      }
    }

    if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreviewUrl)
    }

    setCoverFile(null)
    setCoverPreviewUrl(null)
  }

  const handleCoverSelect = (mediaId: string) => {
    if (selectedCoverId === mediaId) {
      onSelectedCoverChange(null)
    } else {
      onSelectedCoverChange(mediaId)
      onUploadedCoverChange(null) // Clear any uploaded cover
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleBackToOptions = () => {
    onCoverModeChange('none')
  }

  // Mode: None - Show two buttons
  if (coverMode === 'none') {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-center">
          Choose how to add a cover photo (this step is optional)
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <Button
            type="button"
            variant="outline"
            className="h-32 flex flex-col gap-3"
            onClick={() => onCoverModeChange('upload')}
          >
            <Upload className="h-8 w-8" />
            <span>Upload Cover</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-32 flex flex-col gap-3"
            onClick={() => onCoverModeChange('select')}
          >
            <ImageIcon className="h-8 w-8" />
            <span>Select from Tribe</span>
          </Button>
        </div>
      </div>
    )
  }

  // Mode: Upload - Show dropzone or preview
  if (coverMode === 'upload') {
    return (
      <div className="space-y-4">
        <Button
          type="button"
          variant="ghost"
          className="gap-2"
          onClick={handleBackToOptions}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to options
        </Button>

        {!uploadedCoverId ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              className="hidden"
            />

            {uploadCover.isPending ? (
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary mb-4" />
            ) : (
              <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            )}

            <p className="text-lg font-medium mb-2">
              {uploadCover.isPending
                ? 'Uploading...'
                : isDragging
                ? 'Drop image here'
                : 'Drag and drop cover image'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <Button
              type="button"
              variant="outline"
              disabled={uploadCover.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>
          </div>
        ) : (
          <div className="relative max-w-2xl mx-auto">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={coverPreviewUrl || ''}
                alt="Album cover"
                fill
                className="object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4"
              onClick={handleRemoveCover}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Mode: Select - Show media grid
  if (coverMode === 'select') {
    return (
      <div className="space-y-4">
        <Button
          type="button"
          variant="ghost"
          className="gap-2"
          onClick={handleBackToOptions}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to options
        </Button>

        <div className="border rounded-lg">
          {isLoadingMedia ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : publicMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No media available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload some photos to your tribe first!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {publicMedia.map((media: MediaItem) => (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => handleCoverSelect(media.mediaId)}
                    className={cn(
                      'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                      selectedCoverId === media.mediaId
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-transparent hover:border-muted-foreground/30'
                    )}
                  >
                    <Image
                      src={media.fileUrl}
                      alt={media.altText || 'Media'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    />
                    {selectedCoverId === media.mediaId && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
                          <Check className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {selectedCoverId && (
          <p className="text-sm text-center text-muted-foreground">
            Cover photo selected
          </p>
        )}
      </div>
    )
  }

  return null
}
