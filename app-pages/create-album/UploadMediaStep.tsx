import { useRef, useState, DragEvent } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { useUploadTribeMedia } from '@/lib/hooks/use-upload'
import { useDeleteMedia } from '@/lib/hooks/use-upload'
import { toast } from 'sonner'
import type { UploadedMediaPreview } from './types'

interface UploadMediaStepProps {
  tribeId: string
  uploadedMediaIds: string[]
  onUploadedMediaChange: (ids: string[]) => void
}

const MAX_IMAGES = 20

export function UploadMediaStep({
  tribeId,
  uploadedMediaIds,
  onUploadedMediaChange,
}: UploadMediaStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<UploadedMediaPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const uploadMedia = useUploadTribeMedia(tribeId)
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

    // Create previews
    const newPreviews: UploadedMediaPreview[] = await Promise.all(
      newFiles.map(async (file) => {
        const url = URL.createObjectURL(file)
        return {
          id: `temp-${Date.now()}-${Math.random()}`,
          url,
          file,
          isUploading: true,
        }
      })
    )

    setPreviews((prev) => [...prev, ...newPreviews])

    // Upload files
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i]
      const preview = newPreviews[i]

      try {
        const result = await uploadMedia.mutateAsync({
          file,
          addToAlbum: false, // Don't add to any album yet
        })

        // Update preview with uploaded ID
        setPreviews((prev) =>
          prev.map((p) =>
            p.id === preview.id
              ? { ...p, id: result.id, url: result.url, isUploading: false }
              : p
          )
        )

        // Add to uploaded IDs
        onUploadedMediaChange([...uploadedMediaIds, result.id])

        toast.success(`Uploaded ${file.name}`)
      } catch (error) {
        console.error('Failed to upload:', file.name, error)
        toast.error(`Failed to upload ${file.name}`)

        // Remove failed preview
        setPreviews((prev) => prev.filter((p) => p.id !== preview.id))
      }
    }
  }

  const handleRemoveMedia = async (previewId: string) => {
    const preview = previews.find((p) => p.id === previewId)
    if (!preview) return

    // If already uploaded, delete from server
    if (!preview.isUploading && preview.id.startsWith('temp-') === false) {
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
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${remainingSlots === 0 ? 'opacity-50 pointer-events-none' : ''}`}
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
        />

        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">
          {isDragging ? 'Drop images here' : 'Drag and drop images here'}
        </p>
        <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
          Choose Files
        </Button>
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
        </div>
      )}
    </div>
  )
}
