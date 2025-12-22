// Local UI types for events page
interface Host {
  name: string
  avatar: string
}

interface VoteOption {
  id: number
  title: string
  votes: number
}

interface Event {
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

interface PastEvent {
  id: number
  title: string
  date: string
  time: string
  location: string
  attendees: number
  description: string
  host: Host
}

export type { Host, VoteOption, Event, PastEvent };