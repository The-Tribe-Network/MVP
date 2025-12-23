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

interface EventCreationSectionProps {
  control: Control<UpdateEventsSettingsInput>;
}

export function EventCreationSection({ control }: EventCreationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Creation</CardTitle>
        <CardDescription>
          Control who can create and edit events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="eventCreationPermissionLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Who can create events</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all_members">All members</SelectItem>
                  <SelectItem value="moderators">
                    Moderators and above
                  </SelectItem>
                  <SelectItem value="admins">Admins and above</SelectItem>
                  <SelectItem value="owner_only">Owner only (announcements mode)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="eventEditPermissionLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Who can edit events</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="creator_only">Creator only</SelectItem>
                  <SelectItem value="creator_and_admins">
                    Creator and admins
                  </SelectItem>
                  <SelectItem value="all_members">All members</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="requireEventEndDate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Require end date/time</FormLabel>
                <FormDescription>
                  All events must have an end date and time
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
          name="requireEventLocation"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Require location</FormLabel>
                <FormDescription>
                  All events must have a location specified
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
