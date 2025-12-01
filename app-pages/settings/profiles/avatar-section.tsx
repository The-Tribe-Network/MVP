'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUploadAvatar } from '@/lib/hooks/use-upload'
import { validateImageFile } from '@/lib/utils/image'
import { toast } from 'sonner'

interface AvatarSectionProps {
  avatarUrl: string | null
  displayName: string
  onAvatarChange: (url: string | null, mediaId: string | null) => void
  disabled?: boolean
}

export function AvatarSection({
  avatarUrl,
  displayName,
  onAvatarChange,
  disabled = false,
}: AvatarSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadAvatar = useUploadAvatar()
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file')
      return
    }

    setIsUploading(true)
    try {
      const result = await uploadAvatar.mutateAsync(file)
      onAvatarChange(result.url, result.id)
      toast.success('Avatar uploaded successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    onAvatarChange(null, null)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const displayNameInitials = displayName
    ? displayName.substring(0, 2).toUpperCase()
    : ''

  return (
    <div className="flex items-center gap-6">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="text-2xl">
          {displayNameInitials || <User className="h-12 w-12" />}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={isUploading || disabled}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Change Photo
            </>
          )}
        </Button>
        {avatarUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveAvatar}
            disabled={isUploading || disabled}
          >
            Remove
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          JPG, PNG or WebP. Max size 5MB
        </p>
      </div>
    </div>
  )
}

