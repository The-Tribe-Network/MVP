'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, MapPin, FileText, Image as ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUpdateEvent } from '@/lib/hooks/use-events'
import { useUploadEventCover } from '@/lib/hooks/use-upload'
import { validateImageFile } from '@/lib/utils/image'
import type { EventWithDetails } from '@/lib/database/types'

const eventDetailsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(5000, 'Description too long').optional(),
  location: z.string().max(200, 'Location too long').optional(),
  coverImageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']),
})

type EventDetailsInput = z.infer<typeof eventDetailsSchema>

interface DetailsSectionProps {
  tribeId: string
  eventId: string
  event: EventWithDetails
}

export function DetailsSection({ tribeId, eventId, event }: DetailsSectionProps) {
  // Upload state
  const coverFileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | undefined>(
    event.coverImageUrl || undefined
  )

  // Mutations
  const { mutate: updateEventMutation, isPending } = useUpdateEvent()
  const uploadCover = useUploadEventCover()

  const form = useForm<EventDetailsInput>({
    resolver: zodResolver(eventDetailsSchema),
    defaultValues: {
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      coverImageUrl: event.coverImageUrl || '',
      startDate: format(new Date(event.startDate), 'yyyy-MM-dd'),
      startTime: format(new Date(event.startDate), 'HH:mm'),
      endDate: event.endDate ? format(new Date(event.endDate), 'yyyy-MM-dd') : '',
      endTime: event.endDate ? format(new Date(event.endDate), 'HH:mm') : '',
      status: event.status,
    },
  })

  // Handle cover image file selection
  const handleCoverFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file')
      return
    }

    setIsUploadingCover(true)
    try {
      const result = await uploadCover.mutateAsync({ file, tribeId })
      form.setValue('coverImageUrl', result.url)
      setCurrentCoverUrl(result.url)
      toast.success('Cover image uploaded!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload cover')
    } finally {
      setIsUploadingCover(false)
      if (coverFileInputRef.current) {
        coverFileInputRef.current.value = ''
      }
    }
  }

  // Handle cover image removal
  const handleRemoveCover = () => {
    form.setValue('coverImageUrl', '')
    setCurrentCoverUrl(undefined)
    toast.success('Cover image removed')
  }

  const onSubmit = (data: EventDetailsInput) => {
    // Combine date + time strings into Date objects
    const startDate = new Date(`${data.startDate}T${data.startTime}`)
    const endDate = data.endDate && data.endTime
      ? new Date(`${data.endDate}T${data.endTime}`)
      : null

    updateEventMutation(
      {
        tribeId,
        eventId,
        data: {
          title: data.title,
          description: data.description || null,
          location: data.location || null,
          coverImageUrl: data.coverImageUrl || null,
          startDate,
          endDate,
          status: data.status,
        },
      },
      {
        onSuccess: () => {
          toast.success('Event details updated successfully')
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Failed to update event')
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Event Details</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Edit the core information for your event
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Cover Image Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-4 w-4" />
                Cover Image
              </CardTitle>
              <CardDescription>
                A visual banner for your event (16:9 aspect ratio recommended)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hidden file input */}
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverFileSelect}
                className="hidden"
              />

              {currentCoverUrl ? (
                /* Cover preview with change button */
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <div className="aspect-video">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentCoverUrl}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
                      onClick={handleRemoveCover}
                      disabled={isUploadingCover}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => coverFileInputRef.current?.click()}
                    disabled={isUploadingCover}
                  >
                    {isUploadingCover ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Change Cover
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                /* Upload zone when no cover */
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className={cn(
                    'w-full aspect-video border-2 border-dashed rounded-lg',
                    'flex flex-col items-center justify-center gap-2',
                    'text-muted-foreground hover:text-foreground hover:border-foreground/50',
                    'transition-colors cursor-pointer',
                    isUploadingCover && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isUploadingCover ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-sm">Click to upload a cover image</span>
                      <span className="text-xs">PNG, JPG, WebP up to 5MB</span>
                    </>
                  )}
                </button>
              )}
            </CardContent>
          </Card>
          
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Basic Information
              </CardTitle>
              <CardDescription>
                The main details attendees will see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your event..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about what attendees can expect
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Date & Time Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Date & Time
              </CardTitle>
              <CardDescription>
                When the event starts and ends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time (Optional)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Location
              </CardTitle>
              <CardDescription>
                Where the event takes place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address or Venue</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location or address" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be displayed to attendees and shown on a map if recognized
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
                setCurrentCoverUrl(event.coverImageUrl || undefined)
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isUploadingCover}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
