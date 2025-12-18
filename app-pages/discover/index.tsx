'use client'

import { useState } from 'react'
import { categories, allTribes, featuredTribes } from './mock-data'

// Local UI type for discover page tribe cards
interface Tribe {
  id: string
  name: string
  description: string
  avatar: string
  memberCount: number
  location: string
  isPublic: boolean
  category: string
  trending?: boolean
  featured?: boolean
}
import { DiscoverHeader } from './discover-header'
import { SearchFilterSection } from './search-filter-section'
import { CategoriesSection } from './categories-section'
import { FeaturedTribesSection } from './featured-tribes-section'
import { AllTribesSection } from './all-tribes-section'

export default function DiscoverPageContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredTribes = allTribes.filter((tribe) => {
    const matchesSearch = tribe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tribe.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tribe.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="mx-auto space-y-6 pt-12">
        <DiscoverHeader />

        <SearchFilterSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <CategoriesSection
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {selectedCategory === 'all' && searchQuery === '' && (
          <FeaturedTribesSection featuredTribes={featuredTribes} />
        )}

        <AllTribesSection
          filteredTribes={filteredTribes}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
        />
      </div>
    </div>
  )
}

