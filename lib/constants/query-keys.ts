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
} as const;



