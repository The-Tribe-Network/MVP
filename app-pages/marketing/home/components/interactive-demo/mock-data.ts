import type { DemoUser, DemoTribe } from './types'

// Sample users with placeholder avatars
const users: Record<string, DemoUser> = {
  // Fitness users
  coachMike: {
    id: 'u-fitness-1',
    name: 'Coach Mike',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  sarahFit: {
    id: 'u-fitness-2',
    name: 'Sarah Chen',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  },
  alexTrainer: {
    id: 'u-fitness-3',
    name: 'Alex Rivera',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  },
  // Book club users
  emmaReader: {
    id: 'u-book-1',
    name: 'Emma Watson',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  },
  jamesLit: {
    id: 'u-book-2',
    name: 'James Morrison',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
  lilyBooks: {
    id: 'u-book-3',
    name: 'Lily Park',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  },
  // Neighborhood users
  tomNeighbor: {
    id: 'u-hood-1',
    name: 'Tom Bradley',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  },
  mariaLocal: {
    id: 'u-hood-2',
    name: 'Maria Santos',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
  },
  davidBlock: {
    id: 'u-hood-3',
    name: 'David Kim',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  // Gaming users
  gamerAlex: {
    id: 'u-game-1',
    name: 'Alex "Shadow" Chen',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
  },
  streamQueen: {
    id: 'u-game-2',
    name: 'Jordan Lee',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  },
  proPlayer: {
    id: 'u-game-3',
    name: 'Marcus "Blaze" Johnson',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  },
}

// 4 General Use Case Tribes
export const mockTribes: DemoTribe[] = [
  // 1. Fitness Community
  {
    id: 'fitness-club',
    name: 'Peak Performance Fitness',
    avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=400&fit=crop',
    description: 'A community of fitness enthusiasts pushing each other to reach new heights. Weekly group workouts, challenges, and nutrition tips.',
    memberCount: 156,
    eventCount: 12,
    mediaCount: 234,
    createdAt: new Date('2024-06-15'),
    location: 'Downtown Gym',
    posts: [
      {
        id: 'f-post-1',
        content: 'Just crushed our Saturday morning HIIT class! 23 members showed up today. The energy was absolutely incredible!',
        author: users.coachMike,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likeCount: 34,
        commentCount: 12,
        isLiked: false,
        image: {
          url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop',
          width: 800,
          height: 600,
        },
      },
      {
        id: 'f-post-2',
        content: 'New personal record on deadlifts today! Thanks to everyone who cheered me on. This community is the best motivation!',
        author: users.sarahFit,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        likeCount: 28,
        commentCount: 8,
        isLiked: true,
      },
      {
        id: 'f-post-3',
        content: 'Reminder: Our nutrition workshop is tomorrow at 6 PM. Learn how to meal prep for the week in under 2 hours!',
        author: users.alexTrainer,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        likeCount: 19,
        commentCount: 5,
        isLiked: false,
      },
    ],
    events: [
      {
        id: 'f-event-1',
        title: 'Spring Fitness Challenge',
        description: '30-day challenge with prizes',
        startDate: new Date('2026-02-01T08:00:00'),
        location: 'Peak Performance Gym',
        attendeeCount: 67,
      },
      {
        id: 'f-event-2',
        title: 'Outdoor Bootcamp',
        description: 'Weather permitting',
        startDate: new Date('2026-01-15T07:00:00'),
        location: 'Central Park',
        attendeeCount: 34,
      },
      {
        id: 'f-event-3',
        title: 'Nutrition Workshop',
        description: 'Meal prep basics',
        startDate: new Date('2026-01-10T18:00:00'),
        location: 'Community Room',
        attendeeCount: 42,
      },
    ],
    media: [
      { id: 'f-m1', fileUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop', altText: 'Group workout' },
      { id: 'f-m2', fileUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', altText: 'Gym session' },
      { id: 'f-m3', fileUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=400&fit=crop', altText: 'Training together' },
      { id: 'f-m4', fileUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop', altText: 'Team spirit' },
    ],
  },

  // 2. Book Club
  {
    id: 'book-club',
    name: 'Readers Haven',
    avatar: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=400&fit=crop',
    description: 'Monthly book discussions and author meetups. We explore fiction, non-fiction, and everything in between. All readers welcome!',
    memberCount: 89,
    eventCount: 8,
    mediaCount: 67,
    createdAt: new Date('2024-02-01'),
    location: 'City Library',
    posts: [
      {
        id: 'b-post-1',
        content: 'Just finished "The Midnight Library" and I am SPEECHLESS. Cannot wait to discuss this at our next meeting!',
        author: users.emmaReader,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        likeCount: 22,
        commentCount: 15,
        isLiked: true,
        image: {
          url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop',
          width: 800,
          height: 600,
        },
      },
      {
        id: 'b-post-2',
        content: 'Vote is in! Our February pick is "Project Hail Mary" by Andy Weir. Get your copies ready!',
        author: users.jamesLit,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        likeCount: 31,
        commentCount: 9,
        isLiked: false,
      },
      {
        id: 'b-post-3',
        content: 'Thank you to everyone who came to our poetry night! The readings were beautiful and heartfelt.',
        author: users.lilyBooks,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        likeCount: 45,
        commentCount: 12,
        isLiked: false,
      },
    ],
    events: [
      {
        id: 'b-event-1',
        title: 'February Book Discussion',
        description: 'Project Hail Mary',
        startDate: new Date('2026-02-15T19:00:00'),
        location: 'City Library, Room B',
        attendeeCount: 28,
      },
      {
        id: 'b-event-2',
        title: 'Author Meet & Greet',
        description: 'Local author signing',
        startDate: new Date('2026-01-25T14:00:00'),
        location: 'Downtown Bookstore',
        attendeeCount: 45,
      },
    ],
    media: [
      { id: 'b-m1', fileUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=400&fit=crop', altText: 'Book club meeting' },
      { id: 'b-m2', fileUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop', altText: 'Reading session' },
      { id: 'b-m3', fileUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=400&fit=crop', altText: 'Library shelves' },
      { id: 'b-m4', fileUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop', altText: 'Book stack' },
    ],
  },

  // 3. Neighborhood Community
  {
    id: 'neighborhood',
    name: 'Maple Street Community',
    avatar: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&h=400&fit=crop',
    description: 'Connecting neighbors, sharing local events, and building a stronger community together. From block parties to safety updates.',
    memberCount: 234,
    eventCount: 24,
    mediaCount: 456,
    createdAt: new Date('2023-09-10'),
    location: 'Maple Street Area',
    posts: [
      {
        id: 'n-post-1',
        content: 'Just a reminder to bring in your trash bins today! Also, the street cleaning schedule has been updated for next week.',
        author: users.tomNeighbor,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likeCount: 15,
        commentCount: 3,
        isLiked: false,
      },
      {
        id: 'n-post-2',
        content: 'Our community garden is looking amazing this season! Thank you to all volunteers who helped plant the new flower beds.',
        author: users.mariaLocal,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        likeCount: 52,
        commentCount: 18,
        isLiked: true,
        image: {
          url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
          width: 800,
          height: 600,
        },
      },
      {
        id: 'n-post-3',
        content: 'Found a set of keys near the park entrance. DM me if they are yours!',
        author: users.davidBlock,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        likeCount: 8,
        commentCount: 6,
        isLiked: false,
      },
    ],
    events: [
      {
        id: 'n-event-1',
        title: 'Spring Block Party',
        description: 'Annual neighborhood celebration',
        startDate: new Date('2026-03-20T12:00:00'),
        location: 'Maple Street Park',
        attendeeCount: 156,
      },
      {
        id: 'n-event-2',
        title: 'Community Meeting',
        description: 'Monthly updates and discussion',
        startDate: new Date('2026-01-12T19:00:00'),
        location: 'Community Center',
        attendeeCount: 67,
      },
      {
        id: 'n-event-3',
        title: 'Neighborhood Watch Patrol',
        description: 'Evening safety patrol',
        startDate: new Date('2026-01-08T20:00:00'),
        location: 'Starting at Oak & Maple',
        attendeeCount: 23,
      },
    ],
    media: [
      { id: 'n-m1', fileUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', altText: 'Community garden' },
      { id: 'n-m2', fileUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop', altText: 'Neighborhood houses' },
      { id: 'n-m3', fileUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=400&fit=crop', altText: 'Block party' },
      { id: 'n-m4', fileUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', altText: 'Local park' },
    ],
  },

  // 4. Gaming Community
  {
    id: 'gaming',
    name: 'Pixel Warriors',
    avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop',
    description: 'Casual and competitive gaming community. Weekly game nights, tournaments, and chill sessions. All platforms welcome!',
    memberCount: 312,
    eventCount: 18,
    mediaCount: 189,
    createdAt: new Date('2024-01-20'),
    posts: [
      {
        id: 'g-post-1',
        content: 'GG to everyone in tonight\'s tournament! Final standings are posted. Congrats to our top 3 players!',
        author: users.gamerAlex,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likeCount: 67,
        commentCount: 24,
        isLiked: true,
        image: {
          url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop',
          width: 800,
          height: 600,
        },
      },
      {
        id: 'g-post-2',
        content: 'Looking for 2 more players for our ranked team. Must be Gold+ and available on weekends. DM me!',
        author: users.streamQueen,
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
        likeCount: 23,
        commentCount: 31,
        isLiked: false,
      },
      {
        id: 'g-post-3',
        content: 'New game night poll is up! Vote for what we play this Friday - choices are Smash Bros, Mario Kart, or Jackbox!',
        author: users.proPlayer,
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        likeCount: 45,
        commentCount: 28,
        isLiked: false,
      },
    ],
    events: [
      {
        id: 'g-event-1',
        title: 'Friday Game Night',
        description: 'Weekly casual session',
        startDate: new Date('2026-01-10T20:00:00'),
        location: 'Discord Voice Chat',
        attendeeCount: 89,
      },
      {
        id: 'g-event-2',
        title: 'Monthly Tournament',
        description: 'Competitive bracket play',
        startDate: new Date('2026-01-25T18:00:00'),
        location: 'Online',
        attendeeCount: 128,
      },
      {
        id: 'g-event-3',
        title: 'LAN Party Meetup',
        description: 'In-person gaming session',
        startDate: new Date('2026-02-08T14:00:00'),
        location: 'Community Gaming Center',
        attendeeCount: 42,
      },
    ],
    media: [
      { id: 'g-m1', fileUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop', altText: 'Gaming setup' },
      { id: 'g-m2', fileUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop', altText: 'Retro games' },
      { id: 'g-m3', fileUrl: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=400&h=400&fit=crop', altText: 'Controller' },
      { id: 'g-m4', fileUrl: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=400&fit=crop', altText: 'Gaming night' },
    ],
  },
]

// Default tribe ID
export const DEFAULT_TRIBE_ID = 'fitness-club'
