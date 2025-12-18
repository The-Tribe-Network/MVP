// Local UI types for mock data
interface Activity {
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

interface Message {
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

interface Event {
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

interface Metric {
  label: string
  value: string
  change: string
}

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'post',
    user: { name: 'Sarah Chen', avatar: '/serene-asian-woman.png' },
    tribe: { name: 'Family Squad', avatar: '/family-logo.jpg' },
    action: 'shared a new post',
    timestamp: '5m ago',
    preview: 'Just finished the hiking trail! Amazing views 🏔️',
  },
  {
    id: '2',
    type: 'photo',
    user: { name: 'Mike Johnson', avatar: '/smiling-man.png' },
    tribe: { name: 'Work Crew', avatar: '/work-logo.jpg' },
    action: 'uploaded 5 new photos',
    timestamp: '12m ago',
  },
  {
    id: '3',
    type: 'event',
    user: { name: 'Emma Davis', avatar: '/blonde-woman.png' },
    tribe: { name: 'College Friends', avatar: '/generic-college-logo.png' },
    action: 'created an event',
    timestamp: '23m ago',
    preview: 'Game Night - Friday 7PM',
  },
  {
    id: '4',
    type: 'member',
    user: { name: 'Alex Kim', avatar: '/diverse-group.png' },
    tribe: { name: 'Family Squad', avatar: '/family-logo.jpg' },
    action: 'joined the tribe',
    timestamp: '1h ago',
  },
  {
    id: '5',
    type: 'post',
    user: { name: 'James Wilson', avatar: '/man.jpg' },
    tribe: { name: 'Work Crew', avatar: '/work-logo.jpg' },
    action: 'shared a new post',
    timestamp: '2h ago',
    preview: 'Looking forward to the team meeting tomorrow!',
  },
]

export const mockMessages: Message[] = [
  {
    id: '1',
    user: { name: 'Sarah Chen', avatar: '/serene-asian-woman.png' },
    tribe: { name: 'Family Squad' },
    message: 'Hey! Did you see the photos from last weekend?',
    timestamp: '3m ago',
    unread: true,
  },
  {
    id: '2',
    user: { name: 'Mike Johnson', avatar: '/smiling-man.png' },
    tribe: { name: 'Work Crew' },
    message: "Let's schedule that meeting for next week",
    timestamp: '15m ago',
    unread: true,
  },
  {
    id: '3',
    user: { name: 'Emma Davis', avatar: '/blonde-woman.png' },
    tribe: { name: 'College Friends' },
    message: 'Thanks for the birthday wishes everyone! 🎉',
    timestamp: '45m ago',
    unread: false,
  },
  {
    id: '4',
    user: { name: 'David Lee', avatar: '/man-asian.jpg' },
    tribe: { name: 'Family Squad' },
    message: 'Dinner at 7?',
    timestamp: '1h ago',
    unread: false,
  },
]

export const mockUpcomingEvents: Event[] = [
  {
    id: '1',
    title: 'Game Night',
    tribe: { name: 'College Friends', avatar: '/generic-college-logo.png' },
    date: 'Friday, Jan 17',
    time: '7:00 PM',
    attendees: 8,
  },
  {
    id: '2',
    title: 'Team Meeting',
    tribe: { name: 'Work Crew', avatar: '/work-logo.jpg' },
    date: 'Monday, Jan 20',
    time: '10:00 AM',
    attendees: 12,
  },
  {
    id: '3',
    title: 'Family Dinner',
    tribe: { name: 'Family Squad', avatar: '/family-logo.jpg' },
    date: 'Saturday, Jan 18',
    time: '6:30 PM',
    attendees: 6,
  },
  {
    id: '4',
    title: 'Birthday Celebration',
    tribe: { name: 'Family Squad', avatar: '/family-logo.jpg' },
    date: 'Sunday, Jan 19',
    time: '3:00 PM',
    attendees: 15,
  },
  {
    id: '5',
    title: 'Study Group',
    tribe: { name: 'College Friends', avatar: '/generic-college-logo.png' },
    date: 'Thursday, Jan 23',
    time: '4:00 PM',
    attendees: 5,
  },
]

export const mockMetrics: Metric[] = [
  { label: 'Active Tribes', value: '8', change: '+2 this month' },
  { label: 'Total Members', value: '127', change: '+15 this week' },
  { label: 'Unread Messages', value: '23', change: '5 urgent' },
  { label: 'Upcoming Events', value: '6', change: '3 this week' },
]

