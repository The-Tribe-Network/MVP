import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturedTribesErrorProps {
  message: string;
  onRetry: () => void;
}

export function FeaturedTribesError({ message, onRetry }: FeaturedTribesErrorProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold">Featured Tribes</h2>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-destructive text-lg font-medium">Failed to load featured tribes</p>
        <p className="text-sm text-muted-foreground mt-1 mb-4">{message}</p>
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    </section>
  );
}

