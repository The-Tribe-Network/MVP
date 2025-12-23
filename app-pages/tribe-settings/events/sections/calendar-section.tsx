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
  FormDescription,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import type { UpdateEventsSettingsInput } from '@/lib/validations/tribe-settings';

interface CalendarSectionProps {
  control: Control<UpdateEventsSettingsInput>;
}

export function CalendarSection({ control }: CalendarSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar & Media</CardTitle>
        <CardDescription>
          Configure calendar features and event media
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="enableCalendarExport"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable calendar export</FormLabel>
                <FormDescription>
                  Allow members to export events to their personal calendar (iCal, Google Calendar)
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
