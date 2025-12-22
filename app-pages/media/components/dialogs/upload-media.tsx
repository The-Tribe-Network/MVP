'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, ImageIcon, X, Loader2 } from 'lucide-react'
import { FILE_SIZE_LIMITS } from '@/lib/constants/media'
import { useTribeAlbums } from '@/lib/hooks/use-albums'
import { useUploadTribeMedia } from '@/lib/hooks/use-upload'
import { toast } from 'sonner'
import { useTribeMediaPageStore } from '../store-provider'

interface UploadMediaDialogProps {
  tribeId: string
}

export default function UploadMediaDialog({ tribeId }: UploadMediaDialogProps) {
  const closeDialog = useTribeMediaPageStore((s) => s.closeDialog);
  const isDialogOpen = useTribeMediaPageStore((s) => s.isDialogOpen);

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Use TanStack Query hooks
  const { data: albums = [], isLoading: isLoadingAlbums } = useTribeAlbums(tribeId)
  const uploadMedia = useUploadTribeMedia(tribeId)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMITS.PHOTO) {
      toast.error(`File size must be less than ${FILE_SIZE_LIMITS.PHOTO / 1024 / 1024}MB`)
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      await uploadMedia.mutateAsync({
        file: selectedFile,
        albumId: selectedAlbum && selectedAlbum !== 'none' ? selectedAlbum : null,
        addToAlbum: true,
      })

      // Success - reset form and close
      handleRemoveFile()
      setSelectedAlbum(null)
      closeDialog()
      toast.success('Media uploaded successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload media')
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Upload photos to your tribe. You can optionally add them to an album.
          </DialogDescription>
        </DialogHeader>

        {/* Dialog Content */}
        <div className="grid gap-4 py-4">
          {/* Show mutation error */}
          {uploadMedia.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {uploadMedia.error instanceof Error ? uploadMedia.error.message : 'Upload failed'}
            </div>
          )}

          {/* File Upload Area */}
          <div className="grid gap-2">
            <Label>Select Photo</Label>
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition"
              >
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to select an image</p>
                <p className="text-xs text-gray-400 mt-1">
                  Max size: {FILE_SIZE_LIMITS.PHOTO / 1024 / 1024}MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl || ''}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveFile}
                  disabled={uploadMedia.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="mt-2 text-sm text-gray-600">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploadMedia.isPending}
            />
          </div>

          {/* Album Selection */}
          <div className="grid gap-2">
            <Label htmlFor="album">
              Add to Album <span className="text-sm text-muted-foreground">(optional)</span>
            </Label>
            <Select
              value={selectedAlbum || ''}
              onValueChange={setSelectedAlbum}
              disabled={uploadMedia.isPending}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingAlbums
                      ? 'Loading albums...'
                      : 'Select an album'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General</SelectItem>
                {albums.map((album) => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dialog Footer */}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => closeDialog()}
            disabled={uploadMedia.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploadMedia.isPending || !selectedFile}
          >
            {uploadMedia.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
