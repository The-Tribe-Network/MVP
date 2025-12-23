'use client';

import { type Control } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { UpdateEventsSettingsInput } from '@/lib/validations/tribe-settings';

interface PollsSectionProps {
  control: Control<UpdateEventsSettingsInput>;
}

export function PollsSection({ control }: PollsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Polls</CardTitle>
        <CardDescription>
          Configure poll behavior for events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="enableEventPolls"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable event polls</FormLabel>
                <FormDescription>
                  Allow polls to be created for events (e.g., "What time works?")
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
          control={control}
          name="pollCreationPermissionLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Who can create polls</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="event_creator">
                    Event creator only
                  </SelectItem>
                  <SelectItem value="moderators">
                    Moderators and above
                  </SelectItem>
                  <SelectItem value="admins">Admins and above</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Control who can create polls for events
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="allowAnonymousPolls"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Allow anonymous polls</FormLabel>
                <FormDescription>
                  Let poll creators hide who voted for what
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
          control={control}
          name="pollResultsVisibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poll results visibility</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="immediate">
                    Immediate (visible as votes come in)
                  </SelectItem>
                  <SelectItem value="after_voting">
                    After voting (once you vote)
                  </SelectItem>
                  <SelectItem value="after_close">
                    After poll closes
                  </SelectItem>
                  <SelectItem value="hidden">
                    Hidden (creator only)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                When members can see poll results
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
