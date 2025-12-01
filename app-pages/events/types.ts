export interface Host {
  name: string
  avatar: string
}

export interface VoteOption {
  id: number
  title: string
  votes: number
}

export interface Event {
  id: number
  title: string
  date: string
  time: string
  location: string
  attendees: number
  description: string
  host: Host
  status: 'confirmed' | 'voting'
  hasVote?: boolean
  isAttending?: boolean
  voteDeadline?: string
  voteOptions?: VoteOption[]
}

export interface PastEvent {
  id: number
  title: string
  date: string
  time: string
  location: string
  attendees: number
  description: string
  host: Host
}

