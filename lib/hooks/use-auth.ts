// lib/hooks/use-auth-session.ts
"use client"

import { useQuery } from "@tanstack/react-query"
import { authSessionOptions } from "@/lib/query-options/auth"

/**
 * Use session data via TanStack Query for efficient caching.
 * This replaces direct usage of Better Auth's useSession.
 */
export function useAuthSession() {
  return useQuery(authSessionOptions())
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