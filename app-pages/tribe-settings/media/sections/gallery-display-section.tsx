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
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import type { UpdateMediaSettingsInput } from '@/lib/validations/tribe-settings';

interface GalleryDisplaySectionProps {
  control: Control<UpdateMediaSettingsInput>;
}

export function GalleryDisplaySection({ control }: GalleryDisplaySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gallery Display</CardTitle>
        <CardDescription>
          Configure how the gallery looks and behaves
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Field 1: Enable photo likes (WORKS) */}
        <FormField
          control={control}
          name="enableMediaLikes"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable photo likes</FormLabel>
                <FormDescription>
                  Allow members to like photos in the gallery
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

        {/* Future field: Default view (Grid/Masonry) */}
        <div className="flex flex-row items-center justify-between rounded-lg border border-dashed p-4 opacity-50">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <FormLabel className="text-base">Default view</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Coming soon - this feature is currently in development
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormDescription>
              Grid or Masonry layout (coming soon)
            </FormDescription>
          </div>
          <Switch disabled checked={false} />
        </div>

        {/* Future field: Show uploader info */}
        <div className="flex flex-row items-center justify-between rounded-lg border border-dashed p-4 opacity-50">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <FormLabel className="text-base">Show uploader info</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Coming soon - this feature is currently in development
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormDescription>
              Display who uploaded each photo (coming soon)
            </FormDescription>
          </div>
          <Switch disabled checked={false} />
        </div>
      </CardContent>
    </Card>
  );
}
