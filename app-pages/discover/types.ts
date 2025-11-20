export interface Tribe {
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

export interface Category {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

