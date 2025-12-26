'use client'

import { useRef, useState } from 'react'
import { useFormContext, useWatch, type Control } from 'react-hook-form'
import { Upload, Loader2, ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { useUploadTribeAvatar, useUploadTribeBanner } from '@/lib/hooks/use-upload'
import { validateImageFile } from '@/lib/utils/image'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { CreateTribeFormInput } from '@/lib/validations/tribe'

const CATEGORIES = [
  { value: 'social', label: 'Social' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'family', label: 'Family' },
  { value: 'work', label: 'Work' },
  { value: 'hobbies', label: 'Hobbies' },
  { value: 'other', label: 'Other' },
] as const

interface BasicInfoStepProps {
  control: Control<CreateTribeFormInput>
}

export function BasicInfoStep({ control }: BasicInfoStepProps) {
  const { setValue } = useFormContext<CreateTribeFormInput>()
  const avatarFileInputRef = useRef<HTMLInputElement>(null)
  const bannerFileInputRef = useRef<HTMLInputElement>(null)
  const uploadAvatar = useUploadTribeAvatar()
  const uploadBanner = useUploadTribeBanner()
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)

  const tribeName = useWatch({ control, name: 'tribeName' })
  const avatarUrl = useWatch({ control, name: 'avatarUrl' })
  const bannerUrl = useWatch({ control, name: 'bannerUrl' })

  const handleAvatarFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const result = await uploadAvatar.mutateAsync({ file })
      setValue('avatar', result.id)
      setValue('avatarUrl', result.url)
      toast.success('Avatar uploaded successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
      if (avatarFileInputRef.current) {
        avatarFileInputRef.current.value = ''
      }
    }
  }

  const handleBannerFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file')
      return
    }

    setIsUploadingBanner(true)
    try {
      const result = await uploadBanner.mutateAsync({ file })
      setValue('banner', result.id)
      setValue('bannerUrl', result.url)
      toast.success('Banner uploaded successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload banner')
    } finally {
      setIsUploadingBanner(false)
      if (bannerFileInputRef.current) {
        bannerFileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveBanner = () => {
    setValue('banner', '')
    setValue('bannerUrl', '')
    if (bannerFileInputRef.current) {
      bannerFileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner Upload Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ImageIcon className="h-4 w-4" />
          <span>Banner Image (Optional)</span>
        </div>
        <FormDescription>
          A 16:9 banner image that appears at the top of your tribe dashboard
        </FormDescription>

        {/* Hidden file input for banner */}
        <input
          ref={bannerFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleBannerFileSelect}
          className="hidden"
        />

        {bannerUrl ? (
          /* Banner preview with 16:9 aspect ratio */
          <div className="relative rounded-lg overflow-hidden border border-border">
            <div className="aspect-video">
              <img
                src={bannerUrl}
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
              onClick={handleRemoveBanner}
              disabled={isUploadingBanner}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* Upload button/zone for banner */
          <button
            type="button"
            onClick={() => bannerFileInputRef.current?.click()}
            disabled={isUploadingBanner}
            className={cn(
              "w-full aspect-video border-2 border-dashed rounded-lg",
              "flex flex-col items-center justify-center gap-2",
              "text-muted-foreground hover:text-foreground hover:border-foreground/50",
              "transition-colors cursor-pointer",
              isUploadingBanner && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploadingBanner ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm">Click to upload a banner image</span>
                <span className="text-xs">16:9 aspect ratio recommended • PNG, JPG, WebP up to 5MB</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarUrl || '/placeholder.svg?height=96&width=96'} />
          <AvatarFallback className="text-2xl bg-zinc-700">
            {tribeName ? tribeName.substring(0, 2).toUpperCase() : 'TR'}
          </AvatarFallback>
        </Avatar>
        <input
          ref={avatarFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => avatarFileInputRef.current?.click()}
          disabled={isUploadingAvatar}
        >
          {isUploadingAvatar ? (
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

      {/* Tribe Name */}
      <FormField
        control={control}
        name="tribeName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tribe Name *</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter your tribe name"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category */}
      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Tell us what your tribe is about..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
