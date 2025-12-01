import { Sparkles } from 'lucide-react'
import { Tribe } from './types'
import { TribeCard } from './tribe-card'

interface FeaturedTribesSectionProps {
  featuredTribes: Tribe[]
}

export function FeaturedTribesSection({ featuredTribes }: FeaturedTribesSectionProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold">Featured Tribes</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredTribes.map((tribe) => (
          <TribeCard key={tribe.id} tribe={tribe} featured />
        ))}
      </div>
    </div>
  )
}

