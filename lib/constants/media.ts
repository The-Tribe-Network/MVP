/**
 * Media and file upload constants
 */

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  PHOTO: 20 * 1024 * 1024, // 20MB for photos
  VIDEO: 150 * 1024 * 1024, // 150MB for videos (future use)
} as const

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'], // future use
  DOCUMENT: ['application/pdf', 'application/msword'], // future use
} as const

// Tribe plan limits (dummy values - to be determined based on actual plans)
export const TRIBE_PLAN_LIMITS = {
  FREE: {
    maxAlbums: 10,
    maxMediaPerAlbum: 100,
    maxLooseMedia: 50,
    totalMediaStorage: 1024 * 1024 * 1024, // 1GB
  },
  BASIC: {
    maxAlbums: 50,
    maxMediaPerAlbum: 500,
    maxLooseMedia: 200,
    totalMediaStorage: 10 * 1024 * 1024 * 1024, // 10GB
  },
  PREMIUM: {
    maxAlbums: 200,
    maxMediaPerAlbum: 2000,
    maxLooseMedia: 1000,
    totalMediaStorage: 50 * 1024 * 1024 * 1024, // 50GB
  },
  UNLIMITED: {
    maxAlbums: Infinity,
    maxMediaPerAlbum: Infinity,
    maxLooseMedia: Infinity,
    totalMediaStorage: Infinity,
  },
} as const

// Cloudinary upload folders
export const CLOUDINARY_FOLDERS = {
  TRIBE_MEDIA: 'tribes/media',
  TRIBE_POSTS: 'tribes/posts',
  TRIBE_AVATARS: 'tribes/avatars',
} as const

// Media privacy settings (for future use)
export const MEDIA_PRIVACY = {
  PUBLIC: 'public', // visible to all tribe members
  PRIVATE: 'private', // visible only to creator
  ADMIN_ONLY: 'admin_only', // visible only to admins/mods
} as const

export type TribePlan = keyof typeof TRIBE_PLAN_LIMITS
export type MediaPrivacy = (typeof MEDIA_PRIVACY)[keyof typeof MEDIA_PRIVACY]
