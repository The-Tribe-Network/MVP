'use client'

import { useState } from 'react'
import { Search, Filter, MapPin, Users, Lock, Globe, TrendingUp, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'gaming', label: 'Gaming', icon: TrendingUp },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'work', label: 'Work', icon: Users },
    { id: 'hobbies', label: 'Hobbies', icon: Sparkles },
  ]

  const featuredTribes: Tribe[] = [
    {
      id: '1',
      name: 'Tech Enthusiasts',
      description: 'A community for technology lovers to discuss the latest trends, innovations, and projects.',
      avatar: '/vibrant-tech-community.png',
      memberCount: 1247,
      location: 'Global',
      isPublic: true,
      category: 'social',
      featured: true,
      trending: true,
    },
    {
      id: '2',
      name: 'Adventure Seekers',
      description: 'Join us for outdoor adventures, hiking trips, and exploring the great outdoors together.',
      avatar: '/adventure-hiking.jpg',
      memberCount: 892,
      location: 'California, USA',
      isPublic: true,
      category: 'hobbies',
      featured: true,
    },
    {
      id: '3',
      name: 'Book Club Central',
      description: 'Monthly book discussions, reading recommendations, and literary debates with fellow book lovers.',
      avatar: '/book-club.png',
      memberCount: 567,
      location: 'New York, USA',
      isPublic: true,
      category: 'hobbies',
      featured: true,
    },
  ]

  const allTribes: Tribe[] = [
    ...featuredTribes,
    {
      id: '4',
      name: 'Fitness Warriors',
      description: 'Share workout routines, nutrition tips, and motivate each other to reach fitness goals.',
      avatar: '/fitness-gym.jpg',
      memberCount: 2156,
      location: 'Los Angeles, USA',
      isPublic: true,
      category: 'hobbies',
      trending: true,
    },
    {
      id: '5',
      name: 'Game Night Squad',
      description: 'Weekly gaming sessions, tournaments, and discussions about the latest games.',
      avatar: '/gaming-controller.png',
      memberCount: 1834,
      location: 'Online',
      isPublic: true,
      category: 'gaming',
    },
    {
      id: '6',
      name: 'Foodie Paradise',
      description: 'Share recipes, restaurant reviews, and culinary adventures from around the world.',
      avatar: '/food-cooking.png',
      memberCount: 3421,
      location: 'Global',
      isPublic: true,
      category: 'hobbies',
      trending: true,
    },
    {
      id: '7',
      name: 'Creative Minds',
      description: 'Artists, designers, and creators sharing work, feedback, and creative inspiration.',
      avatar: '/art-creative.jpg',
      memberCount: 945,
      location: 'San Francisco, USA',
      isPublic: true,
      category: 'hobbies',
    },
    {
      id: '8',
      name: 'Music Makers',
      description: 'Musicians, producers, and music lovers collaborating and sharing their passion for music.',
      avatar: '/music-notes.jpg',
      memberCount: 1123,
      location: 'Nashville, USA',
      isPublic: true,
      category: 'hobbies',
    },
    {
      id: '9',
      name: 'Parent Connect',
      description: 'Parents supporting parents with advice, stories, and community.',
      avatar: '/family-parents.jpg',
      memberCount: 2687,
      location: 'Global',
      isPublic: false,
      category: 'family',
    },
    {
      id: '10',
      name: 'Startup Founders',
      description: 'Entrepreneurs building startups, sharing insights, and networking.',
      avatar: '/startup-business.png',
      memberCount: 1567,
      location: 'Silicon Valley, USA',
      isPublic: false,
      category: 'work',
      trending: true,
    },
    {
      id: '11',
      name: 'Photography Club',
      description: 'Photographers of all levels sharing tips, critiques, and stunning photos.',
      avatar: '/camera-photography.png',
      memberCount: 1892,
      location: 'Global',
      isPublic: true,
      category: 'hobbies',
    },
    {
      id: '12',
      name: 'Remote Workers Hub',
      description: 'Digital nomads and remote workers sharing tips, coworking spaces, and opportunities.',
      avatar: '/remote-work-laptop.png',
      memberCount: 3145,
      location: 'Global',
      isPublic: true,
      category: 'work',
    },
  ]

  const filteredTribes = allTribes.filter((tribe) => {
    const matchesSearch = tribe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tribe.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tribe.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const TribeCard = ({ tribe, featured = false }: { tribe: Tribe; featured?: boolean }) => (
    <Card className={`group hover:shadow-xl transition-all duration-300 ${featured ? 'border-primary/50' : ''}`}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <Avatar className={featured ? 'w-16 h-16' : 'w-12 h-12'}>
            <AvatarImage src={tribe.avatar || "/placeholder.svg"} />
            <AvatarFallback>{tribe.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            {tribe.trending && (
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                Trending
              </Badge>
            )}
            {tribe.featured && (
              <Badge variant="default" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Featured
              </Badge>
            )}
          </div>
        </div>
        <div>
          <CardTitle className="text-lg mb-1">{tribe.name}</CardTitle>
          <CardDescription className={featured ? 'text-sm' : 'text-xs line-clamp-2'}>
            {tribe.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{tribe.memberCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{tribe.location}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tribe.isPublic ? (
            <Badge variant="outline" className="gap-1">
              <Globe className="w-3 h-3" />
              Public
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Lock className="w-3 h-3" />
              Private
            </Badge>
          )}
          <Badge variant="secondary">{tribe.category}</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={tribe.isPublic ? 'default' : 'outline'}>
          {tribe.isPublic ? 'Join Tribe' : 'Request to Join'}
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="flex-1 overflow-auto p-6 bg-background">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Tribes</h1>
          <p className="text-muted-foreground">Find and join communities that match your interests</p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search tribes by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 text-foreground"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="bg-background/50">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="gap-2">
                <category.icon className="w-4 h-4" />
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Featured Tribes */}
        {selectedCategory === 'all' && searchQuery === '' && (
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
        )}

        {/* All Tribes */}
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
      </div>
    </div>
  )
}
