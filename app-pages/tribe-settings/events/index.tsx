'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useEventsSettings, useUpdateEventsSettings } from '@/lib/hooks/use-tribe-settings';
import {
  updateEventsSettingsSchema,
  type UpdateEventsSettingsInput,
} from '@/lib/validations/tribe-settings';
import { EventCreationSection } from './sections/event-creation-section';
import { RsvpSection } from './sections/rsvp-section';
import { PollsSection } from './sections/polls-section';
import { RemindersSection } from './sections/reminders-section';
import { CalendarSection } from './sections/calendar-section';
import { Skeleton } from '@/components/ui/skeleton';

interface EventsSettingsProps {
  tribeId: string;
}

export function EventsSettings({ tribeId }: EventsSettingsProps) {
  const {
    data: settings,
    isLoading,
    isError,
    error,
  } = useEventsSettings(tribeId);
  const { mutate: updateSettings, isPending } = useUpdateEventsSettings(tribeId);

  const form = useForm<UpdateEventsSettingsInput>({
    resolver: zodResolver(updateEventsSettingsSchema),
    values: settings || undefined,
  });

  const onSubmit = (data: UpdateEventsSettingsInput) => {
    updateSettings(data, {
      onSuccess: () => {
        toast.success('Events settings updated successfully');
        form.reset(data);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to update events settings');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">📅 Events Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure events, RSVPs, polls, and reminders
          </p>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">📅 Events Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure events, RSVPs, polls, and reminders
          </p>
        </div>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            {error?.message || 'Failed to load events settings'}
          </p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">📅 Events Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure events, RSVPs, polls, and reminders
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">No settings found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📅 Events Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure events, RSVPs, polls, and reminders
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <EventCreationSection control={form.control} />

          <Separator />

          <RsvpSection control={form.control} />

          <Separator />

          <PollsSection control={form.control} />

          <Separator />

          <RemindersSection control={form.control} />

          <Separator />

          <CalendarSection control={form.control} />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
