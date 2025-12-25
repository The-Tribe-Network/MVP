'use client'

import { useRef, useState } from 'react'
import { useFormContext, useWatch, type Control } from 'react-hook-form'
import { Upload, Loader2 } from 'lucide-react'
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
} from '@/components/ui/form'
import { useUploadAvatar } from '@/lib/hooks/use-upload'
import { validateImageFile } from '@/lib/utils/image'
import { toast } from 'sonner'
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadAvatar = useUploadAvatar()
  const [isUploading, setIsUploading] = useState(false)

  const tribeName = useWatch({ control, name: 'tribeName' })
  const avatarUrl = useWatch({ control, name: 'avatarUrl' })

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
      setValue('avatar', result.id)
      setValue('avatarUrl', result.url)
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

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
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
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => fileInputRef.current?.click()}
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
                className="bg-white/5 border-zinc-700"
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
                <SelectTrigger className="w-full bg-white/5 border-zinc-700">
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
                className="bg-white/5 border-zinc-700 min-h-[120px]"
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
