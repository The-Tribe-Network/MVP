'use client'

import { useState, useRef, useEffect } from 'react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, ImageIcon, X } from 'lucide-react'
import { FILE_SIZE_LIMITS } from '@/lib/constants/media'

interface MediaUploadDialogProps {
  tribeId: string
  onMediaUploaded?: () => void
}

interface Album {
  id: string
  name: string
}

export function MediaUploadDialog({ tribeId, onMediaUploaded }: MediaUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch albums when dialog opens
  useEffect(() => {
    if (open) {
      fetchAlbums()
    }
  }, [open])

  const fetchAlbums = async () => {
    setIsLoadingAlbums(true)
    try {
      const response = await fetch(`/api/tribes/${tribeId}/albums`)
      if (response.ok) {
        const data = await response.json()
        setAlbums(data.albums || [])
      }
    } catch (err) {
      console.error('Failed to fetch albums:', err)
    } finally {
      setIsLoadingAlbums(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMITS.PHOTO) {
      setError(`File size must be less than ${FILE_SIZE_LIMITS.PHOTO / 1024 / 1024}MB`)
      return
    }

    setError(null)
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

    setError(null)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (selectedAlbum) {
        formData.append('albumId', selectedAlbum)
      }

      const response = await fetch(`/api/tribes/${tribeId}/media`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload media')
      }

      // Reset form and close dialog
      handleRemoveFile()
      setSelectedAlbum(null)
      setOpen(false)

      // Notify parent component
      onMediaUploaded?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Upload photos to your tribe. You can optionally add them to an album.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
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
            />
          </div>

          {/* Album Selection */}
          <div className="grid gap-2">
            <Label htmlFor="album">
              Add to Album <span className="text-sm text-muted-foreground">(optional)</span>
            </Label>
            <Select value={selectedAlbum || ''} onValueChange={setSelectedAlbum}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingAlbums ? 'Loading albums...' : 'Select an album'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Don't add to album</SelectItem>
                {albums.map((album) => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
