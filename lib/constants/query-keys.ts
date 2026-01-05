/**
 * Query key factory for consistent query key management
 * This ensures type-safe and consistent query keys across the application
 */

export const queryKeys = {
  // Auth queries
  auth: {
    all: ["auth"] as const,
    session: () => ["auth", "session"] as const,
    user: () => ["auth", "user"] as const,
  },

  // Tribe queries
  tribes: {
    all: ["tribes"] as const,
    lists: () => ["tribes", "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["tribes", "list", filters] as const,
    details: () => ["tribes", "detail"] as const,
    detail: (id: string) => ["tribes", "detail", id] as const,
    generalSettings: (id: string) => ["tribes", "general-settings", id] as const,
    members: {
      all: (tribeId: string) => ["tribes", "members", tribeId] as const,
      list: (tribeId: string, filters?: Record<string, unknown>) =>
        ["tribes", "members", "list", tribeId, filters] as const,
      me: (tribeId: string) => ["tribes", "members", "me", tribeId] as const,
      admins: (tribeId: string) => ["tribes", "members", "admins", tribeId] as const,
    },
    invitations: {
      tribe: (tribeId: string) => ["tribes", "invitations", tribeId] as const,
    },
    roles: (tribeId: string) => ["tribes", "roles", tribeId] as const,
    settings: {
      all: (tribeId: string) => ["tribes", "settings", tribeId] as const,
      events: (tribeId: string) => ["tribes", "settings", "events", tribeId] as const,
      timeline: (tribeId: string) => ["tribes", "settings", "timeline", tribeId] as const,
      media: (tribeId: string) => ["tribes", "settings", "media", tribeId] as const,
    },
    // Legacy support - keep for backward compatibility
    tribe: (id: string | null | undefined) => ["tribe", id] as const,
  },

  // Permission queries
  permissions: {
    all: ["permissions"] as const,
    members: (tribeId: string, filters?: Record<string, unknown>) =>
      ["permissions", "members", tribeId, filters] as const,
    memberDetail: (tribeId: string, userId: string) =>
      ["permissions", "member-detail", tribeId, userId] as const,
  },

  // Post queries
  posts: {
    all: ["posts"] as const,
    tribes: () => ["posts", "tribes"] as const,
    tribe: (tribeId: string, filters?: Record<string, unknown>) =>
      ["posts", "tribes", tribeId, filters] as const,
    detail: (postId: string) => ["posts", "detail", postId] as const,
  },

  // Activity queries
  activities: {
    all: ["activities"] as const,
    tribes: () => ["activities", "tribes"] as const,
    tribe: (tribeId: string) => ["activities", "tribes", tribeId] as const,
    users: () => ["activities", "users"] as const,
    user: (userId: string) => ["activities", "users", userId] as const,
  },

  // Comment queries
  comments: {
    all: ["comments"] as const,
    post: (postId: string) => ["comments", "post", postId] as const,
    event: (eventId: string) => ["comments", "event", eventId] as const,
  },

  // Album queries
  albums: {
    all: ["albums"] as const,
    tribe: (tribeId: string) => ["albums", "tribe", tribeId] as const,
    detail: (tribeId: string, albumId: string) => ["albums", "detail", tribeId, albumId] as const,
  },

  // Media queries
  media: {
    all: ["media"] as const,
    tribes: () => ["media", "tribes"] as const,
    detail: (mediaId: string) => ["media", "detail", mediaId] as const,
    tribe: (tribeId: string, filters?: Record<string, unknown>) =>
      ["media", "tribes", tribeId, filters] as const,
    featured: (tribeId: string) => ["media", "featured", tribeId] as const,
    popular: (tribeId: string, limit?: number) =>
      ["media", "popular", tribeId, limit] as const,
  },

  // Popular albums queries (for highlights page)
  popularAlbums: {
    tribe: (tribeId: string, limit?: number) =>
      ["albums", "popular", tribeId, limit] as const,
  },

  // Preferences queries
  preferences: {
    all: ["preferences"] as const,
    tribeMember: (tribeId: string) => ["preferences", "tribe-member", tribeId] as const,
  },

  // Profile queries
  profile: {
    all: ["profile"] as const,
    current: () => ["profile", "current"] as const,
  },

  // User queries
  user: {
    all: ["user"] as const,
    tour: () => ["user", "tour"] as const,
  },

  // Security queries
  security: {
    all: ["security"] as const,
    sessions: () => ["security", "sessions"] as const,
  },

  // Event queries
  events: {
    all: ["events"] as const,
    tribes: () => ["events", "tribes"] as const,
    tribe: (tribeId: string, filters?: Record<string, unknown>) =>
      ["events", "tribes", tribeId, filters] as const,
    detail: (eventId: string) => ["events", "detail", eventId] as const,
    attendees: (eventId: string) => ["events", "attendees", eventId] as const,
  },

  // Poll queries
  polls: {
    all: ["polls"] as const,
    events: () => ["polls", "events"] as const,
    event: (eventId: string) => ["polls", "events", eventId] as const,
    detail: (pollId: string) => ["polls", "detail", pollId] as const,
  },

  // Discover queries
  discover: {
    all: ["discover"] as const,
    tribes: (filters?: Record<string, unknown>) =>
      ["discover", "tribes", filters] as const,
    featured: () => ["discover", "featured"] as const,
  },

  // Waitlist queries
  waitlist: {
    all: ["waitlist"] as const,
    survey: (email: string) => ["waitlist", "survey", email] as const,
  },
} as const;



