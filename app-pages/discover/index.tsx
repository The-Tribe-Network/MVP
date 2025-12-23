'use client';

import { useState } from 'react';

import { DiscoverHeader } from './components/discover-header';
import { SearchFilterSection } from './components/search-filter-section';
import { CategoriesSection } from './components/categories-section';
import FeaturedTribesSection from './components/featured-tribes';
import AllTribesSection from './components/all-tribes';
import { DISCOVER_CATEGORIES, DEFAULT_FILTERS } from './lib/utils';

export default function DiscoverPageContent() {
  const [searchQuery, setSearchQuery] = useState<string>(DEFAULT_FILTERS.search);
  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_FILTERS.category);

  const showFeatured = selectedCategory === 'all' && searchQuery === '';

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="mx-auto space-y-6 pt-12">
        <DiscoverHeader />

        <SearchFilterSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <CategoriesSection
          categories={DISCOVER_CATEGORIES}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {showFeatured && <FeaturedTribesSection />}

        <AllTribesSection
          filters={{
            search: searchQuery,
            category: selectedCategory,
          }}
        />
      </div>
    </div>
  );
}
