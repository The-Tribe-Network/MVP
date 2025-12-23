import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface MediaSettingsErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function MediaSettingsError({ message, onRetry }: MediaSettingsErrorProps) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Error Loading Settings</CardTitle>
        </div>
        <CardDescription>
          {message || 'Failed to load media settings. Please try again.'}
        </CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button onClick={onRetry} variant="outline">
            Retry
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
