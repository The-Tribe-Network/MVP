import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchFilterSectionProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function SearchFilterSection({ searchQuery, onSearchChange }: SearchFilterSectionProps) {
  return (
    <div className="flex gap-4 mb-8">
      <div className="relative flex-1 max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search tribes by name or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white/5 text-foreground"
        />
      </div>
      <Button variant="outline" className="gap-2">
        <Filter className="w-4 h-4" />
        Filters
      </Button>
    </div>
  )
}

