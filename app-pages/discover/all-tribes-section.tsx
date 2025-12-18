import { TribeCard } from './tribe-card'

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

interface AllTribesSectionProps {
  filteredTribes: Tribe[]
  searchQuery: string
  selectedCategory: string
}

export function AllTribesSection({ filteredTribes, searchQuery, selectedCategory }: AllTribesSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {searchQuery || selectedCategory !== 'all' ? 'Search Results' : 'All Tribes'}
        </h2>
        <span className="text-muted-foreground">
          {filteredTribes.length} tribe{filteredTribes.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTribes.map((tribe) => (
          <TribeCard key={tribe.id} tribe={tribe} />
        ))}
      </div>
      {filteredTribes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No tribes found matching your criteria</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

