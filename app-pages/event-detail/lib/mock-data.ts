import type { EventWithDetails } from '@/lib/database/types'
import type { EventComment, MediaAttachment, LinkAttachment, Poll } from './types'

/**
 * Mock Event Data
 * TODO: Remove when connecting to real API
 */
export const mockEvent: EventWithDetails = {
  id: '1',
  title: 'Summer BBQ Party',
  description:
    "Join us for a fun summer BBQ with great food, games, and amazing company! We'll have burgers, hot dogs, vegetarian options, and plenty of drinks. Bring your friends and family for a day of celebration.",
  location: 'Central Park, New York, NY',
  coverImageUrl: null,
  startDate: new Date('2024-07-15T18:00:00'),
  endDate: new Date('2024-07-15T22:00:00'),
  status: 'upcoming' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  tribeId: 'tribe-1',
  createdBy: 'user-1',
  creator: {
    id: 'user-1',
    name: 'Sarah Chen',
    displayName: null,
    image: null,
  },
  tribe: {
    id: 'tribe-1',
    name: 'Summer Fun Tribe',
    location: 'New York, NY',
    createdAt: new Date(),
    updatedAt: new Date(),
    description: 'A tribe for summer fun activities',
    avatar: null,
    featuredMediaId: null,
    privacy: 'public' as const,
    category: 'social' as const,
    isFeatured: false,
    isTrending: false,
    createdBy: 'user-1',
  },
  attendees: [
    {
      id: 'att-1',
      eventId: '1',
      userId: 'user-2',
      status: 'going',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'user-2',
        name: 'John Doe',
        displayName: null,
        username: null,
        image: null,
      },
    },
  ],
  attendeeCount: 24,
  isUserAttending: true,
}

/**
 * Mock Comments Data
 * TODO: Remove when connecting to real API
 */
export const mockComments: EventComment[] = [
  {
    id: '1',
    author: {
      name: 'John Doe',
      avatar: null,
    },
    content: "Can't wait for this event! Is there parking available nearby?",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    likeCount: 3,
    isLiked: false,
  },
  {
    id: '2',
    author: {
      name: 'Sarah Chen',
      avatar: null,
    },
    content: "Yes! There's a parking lot right next to the park. See you all there!",
    createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    likeCount: 5,
    isLiked: true,
  },
]

/**
 * Mock Media Attachments
 * TODO: Remove when connecting to real API
 */
export const mockMedia: MediaAttachment[] = [
  {
    id: '1',
    type: 'image',
    url: '/placeholder.svg',
    uploadedBy: { name: 'Sarah Chen' },
    uploadedAt: new Date(),
  },
  {
    id: '2',
    type: 'image',
    url: '/placeholder.svg',
    uploadedBy: { name: 'John Doe' },
    uploadedAt: new Date(),
  },
]

/**
 * Mock Link Attachments
 * TODO: Remove when connecting to real API
 */
export const mockLinks: LinkAttachment[] = [
  {
    id: '1',
    url: 'https://example.com/event-details',
    title: 'Event Parking Information',
    description: 'Details about parking and directions to the venue',
    addedBy: { name: 'Sarah Chen' },
    addedAt: new Date(),
  },
]

/**
 * Mock Polls Data
 * TODO: Remove when connecting to real API
 */
export const mockPolls: Poll[] = [
  {
    id: 'poll-1',
    question: 'What food should we order?',
    options: [
      {
        id: 'opt-1',
        text: 'Pizza 🍕',
        votes: 12,
        voters: [
          { id: 'u1', name: 'Alex' },
          { id: 'u2', name: 'Sam' },
          { id: 'u3', name: 'Jordan' },
        ],
      },
      {
        id: 'opt-2',
        text: 'Tacos 🌮',
        votes: 8,
        voters: [
          { id: 'u4', name: 'Taylor' },
          { id: 'u5', name: 'Morgan' },
        ],
      },
      {
        id: 'opt-3',
        text: 'Burgers 🍔',
        votes: 5,
        voters: [{ id: 'u6', name: 'Casey' }],
      },
    ],
    createdBy: { id: 'user-1', name: 'Sarah Chen' },
    createdAt: new Date('2024-07-10'),
    endsAt: new Date('2024-07-14'),
    allowMultiple: false,
    isAnonymous: false,
    userVotes: ['opt-1'],
  },
  {
    id: 'poll-2',
    question: 'Best time to start the event?',
    options: [
      {
        id: 'opt-4',
        text: '5:00 PM',
        votes: 4,
        voters: [],
      },
      {
        id: 'opt-5',
        text: '6:00 PM',
        votes: 15,
        voters: [],
      },
      {
        id: 'opt-6',
        text: '7:00 PM',
        votes: 6,
        voters: [],
      },
    ],
    createdBy: { id: 'user-1', name: 'Sarah Chen' },
    createdAt: new Date('2024-07-08'),
    endsAt: null,
    allowMultiple: false,
    isAnonymous: true,
    userVotes: [],
  },
]
