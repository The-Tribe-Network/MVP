import { Sparkles } from 'lucide-react';

export function FeaturedTribesEmpty() {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold">Featured Tribes</h2>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">No featured tribes yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Check back soon for highlighted communities
        </p>
      </div>
    </section>
  );
}

