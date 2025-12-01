'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUploadAvatar } from '@/lib/hooks/use-upload'
import { validateImageFile } from '@/lib/utils/image'
import { toast } from 'sonner'

interface ProfileInfoStepProps {
  displayName: string
  bio: string
  avatar: string
  avatarUrl?: string
  onDisplayNameChange: (value: string) => void
  onBioChange: (value: string) => void
  onAvatarChange: (value: string) => void
  onAvatarUrlChange?: (value: string) => void
}

export function ProfileInfoStep({
  displayName,
  bio,
  avatar,
  avatarUrl,
  onDisplayNameChange,
  onBioChange,
  onAvatarChange,
  onAvatarUrlChange,
}: ProfileInfoStepProps) {
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
      onAvatarChange(result.id)
      if (onAvatarUrlChange) {
        onAvatarUrlChange(result.url)
      }
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

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={avatarUrl || '/placeholder.svg?height=96&width=96'} />
            <AvatarFallback className="text-2xl bg-zinc-700">
              {displayName ? displayName.substring(0, 2).toUpperCase() : <User className="h-12 w-12" />}
            </AvatarFallback>
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Avatar
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 5MB</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="display-name">Display Name *</Label>
        <Input
          id="display-name"
          placeholder="How should we call you?"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          className="bg-white/5 border-zinc-700"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          This is your public display name on Tribe
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio (Optional)</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself..."
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          className="bg-white/5 border-zinc-700 min-h-[120px]"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">
          {bio.length}/500 characters
        </p>
      </div>
    </div>
  )
}
