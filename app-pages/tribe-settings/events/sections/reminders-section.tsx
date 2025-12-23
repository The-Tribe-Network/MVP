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
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import type { UpdateEventsSettingsInput } from '@/lib/validations/tribe-settings';

interface RemindersSectionProps {
  control: Control<UpdateEventsSettingsInput>;
}

export function RemindersSection({ control }: RemindersSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminders & Notifications</CardTitle>
        <CardDescription>
          Configure event reminders and notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="enableEventReminders"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Send event reminders</FormLabel>
                <FormDescription>
                  Automatically remind members about upcoming events
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
          name="reminderTimings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reminder timing</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="1d,1h,15m"
                />
              </FormControl>
              <FormDescription>
                Comma-separated timing (d=days, h=hours, m=minutes). Example: 1d,1h
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="notifyOnRsvpChanges"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Notify on RSVP changes</FormLabel>
                <FormDescription>
                  Notify event creators when attendees change their RSVP
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
  );
}
