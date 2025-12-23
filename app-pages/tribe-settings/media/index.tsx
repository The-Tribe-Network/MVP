'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMediaSettings, useUpdateMediaSettings } from '@/lib/hooks/use-tribe-settings';
import { memberWithPermissionsOptions } from '@/lib/query-options/tribe-settings';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UploadsSection } from './sections/uploads-section';
import { AlbumsSection } from './sections/albums-section';
import { GalleryDisplaySection } from './sections/gallery-display-section';
import { ModerationSection } from './sections/moderation-section';
import { MediaSettingsSkeleton } from './loading';
import { MediaSettingsError } from './error';
import { updateMediaSettingsSchema } from '@/lib/validations/tribe-settings';
import type { UpdateMediaSettingsInput } from '@/lib/validations/tribe-settings';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface MediaSettingsProps {
  tribeId: string;
}

export function MediaSettings({ tribeId }: MediaSettingsProps) {
  // Fetch media settings
  const {
    data: settings,
    isLoading: settingsLoading,
    isError: settingsError,
    refetch,
  } = useMediaSettings(tribeId);

  // Fetch member permissions
  const { data: member } = useQuery(memberWithPermissionsOptions(tribeId));

  // Update mutation
  const { mutate: updateSettings, isPending } = useUpdateMediaSettings(tribeId);

  // Initialize form
  const form = useForm<UpdateMediaSettingsInput>({
    resolver: zodResolver(updateMediaSettingsSchema),
    values: settings
      ? {
          mediaUploadPermissionLevel: settings.mediaUploadPermissionLevel,
          maxMediaFileSize: settings.maxMediaFileSize,
          autoAddPostMediaToGallery: settings.autoAddPostMediaToGallery,
          albumCreationPermissionLevel: settings.albumCreationPermissionLevel,
          defaultAlbumPrivacy: settings.defaultAlbumPrivacy,
          allowCollaborativeAlbums: settings.allowCollaborativeAlbums,
          autoCreateEventAlbums: settings.autoCreateEventAlbums,
          enableMediaLikes: settings.enableMediaLikes,
          requireMediaApproval: settings.requireMediaApproval,
        }
      : undefined,
  });

  // Check permissions
  const canEdit =
    member?.member.role === 'owner' || member?.canEditTribeSettings === true;

  // Handle loading state
  if (settingsLoading) {
    return <MediaSettingsSkeleton />;
  }

  // Handle error state
  if (settingsError || !settings) {
    return (
      <MediaSettingsError
        message="Failed to load media settings"
        onRetry={() => refetch()}
      />
    );
  }

  // Handle permission denied
  if (!canEdit) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to edit tribe settings. Only tribe owners
            and admins with the <code className="text-sm">canEditTribeSettings</code>{' '}
            permission can access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Handle form submission
  const onSubmit = (data: UpdateMediaSettingsInput) => {
    updateSettings(data, {
      onSuccess: () => {
        toast.success('Media settings updated successfully');
        form.reset(data); // Reset form with new data to clear dirty state
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update media settings');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Settings</h1>
        <p className="text-muted-foreground">
          Configure upload permissions, album settings, and gallery display options
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Uploads */}
          <UploadsSection control={form.control} />

          <Separator />

          {/* Section 2: Albums */}
          <AlbumsSection control={form.control} />

          <Separator />

          {/* Section 3: Gallery Display */}
          <GalleryDisplaySection control={form.control} />

          <Separator />

          {/* Section 4: Moderation */}
          <ModerationSection control={form.control} />

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending || !form.formState.isDirty}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.formState.isDirty}
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
