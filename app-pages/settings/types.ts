export interface NotificationSettings {
  posts: boolean
  comments: boolean
  likes: boolean
  mentions: boolean
  events: boolean
  messages: boolean
  announcements: boolean
  emailDigest: boolean
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'tribe' | 'private'
  showOnlineStatus: boolean
  showLastSeen: boolean
  allowFriendRequests: boolean
  showEmail: boolean
}

