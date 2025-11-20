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
    // Legacy support - keep for backward compatibility
    tribe: (id: string | null | undefined) => ["tribe", id] as const,
  },

  // Post queries
  posts: {
    all: ["posts"] as const,
    tribes: () => ["posts", "tribes"] as const,
    tribe: (tribeId: string) => ["posts", "tribes", tribeId] as const,
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
  },
} as const;



