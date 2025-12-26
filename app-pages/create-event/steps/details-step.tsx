"use client"

import { useRef, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock, MapPin, ImageIcon, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { validateImageFile } from "@/lib/utils/image"
import { useUploadEventCover, useDeleteMedia } from "@/lib/hooks/use-upload"
import { toast } from "sonner"
import { type Control, useFormContext, useWatch } from "react-hook-form"
import type { CreateEventWithPollInput } from "@/lib/validations/event"

interface DetailsStepProps {
  control: Control<CreateEventWithPollInput>
  tribeId: string
}

export function DetailsStep({ control, tribeId }: DetailsStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const { setValue } = useFormContext<CreateEventWithPollInput>()
  const coverImageUrl = useWatch({ control, name: "coverImageUrl" })
  const coverImageId = useWatch({ control, name: "coverImageId" })

  const uploadImageMutation = useUploadEventCover()
  const deleteMediaMutation = useDeleteMedia()

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || "Invalid image file")
      return
    }

    // Delete previous image if one exists
    if (coverImageId) {
      try {
        await deleteMediaMutation.mutateAsync(coverImageId)
      } catch (error) {
        console.error("Failed to delete previous image:", error)
      }
    }

    setIsUploadingImage(true)
    try {
      const result = await uploadImageMutation.mutateAsync({
        file,
        tribeId,
      })
      setValue("coverImageId", result.id)
      setValue("coverImageUrl", result.url)
      toast.success("Cover image uploaded")
    } catch (error) {
      console.error("Failed to upload image:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = async () => {
    if (coverImageId) {
      try {
        await deleteMediaMutation.mutateAsync(coverImageId)
        toast.success("Cover image removed")
      } catch (error) {
        console.error("Failed to delete image:", error)
        toast.error(error instanceof Error ? error.message : "Failed to remove image")
      }
    }
    setValue("coverImageId", null)
    setValue("coverImageUrl", null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }
  return (
    <div className="space-y-6">
      {/* Event Title */}
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Title *</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Summer BBQ Party" {...field} />
            </FormControl>
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
                placeholder="Tell us more about your event..."
                className="min-h-[100px] resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Add details like what to bring, dress code, or special instructions
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Cover Image Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span>Cover Image (Optional)</span>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          className="hidden"
        />

        {coverImageUrl ? (
          /* Image preview */
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img
              src={coverImageUrl}
              alt="Cover preview"
              className="w-full h-48 object-cover"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
              onClick={handleRemoveImage}
              disabled={isUploadingImage || deleteMediaMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* Upload button/zone */
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isUploadingImage}
            className={cn(
              "w-full h-32 border-2 border-dashed rounded-lg",
              "flex flex-col items-center justify-center gap-2",
              "text-muted-foreground hover:text-foreground hover:border-foreground/50",
              "transition-colors cursor-pointer",
              isUploadingImage && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploadingImage ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm">Click to upload a cover image</span>
                <span className="text-xs">PNG, JPG, WebP up to 10MB</span>
              </>
            )}
          </button>
        )}
      </div>

      <Separator />

      {/* Date & Time Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Date & Time</span>
        </div>

        {/* Start Date & Time */}
        <FormField
          control={control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date & Time *</FormLabel>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          const existingDate = field.value
                          if (existingDate) {
                            date.setHours(
                              existingDate.getHours(),
                              existingDate.getMinutes()
                            )
                          } else {
                            date.setHours(12, 0) // Default to noon
                          }
                        }
                        field.onChange(date)
                      }}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Time Picker */}
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="time"
                    className="pl-10 w-full sm:w-[140px]"
                    value={field.value ? format(field.value, "HH:mm") : ""}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(":")
                      const newDate = field.value ? new Date(field.value) : new Date()
                      newDate.setHours(parseInt(hours), parseInt(minutes))
                      field.onChange(newDate)
                    }}
                  />
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Date & Time */}
        <FormField
          control={control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date & Time (Optional)</FormLabel>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick an end date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          const existingDate = field.value
                          if (existingDate) {
                            date.setHours(
                              existingDate.getHours(),
                              existingDate.getMinutes()
                            )
                          } else {
                            date.setHours(18, 0) // Default to 6pm
                          }
                        }
                        field.onChange(date)
                      }}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Time Picker */}
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="time"
                    className="pl-10 w-full sm:w-[140px]"
                    value={field.value ? format(field.value, "HH:mm") : ""}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(":")
                      const newDate = field.value ? new Date(field.value) : new Date()
                      newDate.setHours(parseInt(hours), parseInt(minutes))
                      field.onChange(newDate)
                    }}
                  />
                </div>
              </div>
              <FormDescription>Leave blank if it's a single point in time</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      {/* Location Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Location</span>
        </div>

        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Central Park, New York or Online via Zoom"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter a physical address or specify if it's a virtual event
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
