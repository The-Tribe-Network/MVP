'use client';

import type { Control } from 'react-hook-form';
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
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { UpdateMediaSettingsInput } from '@/lib/validations/tribe-settings';

const PERMISSION_LABELS = {
  all_members: 'All Members',
  moderators: 'Moderators and Above',
  admins: 'Admins and Above',
  owner_only: 'Owner Only',
};

const ALBUM_PRIVACY_LABELS = {
  public: 'Public',
  private: 'Private',
  admin_only: 'Admin Only',
};

interface AlbumsSectionProps {
  control: Control<UpdateMediaSettingsInput>;
}

export function AlbumsSection({ control }: AlbumsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Albums</CardTitle>
        <CardDescription>
          Configure album creation and privacy settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Field 1: Who can create albums */}
        <FormField
          control={control}
          name="albumCreationPermissionLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Who can create albums</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select permission level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(PERMISSION_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Set the minimum role required to create albums
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Field 2: Default album privacy */}
        <FormField
          control={control}
          name="defaultAlbumPrivacy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default album privacy</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select default privacy" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(ALBUM_PRIVACY_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Default privacy level for newly created albums
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Field 3: Allow collaborative albums */}
        <FormField
          control={control}
          name="allowCollaborativeAlbums"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Allow collaborative albums
                </FormLabel>
                <FormDescription>
                  Let multiple members contribute to the same album
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

        {/* Field 4: Auto-create event albums */}
        <FormField
          control={control}
          name="autoCreateEventAlbums"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Auto-create event albums
                </FormLabel>
                <FormDescription>
                  Automatically create a photo album for each event
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
