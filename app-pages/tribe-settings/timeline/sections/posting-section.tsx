'use client';

import { Control } from 'react-hook-form';
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
import type { UpdateTimelineSettingsInput } from '@/lib/validations/tribe-settings';

interface PostingSectionProps {
  control: Control<UpdateTimelineSettingsInput>;
}

export function PostingSection({ control }: PostingSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Posting</h3>
        <p className="text-sm text-muted-foreground">
          Control who can create posts and comments
        </p>
      </div>

      <FormField
        control={control}
        name="postingPermissionLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Who can create posts</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select permission level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="all_members">All members</SelectItem>
                <SelectItem value="moderators">
                  Moderators and above
                </SelectItem>
                <SelectItem value="admins">
                  Admins and above
                </SelectItem>
                <SelectItem value="owner_only">Owner only</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Set the minimum role required to create posts in the tribe
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="commentingPermissionLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Who can comment</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select permission level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="all_members">All members</SelectItem>
                <SelectItem value="moderators">
                  Moderators and above
                </SelectItem>
                <SelectItem value="admins">
                  Admins and above
                </SelectItem>
                <SelectItem value="owner_only">Owner only (comments disabled for members)</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Set who can comment on posts in the tribe
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="allowPostEditing"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Allow post editing</FormLabel>
              <FormDescription>
                Allow members to edit their own posts
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="allowPostDeletion"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Allow post deletion</FormLabel>
              <FormDescription>
                Allow members to delete their own posts
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
