export interface InvitedMember {
  email: string
  role: 'admin' | 'moderator' | 'member'
}

export type PrivacyType = 'private' | 'public'

export interface TribeFormData {
  tribeName: string
  description: string
  avatar: string
  location: string
  privacy: PrivacyType
  inviteEmails: InvitedMember[]
}

