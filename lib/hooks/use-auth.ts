// lib/hooks/use-auth-session.ts
"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { authClient } from "@/lib/clients/auth-client"
import { queryKeys } from "@/lib/constants/query-keys"

/**
 * Use session data via TanStack Query for efficient caching.
 * This replaces direct usage of Better Auth's useSession.
 */
export function useAuthSession() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: async () => {
      const result = await authClient.getSession()
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    // Session should be considered fresh for a while
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Keep in cache longer than staleTime
    gcTime: 30 * 60 * 1000, // 30 minutes
    // Refetch on window focus for security
    refetchOnWindowFocus: true,
    // Don't retry on auth errors (401/403)
    retry: (failureCount, error) => {
      if (error.message.includes("Unauthorized")) return false
      return failureCount < 2
    },
  })
}

/**
 * Derived hook for just the user object
 */
export function useAuthUser() {
  const { data, ...rest } = useAuthSession()
  return {
    user: data?.user ?? null,
    session: data?.session ?? null,
    isAuthenticated: !!data?.user,
    ...rest,
  }
}