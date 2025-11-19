export interface Activity {
  id: string
  type: 'post' | 'photo' | 'event' | 'member'
  user: {
    name: string
    avatar: string
  }
  tribe: {
    name: string
    avatar: string
  }
  action: string
  timestamp: string
  preview?: string
}

export interface Message {
  id: string
  user: {
    name: string
    avatar: string
  }
  tribe: {
    name: string
  }
  message: string
  timestamp: string
  unread: boolean
}

export interface Event {
  id: string
  title: string
  tribe: {
    name: string
    avatar: string
  }
  date: string
  time: string
  attendees: number
}

export interface Metric {
  label: string
  value: string
  change: string
}

