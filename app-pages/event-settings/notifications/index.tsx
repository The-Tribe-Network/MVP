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
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Bell, Clock, MessageSquare, Send } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

const notificationSettingsSchema = z.object({
  enableReminders: z.boolean(),
  reminderSchedule: z.array(z.string()),
  notifyOnRsvpChanges: z.boolean(),
  notifyOnComments: z.boolean(),
  notifyOnPollResults: z.boolean(),
})

type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>

const reminderOptions = [
  { id: '1w', label: '1 week before' },
  { id: '1d', label: '1 day before' },
  { id: '1h', label: '1 hour before' },
  { id: '15m', label: '15 minutes before' },
]

interface NotificationsSectionProps {
  tribeId: string
  eventId: string
}

export function NotificationsSection({ tribeId, eventId }: NotificationsSectionProps) {
  const form = useForm<NotificationSettingsInput>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      enableReminders: true,
      reminderSchedule: ['1d', '1h'],
      notifyOnRsvpChanges: true,
      notifyOnComments: true,
      notifyOnPollResults: true,
    },
  })

  const remindersEnabled = form.watch('enableReminders')

  const onSubmit = (data: NotificationSettingsInput) => {
    // TODO: Implement API call when ready
    console.log('Updating notification settings:', { tribeId, eventId, data })
    toast.success('Notification settings updated successfully')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Notifications & Reminders</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Configure how attendees are notified about this event
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Event Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Event Reminders
              </CardTitle>
              <CardDescription>
                Send automatic reminders to attendees before the event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="enableReminders"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Reminders</FormLabel>
                      <FormDescription>
                        Automatically remind attendees before the event starts
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

              {remindersEnabled && (
                <FormField
                  control={form.control}
                  name="reminderSchedule"
                  render={() => (
                    <FormItem>
                      <FormLabel>Reminder Schedule</FormLabel>
                      <FormDescription className="mb-4">
                        Select when to send reminders to attendees
                      </FormDescription>
                      <div className="grid grid-cols-2 gap-4">
                        {reminderOptions.map((option) => (
                          <FormField
                            key={option.id}
                            control={form.control}
                            name="reminderSchedule"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || []
                                      if (checked) {
                                        field.onChange([...current, option.id])
                                      } else {
                                        field.onChange(current.filter((id) => id !== option.id))
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Activity Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Activity Notifications
              </CardTitle>
              <CardDescription>
                Notify the event host about activity on this event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notifyOnRsvpChanges"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">RSVP Changes</FormLabel>
                      <FormDescription>
                        Get notified when someone RSVPs or cancels
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
                name="notifyOnComments"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">New Comments</FormLabel>
                      <FormDescription>
                        Get notified when someone comments on the event
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
                name="notifyOnPollResults"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Poll Results</FormLabel>
                      <FormDescription>
                        Get notified when polls close and results are available
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

          {/* Send Announcement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="h-4 w-4" />
                Send Announcement
              </CardTitle>
              <CardDescription>
                Send a one-time message to all attendees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write your announcement here..."
                className="min-h-[100px] resize-none"
              />
              <div className="flex justify-end">
                <Button variant="outline" type="button">
                  <Send className="h-4 w-4 mr-2" />
                  Send to All Attendees
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
