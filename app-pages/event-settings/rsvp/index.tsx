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
  FormMessage,
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
import { Users, UserCheck, Clock, Eye } from 'lucide-react'

const rsvpSettingsSchema = z.object({
  capacityLimit: z.number().min(0).nullable(),
  enableWaitlist: z.boolean(),
  rsvpDeadline: z.string().optional(),
  attendeeVisibility: z.enum(['all_members', 'count_only', 'hidden']),
  guestAllowance: z.number().min(0).max(10),
  requireRsvpApproval: z.boolean(),
})

type RsvpSettingsInput = z.infer<typeof rsvpSettingsSchema>

interface RsvpSectionProps {
  tribeId: string
  eventId: string
}

export function RsvpSection({ tribeId, eventId }: RsvpSectionProps) {
  const form = useForm<RsvpSettingsInput>({
    resolver: zodResolver(rsvpSettingsSchema),
    defaultValues: {
      capacityLimit: null,
      enableWaitlist: true,
      rsvpDeadline: '',
      attendeeVisibility: 'all_members',
      guestAllowance: 0,
      requireRsvpApproval: false,
    },
  })

  const onSubmit = (data: RsvpSettingsInput) => {
    // TODO: Implement API call when ready
    console.log('Updating RSVP settings:', { tribeId, eventId, data })
    toast.success('RSVP settings updated successfully')
  }

  const hasCapacityLimit = form.watch('capacityLimit') !== null && form.watch('capacityLimit') !== 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">RSVP & Attendance</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Configure how members can RSVP and attendance limits
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Capacity Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Capacity
              </CardTitle>
              <CardDescription>
                Set limits on how many people can attend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="capacityLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Attendees</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Leave empty for unlimited"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === '' ? null : parseInt(value, 10))
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Set to 0 or leave empty for unlimited capacity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {hasCapacityLimit && (
                <FormField
                  control={form.control}
                  name="enableWaitlist"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Waitlist</FormLabel>
                        <FormDescription>
                          Allow members to join a waitlist when capacity is reached
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
              )}

              <FormField
                control={form.control}
                name="guestAllowance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Allowance (+1s)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value, 10))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select guest allowance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">No guests allowed</SelectItem>
                        <SelectItem value="1">1 guest per member</SelectItem>
                        <SelectItem value="2">2 guests per member</SelectItem>
                        <SelectItem value="3">3 guests per member</SelectItem>
                        <SelectItem value="5">5 guests per member</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How many additional guests each member can bring
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* RSVP Deadline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                RSVP Deadline
              </CardTitle>
              <CardDescription>
                Set a cutoff time for RSVPs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="rsvpDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave empty to allow RSVPs until the event starts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Approval & Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCheck className="h-4 w-4" />
                Approval & Visibility
              </CardTitle>
              <CardDescription>
                Control RSVP approval and attendee list visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="requireRsvpApproval"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require RSVP Approval</FormLabel>
                      <FormDescription>
                        Manually approve each RSVP before confirming attendance
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
                name="attendeeVisibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Attendee List Visibility
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all_members">
                          Show full attendee list to all members
                        </SelectItem>
                        <SelectItem value="count_only">
                          Show count only (names hidden)
                        </SelectItem>
                        <SelectItem value="hidden">
                          Hide attendee information completely
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Control what attendee information is visible to tribe members
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
