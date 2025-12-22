import { buildQueryString } from './client';

// ============================================================================
// Types
// ============================================================================

export interface DiscoverTribe {
  id: string;
  name: string;
  description: string;
  avatar: string;
  memberCount: number;
  location: string;
  isPublic: boolean;
  category: string;
  trending?: boolean;
  featured?: boolean;
}

export interface DiscoverTribesParams {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface DiscoverTribesResponse {
  tribes: DiscoverTribe[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// Mock Data (temporary until API is ready)
// ============================================================================

const mockTribes: DiscoverTribe[] = [
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
];

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch tribes for discovery with optional filtering
 * TODO: Replace with real API call when backend is ready
 */
export async function fetchDiscoverTribes(
  params: DiscoverTribesParams = {}
): Promise<DiscoverTribesResponse> {
  const { search = '', category = 'all', limit = 20, offset = 0 } = params;

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Filter tribes based on search and category
  let filtered = mockTribes.filter((tribe) => {
    const matchesSearch =
      !search ||
      tribe.name.toLowerCase().includes(search.toLowerCase()) ||
      tribe.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || tribe.category === category;
    return matchesSearch && matchesCategory;
  });

  const total = filtered.length;
  const tribes = filtered.slice(offset, offset + limit);
  const hasMore = offset + limit < total;

  return { tribes, total, hasMore };
}

/**
 * Fetch featured tribes for the discover page
 * TODO: Replace with real API call when backend is ready
 */
export async function fetchFeaturedTribes(): Promise<DiscoverTribe[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return mockTribes.filter((tribe) => tribe.featured);
}

