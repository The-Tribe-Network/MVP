import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Local UI type for category navigation
interface Category {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface CategoriesSectionProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (value: string) => void
}

export function CategoriesSection({ categories, selectedCategory, onCategoryChange }: CategoriesSectionProps) {
  return (
    <Tabs value={selectedCategory} onValueChange={onCategoryChange} className="mb-8">
      <TabsList className="bg-background/50">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <TabsTrigger key={category.id} value={category.id} className="gap-2">
              <Icon className="w-4 h-4" />
              {category.label}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}

