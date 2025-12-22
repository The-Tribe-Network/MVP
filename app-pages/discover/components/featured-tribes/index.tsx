'use client';

import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';

import { featuredTribesOptions } from '@/lib/query-options';
import { TribeCard } from '../tribe-card';
import { FeaturedTribesLoading } from './loading';
import { FeaturedTribesEmpty } from './empty';
import { FeaturedTribesError } from './error';

export default function FeaturedTribesSection() {
  const {
    data: featuredTribes,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(featuredTribesOptions());

  if (isLoading) return <FeaturedTribesLoading />;
  if (isError) return <FeaturedTribesError message={error.message} onRetry={() => refetch()} />;
  if (!featuredTribes || featuredTribes.length === 0) return <FeaturedTribesEmpty />;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold">Featured Tribes</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredTribes.map((tribe) => (
          <TribeCard key={tribe.id} tribe={tribe} featured />
        ))}
      </div>
    </section>
  );
}

