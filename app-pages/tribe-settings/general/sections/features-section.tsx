'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useFeatureToggles, useUpdateFeatureToggles } from '@/lib/hooks/use-tribe-settings';

interface FeaturesSectionProps {
  tribeId: string;
}

export function FeaturesSection({ tribeId }: FeaturesSectionProps) {
  const { data: features, isLoading } = useFeatureToggles(tribeId);
  const { mutate: updateFeatures, isPending } = useUpdateFeatureToggles(tribeId);

  const handleToggle = (feature: 'eventsEnabled' | 'albumsEnabled' | 'pollsEnabled', value: boolean) => {
    updateFeatures(
      { [feature]: value },
      {
        onSuccess: () => {
          const featureName = feature === 'eventsEnabled' ? 'Events' : feature === 'albumsEnabled' ? 'Media/Albums' : 'Polls';
          toast.success(`${featureName} ${value ? 'enabled' : 'disabled'}`);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update feature');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Features</CardTitle>
        <CardDescription>
          Enable or disable features for your tribe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="events-enabled">Enable Events</Label>
          <Switch
            id="events-enabled"
            checked={features?.eventsEnabled ?? true}
            onCheckedChange={(value) => handleToggle('eventsEnabled', value)}
            disabled={isLoading || isPending}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="albums-enabled">Enable Media/Albums</Label>
          <Switch
            id="albums-enabled"
            checked={features?.albumsEnabled ?? true}
            onCheckedChange={(value) => handleToggle('albumsEnabled', value)}
            disabled={isLoading || isPending}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="polls-enabled">Enable Polls</Label>
          <Switch
            id="polls-enabled"
            checked={features?.pollsEnabled ?? true}
            onCheckedChange={(value) => handleToggle('pollsEnabled', value)}
            disabled={isLoading || isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}

