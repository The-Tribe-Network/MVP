'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { tribeGeneralSettingsOptions } from '@/lib/query-options/tribe-settings';
import { useUpdateGeneralTribeSettings } from '@/lib/hooks/use-tribe-settings';
import { updateTribeSchema, type UpdateTribeInput } from '@/lib/validations/tribe';
import { TribeProfileSection } from './sections/tribe-profile-section';
import { FeaturesSection } from './sections/features-section';
import { DangerZoneSection } from './sections/danger-zone-section';
import { Separator } from '@/components/ui/separator';
import { GeneralSettingsSkeleton } from './loading';
import { GeneralSettingsError } from './error';

interface GeneralSettingsProps {
  tribeId: string;
}

export function GeneralSettings({ tribeId }: GeneralSettingsProps) {
  const {
    data: tribe,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(tribeGeneralSettingsOptions(tribeId));
  const { mutate: updateTribe, isPending } = useUpdateGeneralTribeSettings(tribeId);

  const form = useForm<UpdateTribeInput>({
    resolver: zodResolver(updateTribeSchema),
    defaultValues: {
      name: tribe?.name || '',
      description: tribe?.description || '',
      avatar: undefined,
      location: tribe?.location || undefined,
      category: tribe?.category || 'other',
      privacy: tribe?.privacy || 'private',
    },
    values: tribe
      ? {
          name: tribe.name,
          description: tribe.description || undefined,
          avatar: typeof tribe.avatar === 'string' && tribe.avatar.startsWith('http') ? undefined : tribe.avatar || undefined,
          location: tribe.location || undefined,
          category: tribe.category,
          privacy: tribe.privacy,
        }
      : undefined,
  });

  const onSubmit = (data: UpdateTribeInput) => {
    updateTribe(data, {
      onSuccess: () => {
        toast.success('Tribe settings updated successfully');
        form.reset(data);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to update tribe settings');
      },
    });
  };

  if (isLoading) {
    return <GeneralSettingsSkeleton />;
  }

  if (isError) {
    return (
      <GeneralSettingsError
        message={error?.message}
        onRetry={() => refetch()}
      />
    );
  }

  if (!tribe) {
    return (
      <GeneralSettingsError message="Tribe not found" />
    );
  }

  // Get avatar URL for display
  const avatarUrl = typeof tribe.avatar === 'string' && tribe.avatar.startsWith('http') 
    ? tribe.avatar 
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">General Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your tribe's basic information and settings
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <TribeProfileSection 
            control={form.control} 
            avatarUrl={avatarUrl}
            tribeName={tribe.name}
          />

          <Separator />

          <FeaturesSection control={form.control} />

          <Separator />

          <DangerZoneSection tribeId={tribeId} />

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

