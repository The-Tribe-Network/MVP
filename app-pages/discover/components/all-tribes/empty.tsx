import { Search, Users } from 'lucide-react';

interface AllTribesEmptyProps {
  hasFilters?: boolean;
}

export function AllTribesEmpty({ hasFilters = false }: AllTribesEmptyProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {hasFilters ? 'Search Results' : 'All Tribes'}
        </h2>
        <span className="text-muted-foreground">0 tribes</span>
      </div>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {hasFilters ? (
          <>
            <Search className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No tribes found matching your criteria</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </>
        ) : (
          <>
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No tribes available yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Be the first to create a tribe!
            </p>
          </>
        )}
      </div>
    </section>
  );
}

