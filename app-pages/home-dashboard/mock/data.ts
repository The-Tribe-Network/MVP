import type { Activity, Message, Event, Metric, Announcement } from '../lib/types'

// Real avatar URLs from randomuser.me for demo screenshots
const avatars = {
  sarah: 'https://randomuser.me/api/portraits/women/44.jpg',
  mike: 'https://randomuser.me/api/portraits/men/32.jpg',
  emma: 'https://randomuser.me/api/portraits/women/68.jpg',
  alex: 'https://randomuser.me/api/portraits/men/75.jpg',
  james: 'https://randomuser.me/api/portraits/men/86.jpg',
  david: 'https://randomuser.me/api/portraits/men/52.jpg',
  lisa: 'https://randomuser.me/api/portraits/women/26.jpg',
  marcus: 'https://randomuser.me/api/portraits/men/22.jpg',
  olivia: 'https://randomuser.me/api/portraits/women/90.jpg',
  ryan: 'https://randomuser.me/api/portraits/men/41.jpg',
}

// Tribe avatars using Unsplash images
const tribeAvatars = {
  family: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=128&h=128&fit=crop&crop=faces',
  work: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=128&h=128&fit=crop&crop=faces',
  college: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=128&h=128&fit=crop&crop=faces',
  neighbors: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=128&h=128&fit=crop&crop=faces',
}

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'post',
    user: { name: 'Sarah Chen', avatar: avatars.sarah },
    tribe: { name: 'Family Squad', avatar: tribeAvatars.family },
    action: 'shared a new post',
    timestamp: '5m ago',
    preview: 'Just finished the hiking trail! Amazing views 🏔️',
  },
  {
    id: '2',
    type: 'photo',
    user: { name: 'Mike Johnson', avatar: avatars.mike },
    tribe: { name: 'Work Crew', avatar: tribeAvatars.work },
    action: 'uploaded 5 new photos',
    timestamp: '12m ago',
  },
  {
    id: '3',
    type: 'event',
    user: { name: 'Emma Davis', avatar: avatars.emma },
    tribe: { name: 'College Friends', avatar: tribeAvatars.college },
    action: 'created an event',
    timestamp: '23m ago',
    preview: 'Game Night - Friday 7PM',
  },
  {
    id: '4',
    type: 'member',
    user: { name: 'Alex Kim', avatar: avatars.alex },
    tribe: { name: 'Family Squad', avatar: tribeAvatars.family },
    action: 'joined the tribe',
    timestamp: '1h ago',
  },
  {
    id: '5',
    type: 'post',
    user: { name: 'James Wilson', avatar: avatars.james },
    tribe: { name: 'Work Crew', avatar: tribeAvatars.work },
    action: 'shared a new post',
    timestamp: '2h ago',
    preview: 'Looking forward to the team meeting tomorrow!',
  },
  {
    id: '6',
    type: 'photo',
    user: { name: 'Lisa Park', avatar: avatars.lisa },
    tribe: { name: 'College Friends', avatar: tribeAvatars.college },
    action: 'uploaded 3 new photos',
    timestamp: '3h ago',
    preview: 'Throwback to graduation day! 🎓',
  },
  {
    id: '7',
    type: 'event',
    user: { name: 'Marcus Brown', avatar: avatars.marcus },
    tribe: { name: 'Neighbors', avatar: tribeAvatars.neighbors },
    action: 'RSVPed to an event',
    timestamp: '4h ago',
    preview: 'Block Party - Saturday 2PM',
  },
  {
    id: '8',
    type: 'post',
    user: { name: 'Olivia Martinez', avatar: avatars.olivia },
    tribe: { name: 'Family Squad', avatar: tribeAvatars.family },
    action: 'commented on a post',
    timestamp: '5h ago',
    preview: 'This looks amazing! We should do this again.',
  },
  {
    id: '9',
    type: 'member',
    user: { name: 'Ryan Thompson', avatar: avatars.ryan },
    tribe: { name: 'Work Crew', avatar: tribeAvatars.work },
    action: 'was promoted to moderator',
    timestamp: '6h ago',
  },
  {
    id: '10',
    type: 'photo',
    user: { name: 'Sarah Chen', avatar: avatars.sarah },
    tribe: { name: 'College Friends', avatar: tribeAvatars.college },
    action: 'liked 4 photos',
    timestamp: '8h ago',
  },
]

export const mockMessages: Message[] = [
  {
    id: '1',
    user: { name: 'Sarah Chen', avatar: avatars.sarah },
    tribe: { name: 'Family Squad' },
    message: 'Hey! Did you see the photos from last weekend?',
    timestamp: '3m ago',
    unread: true,
  },
  {
    id: '2',
    user: { name: 'Mike Johnson', avatar: avatars.mike },
    tribe: { name: 'Work Crew' },
    message: "Let's schedule that meeting for next week",
    timestamp: '15m ago',
    unread: true,
  },
  {
    id: '3',
    user: { name: 'Emma Davis', avatar: avatars.emma },
    tribe: { name: 'College Friends' },
    message: 'Thanks for the birthday wishes everyone! 🎉',
    timestamp: '45m ago',
    unread: false,
  },
  {
    id: '4',
    user: { name: 'David Lee', avatar: avatars.david },
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
    tribe: { name: 'College Friends', avatar: tribeAvatars.college },
    date: 'Friday, Jan 17',
    time: '7:00 PM',
    attendees: 8,
  },
  {
    id: '2',
    title: 'Team Meeting',
    tribe: { name: 'Work Crew', avatar: tribeAvatars.work },
    date: 'Monday, Jan 20',
    time: '10:00 AM',
    attendees: 12,
  },
  {
    id: '3',
    title: 'Family Dinner',
    tribe: { name: 'Family Squad', avatar: tribeAvatars.family },
    date: 'Saturday, Jan 18',
    time: '6:30 PM',
    attendees: 6,
  },
  {
    id: '4',
    title: 'Birthday Celebration',
    tribe: { name: 'Family Squad', avatar: tribeAvatars.family },
    date: 'Sunday, Jan 19',
    time: '3:00 PM',
    attendees: 15,
  },
  {
    id: '5',
    title: 'Study Group',
    tribe: { name: 'College Friends', avatar: tribeAvatars.college },
    date: 'Thursday, Jan 23',
    time: '4:00 PM',
    attendees: 5,
  },
]

export const mockMetrics: Metric[] = [
  { label: 'Upcoming Events', value: '6', change: '3 this week' },
  { label: 'Unread Messages', value: '23', change: '5 urgent' },
  { label: 'Active Tribes', value: '8', change: '+2 this month' },
  { label: 'Total Members', value: '127', change: '+15 this week' },
]

export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    tribe: { name: 'Family Squad', avatar: tribeAvatars.family },
    title: 'Holiday Gathering Update',
    message: 'The venue has been changed to Grandma\'s house. Please bring a dish to share!',
    timestamp: '2h ago',
  },
  {
    id: '2',
    tribe: { name: 'Work Crew', avatar: tribeAvatars.work },
    title: 'Q1 Planning Session',
    message: 'Mandatory team meeting this Thursday at 2 PM. Please review the agenda beforehand.',
    timestamp: '5h ago',
  },
  {
    id: '3',
    tribe: { name: 'College Friends', avatar: tribeAvatars.college },
    title: 'Reunion Trip Confirmed!',
    message: 'We\'re going to Lake Tahoe in March! Check the event for booking details.',
    timestamp: '1d ago',
  },
]

