'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUploadAvatar } from '@/lib/hooks/use-upload'
import { validateImageFile } from '@/lib/utils/image'
import { toast } from 'sonner'
import type { TribeCategory } from './types'

const CATEGORY_LABELS: Record<TribeCategory, string> = {
  social: 'Social',
  gaming: 'Gaming',
  family: 'Family',
  work: 'Work',
  hobbies: 'Hobbies',
  other: 'Other',
}

const CATEGORIES: TribeCategory[] = ['social', 'gaming', 'family', 'work', 'hobbies', 'other']

interface BasicInfoStepProps {
  tribeName: string
  description: string
  avatar: string // Media ID
  avatarUrl?: string // Preview URL
  category: TribeCategory
  onTribeNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onAvatarChange: (value: string) => void
  onAvatarUrlChange?: (value: string) => void
  onCategoryChange: (value: TribeCategory) => void
}

export function BasicInfoStep({
  tribeName,
  description,
  avatar,
  avatarUrl,
  category,
  onTribeNameChange,
  onDescriptionChange,
  onAvatarChange,
  onAvatarUrlChange,
  onCategoryChange,
}: BasicInfoStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadAvatar = useUploadAvatar()
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
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
      // Reset file input
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
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarUrl || '/placeholder.svg?height=96&width=96'} />
          <AvatarFallback className="text-2xl bg-zinc-700">
            {tribeName ? tribeName.substring(0, 2).toUpperCase() : 'TR'}
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="tribe-name">Tribe Name *</Label>
        <Input
          id="tribe-name"
          placeholder="Enter your tribe name"
          value={tribeName}
          onChange={(e) => onTribeNameChange(e.target.value)}
          className="bg-white/5 border-zinc-700"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger
            id="category"
            className="w-full bg-white/5 border-zinc-700"
          >
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Tell us what your tribe is about..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="bg-white/5 border-zinc-700 min-h-[120px]"
        />
      </div>
    </div>
  )
}

