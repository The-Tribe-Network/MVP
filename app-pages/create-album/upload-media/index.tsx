'use client'

import { useRef, useState, DragEvent } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUploadTribeMediaBatch, useDeleteMedia } from '@/lib/hooks/use-upload'
import { toast } from 'sonner'

interface UploadedMediaPreview {
  id: string
  url: string
  file: File
  uploadProgress?: number
  isUploading?: boolean
}

interface UploadMediaSectionProps {
  tribeId: string
  uploadedMediaIds: string[]
  onUploadedMediaChange: (ids: string[]) => void
}

const MAX_IMAGES = 20

export function UploadMediaSection({
  tribeId,
  uploadedMediaIds,
  onUploadedMediaChange,
}: UploadMediaSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<UploadedMediaPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const uploadMediaBatch = useUploadTribeMediaBatch(tribeId)
  const deleteMedia = useDeleteMedia()

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = MAX_IMAGES - uploadedMediaIds.length
    if (remainingSlots <= 0) {
      toast.error(`Maximum of ${MAX_IMAGES} images allowed`)
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    const newFiles = filesToUpload.filter((file) => file.type.startsWith('image/'))

    if (newFiles.length === 0) {
      toast.error('Please select valid image files')
      return
    }

    if (newFiles.length < filesToUpload.length) {
      toast.warning('Some files were skipped (only images allowed)')
    }

    // Create previews with temporary IDs
    const newPreviews: UploadedMediaPreview[] = newFiles.map((file, index) => {
      const url = URL.createObjectURL(file)
      return {
        id: `temp-${Date.now()}-${index}`,
        url,
        file,
        isUploading: true,
      }
    })

    setPreviews((prev) => [...prev, ...newPreviews])
    setIsUploading(true)

    try {
      // Batch upload all files in parallel
      const result = await uploadMediaBatch.mutateAsync({
        files: newFiles,
        addToAlbum: false, // Don't add to any album yet
      })

      // Update previews with uploaded results
      const successfulIds: string[] = []

      setPreviews((prev) => {
        const updatedPreviews = [...prev]

        // Update successful uploads
        result.successful.forEach((uploaded, index) => {
          const previewIndex = prev.findIndex((p) => p.id === newPreviews[index]?.id)
          if (previewIndex !== -1) {
            // Revoke old blob URL
            if (updatedPreviews[previewIndex].url.startsWith('blob:')) {
              URL.revokeObjectURL(updatedPreviews[previewIndex].url)
            }
            updatedPreviews[previewIndex] = {
              ...updatedPreviews[previewIndex],
              id: uploaded.id,
              url: uploaded.url,
              isUploading: false,
            }
            successfulIds.push(uploaded.id)
          }
        })

        // Remove failed uploads
        result.failed.forEach((failure) => {
          const previewId = newPreviews[failure.index]?.id
          if (previewId) {
            const failedPreview = updatedPreviews.find((p) => p.id === previewId)
            if (failedPreview?.url.startsWith('blob:')) {
              URL.revokeObjectURL(failedPreview.url)
            }
          }
        })

        return updatedPreviews.filter((p) => {
          // Keep previews that are either successfully uploaded or not part of this batch
          const isFromThisBatch = newPreviews.some((np) => np.id === p.id)
          if (!isFromThisBatch) return true
          // If from this batch, only keep if it was successful
          return !p.id.startsWith('temp-')
        })
      })

      // Update parent with new uploaded IDs
      if (successfulIds.length > 0) {
        onUploadedMediaChange([...uploadedMediaIds, ...successfulIds])
      }

      // Show results
      if (result.totalUploaded > 0) {
        toast.success(`Uploaded ${result.totalUploaded} image${result.totalUploaded > 1 ? 's' : ''}`)
      }
      if (result.totalFailed > 0) {
        toast.error(`Failed to upload ${result.totalFailed} image${result.totalFailed > 1 ? 's' : ''}`)
      }
    } catch (error) {
      console.error('Batch upload failed:', error)
      toast.error('Failed to upload images')

      // Remove all previews from this batch
      setPreviews((prev) => {
        const remainingPreviews = prev.filter((p) => {
          const isFromThisBatch = newPreviews.some((np) => np.id === p.id)
          if (isFromThisBatch && p.url.startsWith('blob:')) {
            URL.revokeObjectURL(p.url)
          }
          return !isFromThisBatch
        })
        return remainingPreviews
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveMedia = async (previewId: string) => {
    const preview = previews.find((p) => p.id === previewId)
    if (!preview) return

    // If already uploaded, delete from server
    if (!preview.isUploading && !preview.id.startsWith('temp-')) {
      try {
        await deleteMedia.mutateAsync(preview.id)
        onUploadedMediaChange(uploadedMediaIds.filter((id) => id !== preview.id))
        toast.success('Media removed')
      } catch (error) {
        console.error('Failed to delete media:', error)
        toast.error('Failed to remove media')
        return
      }
    }

    // Remove from previews
    setPreviews((prev) => prev.filter((p) => p.id !== previewId))

    // Revoke object URL to free memory
    if (preview.url.startsWith('blob:')) {
      URL.revokeObjectURL(preview.url)
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
    handleFileSelect(e.dataTransfer.files)
  }

  const remainingSlots = MAX_IMAGES - uploadedMediaIds.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Upload Media</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Add new photos to your album (optional)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4" />
            Upload Photos
          </CardTitle>
          <CardDescription>
            Drag and drop or click to upload up to {MAX_IMAGES} images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            } ${remainingSlots === 0 || isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />

            {isUploading ? (
              <>
                <Loader2 className="mx-auto h-12 w-12 text-primary mb-4 animate-spin" />
                <p className="text-lg font-medium mb-2">Uploading images...</p>
                <p className="text-sm text-muted-foreground">Please wait while your images are being uploaded</p>
              </>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  {isDragging ? 'Drop images here' : 'Drag and drop images here'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <Button type="button" variant="outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>
                  Choose Files
                </Button>
              </>
            )}
          </div>

          {/* Upload Counter */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {uploadedMediaIds.length} / {MAX_IMAGES} images uploaded
            </span>
            {remainingSlots > 0 && (
              <span className="text-muted-foreground">
                {remainingSlots} {remainingSlots === 1 ? 'slot' : 'slots'} remaining
              </span>
            )}
          </div>

          {/* Preview Grid */}
          {previews.length > 0 && (
            <div className="border rounded-lg p-4">
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previews.map((preview) => (
                    <div key={preview.id} className="relative aspect-square group">
                      <Image
                        src={preview.url}
                        alt="Upload preview"
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />

                      {/* Remove Button */}
                      {!preview.isUploading && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveMedia(preview.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Upload Progress */}
                      {preview.isUploading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Empty State */}
          {previews.length === 0 && (
            <div className="border rounded-lg p-8 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No images uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                You can skip this step if you want to add existing tribe media instead
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
