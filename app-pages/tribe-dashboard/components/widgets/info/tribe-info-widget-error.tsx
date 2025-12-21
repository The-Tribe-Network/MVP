"use client"

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TribeInfoWidgetErrorProps {
  error?: Error | null;
  onRetry?: () => void;
}

export function TribeInfoWidgetError({
  error,
  onRetry
}: TribeInfoWidgetErrorProps) {
  const errorMessage = error?.message || "An error occurred while loading tribe data";

  return (
    <Card>
      <CardHeader className="text-center pb-3">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <CardTitle className="text-xl">Unable to Load Tribe</CardTitle>
        <CardDescription className="text-balance">
          {errorMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {onRetry && (
          <Button
            className="w-full"
            size="sm"
            onClick={onRetry}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

