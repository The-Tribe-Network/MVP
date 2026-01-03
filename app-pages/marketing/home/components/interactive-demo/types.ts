// Shared types for the interactive demo

export interface DemoUser {
  id: string
  name: string
  image: string
}

export interface DemoPost {
  id: string
  content: string
  author: DemoUser
  createdAt: Date
  likeCount: number
  commentCount: number
  isLiked: boolean
  image?: { url: string; width: number; height: number } | null
}

export interface DemoEvent {
  id: string
  title: string
  description: string
  startDate: Date
  location: string
  attendeeCount: number
}

export interface DemoMedia {
  id: string
  fileUrl: string
  altText: string
}

export interface DemoTribe {
  id: string
  name: string
  avatar: string
  banner: string
  description: string
  memberCount: number
  eventCount: number
  mediaCount: number
  createdAt: Date
  location?: string
  posts: DemoPost[]
  events: DemoEvent[]
  media: DemoMedia[]
}
