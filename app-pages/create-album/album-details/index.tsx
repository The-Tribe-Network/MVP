'use client'

import { useRef, useState, useEffect, DragEvent } from 'react'
import Image from 'next/image'
import { Globe, Lock, Shield, Image as ImageIcon, Upload, Loader2, X } from 'lucide-react'
import { Control, useWatch } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MediaSelectDialog } from '@/components/shared/media-select-dialog'
import { cn } from '@/lib/utils'
import type { CreateAlbumFormInput } from '@/lib/validations/album'

interface AlbumDetailsSectionProps {
  control: Control<CreateAlbumFormInput>
  tribeId: string
  coverPreviewUrl: string | null
  onCoverUpload: (file: File) => Promise<void>
  onCoverSelect: (mediaId: string, url: string) => void
  onCoverRemove: () => void
  isUploadingCover: boolean
}

export function AlbumDetailsSection({
  control,
  tribeId,
  coverPreviewUrl,
  onCoverUpload,
  onCoverSelect,
  onCoverRemove,
  isUploadingCover,
}: AlbumDetailsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch with RadioGroup
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Watch the name and description for character counts
  const name = useWatch({ control, name: 'name' })
  const description = useWatch({ control, name: 'description' })
  const coverId = useWatch({ control, name: 'coverId' })

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
    if (file) {
      onCoverUpload(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onCoverUpload(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Album Details</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Set up your album's basic information and cover photo
        </p>
      </div>

      {/* Cover Photo Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="h-4 w-4" />
            Cover Photo
          </CardTitle>
          <CardDescription>
            Choose a cover image for your album (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {coverPreviewUrl ? (
            /* Cover preview */
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border border-border">
                <div className="aspect-video relative">
                  <Image
                    src={coverPreviewUrl}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
                  onClick={onCoverRemove}
                  disabled={isUploadingCover}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingCover}
                >
                  <Upload className="h-4 w-4" />
                  Change Cover
                </Button>
              </div>
            </div>
          ) : (
            /* Drop zone */
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50',
                isUploadingCover && 'opacity-50 cursor-not-allowed'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                {isUploadingCover ? (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Drag and drop an image here
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WebP up to 5MB
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Upload from device
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={() => setIsMediaDialogOpen(true)}
                      >
                        <ImageIcon className="h-4 w-4" />
                        Select from tribe
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Media Select Dialog */}
          <MediaSelectDialog
            tribeId={tribeId}
            open={isMediaDialogOpen}
            onOpenChange={setIsMediaDialogOpen}
            onSelect={onCoverSelect}
            title="Select Cover Photo"
            description="Choose an image from your tribe's media to use as the album cover"
            selectedMediaId={coverId}
          />
        </CardContent>
      </Card>
      
      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="h-4 w-4" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Name your album and add an optional description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Album Name */}
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Album Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Summer Vibes 2024"
                    maxLength={100}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {(name || '').length}/100 characters
                </FormDescription>
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what this album is about..."
                    className="min-h-[100px] resize-none"
                    maxLength={500}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  {(description || '').length}/500 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Privacy Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control who can view and add photos to this album
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isMounted ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ) : (
            <FormField
              control={control}
              name="privacy"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      defaultValue="public"
                      onValueChange={field.onChange}
                      className="space-y-3"
                    >
                      {/* Public Option */}
                      <div
                        className={cn(
                          'cursor-pointer rounded-lg border p-4 transition-all',
                          field.value === 'public'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground/50'
                        )}
                        onClick={() => field.onChange('public')}
                      >
                        <div className="flex items-start gap-4">
                          <RadioGroupItem value="public" id="public" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Globe className="h-5 w-5" />
                              <label htmlFor="public" className="text-base font-semibold cursor-pointer">
                                Public
                              </label>
                              <Badge variant="secondary" className="ml-auto">
                                Recommended
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              All tribe members can view and add photos to this album.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Private Option */}
                      <div
                        className={cn(
                          'cursor-pointer rounded-lg border p-4 transition-all',
                          field.value === 'private'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground/50'
                        )}
                        onClick={() => field.onChange('private')}
                      >
                        <div className="flex items-start gap-4">
                          <RadioGroupItem value="private" id="private" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Lock className="h-5 w-5" />
                              <label htmlFor="private" className="text-base font-semibold cursor-pointer">
                                Private
                              </label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Only you can view and manage this album.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Admin Only Option */}
                      <div
                        className={cn(
                          'cursor-pointer rounded-lg border p-4 transition-all',
                          field.value === 'admin_only'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground/50'
                        )}
                        onClick={() => field.onChange('admin_only')}
                      >
                        <div className="flex items-start gap-4">
                          <RadioGroupItem value="admin_only" id="admin_only" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Shield className="h-5 w-5" />
                              <label htmlFor="admin_only" className="text-base font-semibold cursor-pointer">
                                Admin Only
                              </label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Only admins and moderators can view and manage this album.
                            </p>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
