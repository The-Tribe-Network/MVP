import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TimelineSettingsErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function TimelineSettingsError({
  message = 'Failed to load timeline settings',
  onRetry,
}: TimelineSettingsErrorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timeline Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure how posts, comments, and engagement work in your tribe
        </p>
      </div>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>

      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
