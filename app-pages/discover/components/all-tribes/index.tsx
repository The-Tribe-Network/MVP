'use client';

import { useQuery } from '@tanstack/react-query';

import { discoverTribesOptions } from '@/lib/query-options';
import type { DiscoverFilters } from '@/app-pages/discover/lib/types';
import { TribeCard } from '../tribe-card';
import { AllTribesLoading } from './loading';
import { AllTribesEmpty } from './empty';
import { AllTribesError } from './error';

interface AllTribesSectionProps {
  filters: DiscoverFilters;
}

export default function AllTribesSection({ filters }: AllTribesSectionProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(discoverTribesOptions({
    search: filters.search,
    category: filters.category,
  }));

  const tribes = data?.tribes ?? [];
  const showSearchResults = filters.search || filters.category !== 'all';

  if (isLoading) return <AllTribesLoading />;
  if (isError) return <AllTribesError message={error.message} onRetry={() => refetch()} />;
  if (tribes.length === 0) return <AllTribesEmpty hasFilters={!!showSearchResults} />;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {showSearchResults ? 'Search Results' : 'All Tribes'}
        </h2>
        <span className="text-muted-foreground">
          {tribes.length} tribe{tribes.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tribes.map((tribe) => (
          <TribeCard key={tribe.id} tribe={tribe} />
        ))}
      </div>
    </section>
  );
}

