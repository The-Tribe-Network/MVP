/**
 * Auth API functions
 * Note: Most auth is handled by Better-Auth client in lib/clients/auth-client.ts
 * This file is for any additional auth-related queries if needed
 */

import { authClient } from '@/lib/clients/auth-client';

// ============================================================================
// Types
// ============================================================================

export interface Session {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  } | null;
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
    emailVerified: boolean;
  } | null;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get the current session using Better-Auth client
 */
export async function getSession() {
  const result = await authClient.getSession();
  if (result.error) {
    throw new Error(result.error.message || 'Failed to get session');
  }
  return result.data;
}

/**
 * Get the authenticated user
 */
export async function getAuthUser() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Not authenticated');
  }
  
  return session.user;
}
