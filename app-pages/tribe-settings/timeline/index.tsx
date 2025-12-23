'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { timelineSettingsOptions } from '@/lib/query-options/tribe-settings';
import { useUpdateTimelineSettings } from '@/lib/hooks/use-tribe-settings';
import {
  updateTimelineSettingsSchema,
  type UpdateTimelineSettingsInput,
} from '@/lib/validations/tribe-settings';
import { PostingSection } from './sections/posting-section';
import { EngagementSection } from './sections/engagement-section';
import { TimelineSettingsSkeleton } from './loading';
import { TimelineSettingsError } from './error';

interface TimelineSettingsProps {
  tribeId: string;
}

export function TimelineSettings({ tribeId }: TimelineSettingsProps) {
  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(timelineSettingsOptions(tribeId));

  const { mutate: updateSettings, isPending } = useUpdateTimelineSettings(tribeId);

  const form = useForm<UpdateTimelineSettingsInput>({
    resolver: zodResolver(updateTimelineSettingsSchema),
    values: settings
      ? {
          postingPermissionLevel: settings.postingPermissionLevel,
          commentingPermissionLevel: settings.commentingPermissionLevel,
          allowPostEditing: settings.allowPostEditing,
          allowPostDeletion: settings.allowPostDeletion,
          enablePostLikes: settings.enablePostLikes,
          enableCommentLikes: settings.enableCommentLikes,
          enableNestedReplies: settings.enableNestedReplies,
          enablePinnedPosts: settings.enablePinnedPosts,
        }
      : undefined,
  });

  const onSubmit = (data: UpdateTimelineSettingsInput) => {
    updateSettings(data, {
      onSuccess: () => {
        toast.success('Timeline settings updated successfully');
        form.reset(data);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to update timeline settings');
      },
    });
  };

  if (isLoading) {
    return <TimelineSettingsSkeleton />;
  }

  if (isError) {
    return (
      <TimelineSettingsError
        message={error?.message}
        onRetry={() => refetch()}
      />
    );
  }

  if (!settings) {
    return <TimelineSettingsError message="Settings not found" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timeline Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure how posts, comments, and engagement work in your tribe
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <PostingSection control={form.control} />

          <Separator />

          <EngagementSection control={form.control} />

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
