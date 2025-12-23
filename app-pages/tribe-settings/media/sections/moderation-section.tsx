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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import type { UpdateMediaSettingsInput } from '@/lib/validations/tribe-settings';

interface ModerationSectionProps {
  control: Control<UpdateMediaSettingsInput>;
}

export function ModerationSection({ control }: ModerationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderation</CardTitle>
        <CardDescription>
          Control media approval and moderation settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Field 1: Require media approval */}
        <FormField
          control={control}
          name="requireMediaApproval"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Review uploads before visible
                </FormLabel>
                <FormDescription>
                  Require admin approval before media appears in the gallery
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

        {/* Info about deletion permissions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Who can delete any media:</span> This
            setting is controlled via the{' '}
            <span className="font-medium">Roles</span> tab under moderation
            permissions. Admins and moderators can be granted the{' '}
            <span className="font-mono text-sm">canDeleteAnyMedia</span>{' '}
            permission.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
