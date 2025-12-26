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
import { BarChart3, Shield, Eye, Plus } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const pollSettingsSchema = z.object({
  enablePolls: z.boolean(),
  pollCreationLevel: z.enum(['event_creator', 'moderators', 'admins']),
  pollResultsVisibility: z.enum(['immediate', 'after_voting', 'after_close', 'hidden']),
  allowAnonymousPolls: z.boolean(),
})

type PollSettingsInput = z.infer<typeof pollSettingsSchema>

interface PollsSectionProps {
  tribeId: string
  eventId: string
}

export function PollsSection({ tribeId, eventId }: PollsSectionProps) {
  const form = useForm<PollSettingsInput>({
    resolver: zodResolver(pollSettingsSchema),
    defaultValues: {
      enablePolls: true,
      pollCreationLevel: 'event_creator',
      pollResultsVisibility: 'after_voting',
      allowAnonymousPolls: true,
    },
  })

  const pollsEnabled = form.watch('enablePolls')

  const onSubmit = (data: PollSettingsInput) => {
    // TODO: Implement API call when ready
    console.log('Updating poll settings:', { tribeId, eventId, data })
    toast.success('Poll settings updated successfully')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Event Polls</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Configure polls and voting for this event
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Enable/Disable Polls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4" />
                Polls
              </CardTitle>
              <CardDescription>
                Enable or disable polls for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="enablePolls"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Event Polls</FormLabel>
                      <FormDescription>
                        Allow polls to be created for this event
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

          {pollsEnabled && (
            <>
              {/* Poll Creation Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4" />
                    Poll Permissions
                  </CardTitle>
                  <CardDescription>
                    Control who can create polls for this event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pollCreationLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Who Can Create Polls</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select permission level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="event_creator">Event Creator Only</SelectItem>
                            <SelectItem value="moderators">Event Creator & Moderators</SelectItem>
                            <SelectItem value="admins">Event Creator & Admins</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose who has permission to create polls for this event
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowAnonymousPolls"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Allow Anonymous Voting</FormLabel>
                          <FormDescription>
                            Let poll creators hide voter identities
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

              {/* Results Visibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Eye className="h-4 w-4" />
                    Results Visibility
                  </CardTitle>
                  <CardDescription>
                    Control when poll results are shown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="pollResultsVisibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>When to Show Results</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="immediate">
                              Immediately (show results as votes come in)
                            </SelectItem>
                            <SelectItem value="after_voting">
                              After voting (show after user has voted)
                            </SelectItem>
                            <SelectItem value="after_close">
                              After poll closes (hide until deadline)
                            </SelectItem>
                            <SelectItem value="hidden">
                              Hidden (only visible to poll creator)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This is the default for new polls; creators can override per-poll
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Active Polls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Plus className="h-4 w-4" />
                    Active Polls
                  </CardTitle>
                  <CardDescription>
                    Manage existing polls for this event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No polls yet</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Poll
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

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
