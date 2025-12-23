import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface InvitationsSettingsErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function InvitationsSettingsError({
  message = 'Failed to load invitations',
  onRetry,
}: InvitationsSettingsErrorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invitations</h1>
        <p className="text-muted-foreground mt-2">
          Manage tribe invitations
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
