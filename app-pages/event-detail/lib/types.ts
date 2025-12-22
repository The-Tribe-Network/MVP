/**
 * Local UI types for Event Detail components
 *
 * These types are used for mock data and component props.
 * When connecting to the API, transform database types to these UI types.
 */

export interface EventComment {
  id: string
  author: {
    name: string
    avatar?: string | null
  }
  content: string
  createdAt: Date
  likeCount: number
  isLiked: boolean
}

export interface MediaAttachment {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  uploadedBy: {
    name: string
    avatar?: string | null
  }
  uploadedAt: Date
}

export interface LinkAttachment {
  id: string
  url: string
  title?: string
  description?: string
  thumbnail?: string
  addedBy: {
    name: string
  }
  addedAt: Date
}

export interface PollOption {
  id: string
  text: string
  votes: number
  voters: { id: string; name: string; image?: string | null }[]
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
  createdBy: {
    id: string
    name: string
    image?: string | null
  }
  createdAt: Date
  endsAt?: Date | null
  allowMultiple: boolean
  isAnonymous: boolean
  userVotes: string[] // option IDs the current user voted for
}
