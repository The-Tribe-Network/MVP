export interface InvitedMember {
  email: string
  role: 'admin' | 'moderator' | 'member' // Matches tribeRole enum in lib/database/schemas/enums.ts
}

// Type matches privacyType enum in lib/database/schemas/enums.ts
export type PrivacyType = 'private' | 'public'

// Type matches tribeCategory enum in lib/database/schemas/enums.ts
export type TribeCategory = 'social' | 'gaming' | 'family' | 'work' | 'hobbies' | 'other'

export interface TribeFormData {
  tribeName: string
  description: string
  avatar: string
  location: string
  privacy: PrivacyType
  inviteEmails: InvitedMember[]
}

