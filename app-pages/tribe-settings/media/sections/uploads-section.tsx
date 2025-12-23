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

const FILE_SIZE_OPTIONS = [
  { value: 5, label: '5 MB' },
  { value: 10, label: '10 MB' },
  { value: 25, label: '25 MB' },
  { value: 50, label: '50 MB' },
];

interface UploadsSectionProps {
  control: Control<UpdateMediaSettingsInput>;
}

export function UploadsSection({ control }: UploadsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploads</CardTitle>
        <CardDescription>
          Control who can upload media and file size limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Field 1: Who can upload media */}
        <FormField
          control={control}
          name="mediaUploadPermissionLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Who can upload media</FormLabel>
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
                Set the minimum role required to upload media
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Field 2: Max file size */}
        <FormField
          control={control}
          name="maxMediaFileSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max file size</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select file size limit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FILE_SIZE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Maximum file size allowed for uploads
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Field 3: Auto-add to gallery */}
        <FormField
          control={control}
          name="autoAddPostMediaToGallery"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Auto-add post media to gallery
                </FormLabel>
                <FormDescription>
                  Automatically add images from posts to the tribe gallery
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
