import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RolesSettingsErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function RolesSettingsError({ message, onRetry }: RolesSettingsErrorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Role Permissions</h1>
        <p className="text-muted-foreground mt-2">
          Configure default permissions for each role in your tribe.
        </p>
      </div>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading role permissions</AlertTitle>
        <AlertDescription>
          {message || "Failed to load role permissions. Please try again."}
        </AlertDescription>
      </Alert>

      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
