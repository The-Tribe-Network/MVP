'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Image, Link2, FolderOpen, Plus, ExternalLink, Trash2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const mediaSettingsSchema = z.object({
  linkedAlbumId: z.string().nullable(),
  autoCreateAlbum: z.boolean(),
  allowAttendeeUploads: z.boolean(),
})

type MediaSettingsInput = z.infer<typeof mediaSettingsSchema>

interface MediaSectionProps {
  tribeId: string
  eventId: string
}

// Mock data for demonstration
const mockLinks = [
  { id: '1', title: 'Zoom Meeting', url: 'https://zoom.us/j/123456789', description: 'Join the virtual meetup' },
  { id: '2', title: 'Event Tickets', url: 'https://tickets.example.com', description: 'Purchase tickets here' },
]

const mockAlbums = [
  { id: 'album-1', name: 'General Photos' },
  { id: 'album-2', name: 'Summer Events 2024' },
  { id: 'album-3', name: 'Member Highlights' },
]

export function MediaSection({ tribeId, eventId }: MediaSectionProps) {
  const form = useForm<MediaSettingsInput>({
    resolver: zodResolver(mediaSettingsSchema),
    defaultValues: {
      linkedAlbumId: null,
      autoCreateAlbum: true,
      allowAttendeeUploads: true,
    },
  })

  const onSubmit = (data: MediaSettingsInput) => {
    // TODO: Implement API call when ready
    console.log('Updating media settings:', { tribeId, eventId, data })
    toast.success('Media settings updated successfully')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Media & Links</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage photos, albums, and external links for this event
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Album Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderOpen className="h-4 w-4" />
                Event Album
              </CardTitle>
              <CardDescription>
                Link photos from this event to a tribe album
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="linkedAlbumId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linked Album</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an album" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No album (create new on first upload)</SelectItem>
                        {mockAlbums.map((album) => (
                          <SelectItem key={album.id} value={album.id}>
                            {album.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Photos uploaded to this event will be added to the selected album
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoCreateAlbum"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-Create Album</FormLabel>
                      <FormDescription>
                        Automatically create a new album when the first photo is uploaded
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowAttendeeUploads"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Attendee Uploads</FormLabel>
                      <FormDescription>
                        Let attendees upload photos to the event album
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* External Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="h-4 w-4" />
                External Links
              </CardTitle>
              <CardDescription>
                Add useful links for attendees (Zoom, tickets, parking, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockLinks.length > 0 ? (
                <div className="space-y-3">
                  {mockLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-muted">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{link.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No links added yet</p>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <p className="text-sm font-medium">Add New Link</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Title</label>
                    <Input placeholder="e.g., Zoom Meeting" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">URL</label>
                    <Input placeholder="https://..." className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Description (optional)</label>
                  <Input placeholder="Brief description of the link" className="mt-1" />
                </div>
                <Button variant="outline" type="button" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
