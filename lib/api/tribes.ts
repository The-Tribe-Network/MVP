import { apiFetch } from './client';
import type { TribeWithCreator, TribeWithMembers } from '@/lib/database/types';

const API_BASE = '/api/tribes';

// ============================================================================
// Types
// ============================================================================

export interface CreateTribeParams {
  name: string;
  description?: string;
  avatar?: string;
  location?: string;
  privacy?: 'private' | 'public';
  category?: 'social' | 'gaming' | 'family' | 'work' | 'hobbies' | 'other';
  invitations?: Array<{ email: string; role: 'admin' | 'moderator' | 'member' }>;
}

export interface SendInvitationsParams {
  tribeId: string;
  invitations: Array<{ email: string; role: 'admin' | 'moderator' | 'member' }>;
}

export interface UserInvitation {
  id: string;
  tribeId: string;
  tribeName: string;
  tribeAvatar: string | null;
  invitedBy: string;
  inviterId: string;
  role: 'admin' | 'moderator' | 'member';
  createdAt: Date;
  expiresAt: Date | null;
}

export interface UserTribeListItem {
  id: string;
  name: string;
  avatar: string | null;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch all tribes the current user is a member of
 */
export async function fetchUserTribes(): Promise<UserTribeListItem[]> {
  return apiFetch<UserTribeListItem[]>(API_BASE);
}

/**
 * Fetch a single tribe by ID with full details
 */
export async function fetchTribeById(id: string): Promise<TribeWithMembers> {
  return apiFetch<TribeWithMembers>(`${API_BASE}/${id}`);
}

/**
 * Fetch pending invitations for the current user
 */
export async function fetchUserInvitations(): Promise<UserInvitation[]> {
  return apiFetch<UserInvitation[]>('/api/invitations');
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new tribe
 */
export async function createTribe(
  params: CreateTribeParams
): Promise<TribeWithCreator> {
  return apiFetch<TribeWithCreator>(
    API_BASE,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }
  );
}

/**
 * Send invitations to a tribe
 */
export async function sendTribeInvitations(
  params: SendInvitationsParams
): Promise<{ success: boolean; message: string; invitations: any[] }> {
  const { tribeId, invitations } = params;
  return apiFetch(
    `${API_BASE}/${tribeId}/invitations`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitations }),
    }
  );
}

/**
 * Accept a tribe invitation
 */
export async function acceptInvitation(
  invitationId: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch(
    `/api/invitations/${invitationId}/accept`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Reject a tribe invitation
 */
export async function rejectInvitation(
  invitationId: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch(
    `/api/invitations/${invitationId}/reject`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Leave a tribe
 */
export async function leaveTribe(
  tribeId: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch(
    `${API_BASE}/${tribeId}/members`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
