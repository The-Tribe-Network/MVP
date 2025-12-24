import { apiFetch } from './client';
import type { TribeWithCreator, TribeWithMembers, TribeInvitationWithInviter } from '@/lib/database/types';
import type { UpdateTribeInput, TransferOwnershipInput } from '@/lib/validations/tribe';
import type { MemberWithPermissions } from '@/lib/services/permissions';
import type { FeaturedMediaWithUploader } from '@/lib/services/tribe';

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
 * Check if the current user is a member of a tribe
 * @param tribeId - The ID of the tribe to check membership for
 * @returns True if the current user is a member of the tribe, false otherwise
 */
export async function checkTribeMembership(tribeId: string): Promise<boolean> {
  return apiFetch<boolean>(`${API_BASE}/${tribeId}/members/membership`);
};

/**
 * Fetch a single tribe by ID with full details
 */
export async function fetchTribeById(id: string): Promise<TribeWithMembers> {
  return apiFetch<TribeWithMembers>(`${API_BASE}/${id}`);
}

/**
 * Fetch current user's member data with permissions for a tribe
 */
export async function fetchMemberWithPermissions(tribeId: string): Promise<MemberWithPermissions> {
  return apiFetch<MemberWithPermissions>(`${API_BASE}/${tribeId}/members/me`);
}

export interface AdminMember {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
}

/**
 * Fetch admin members of a tribe (for transfer ownership)
 */
export async function fetchTribeAdminMembers(tribeId: string): Promise<{ members: AdminMember[] }> {
  return apiFetch<{ members: AdminMember[] }>(`${API_BASE}/${tribeId}/members/admins`);
}

/**
 * Fetch pending invitations for the current user
 */
export async function fetchUserInvitations(): Promise<UserInvitation[]> {
  return apiFetch<UserInvitation[]>('/api/invitations');
}

/**
 * Fetch all invitations for a tribe (for settings page)
 */
export async function fetchTribeInvitations(
  tribeId: string
): Promise<TribeInvitationWithInviter[]> {
  return apiFetch<TribeInvitationWithInviter[]>(
    `${API_BASE}/${tribeId}/invitations`
  );
}

/**
 * Resend a tribe invitation
 */
export async function resendInvitation(
  tribeId: string,
  invitationId: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch(
    `${API_BASE}/${tribeId}/invitations/${invitationId}`,
    { method: 'PATCH' }
  );
}

/**
 * Cancel a pending tribe invitation
 */
export async function cancelInvitation(
  tribeId: string,
  invitationId: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch(
    `${API_BASE}/${tribeId}/invitations/${invitationId}`,
    { method: 'DELETE' }
  );
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

/**
 * Update tribe general settings
 */
export async function updateGeneralTribeSettings(
  tribeId: string,
  data: UpdateTribeInput
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `${API_BASE}/${tribeId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
}

/**
 * Delete a tribe
 */
export async function deleteTribe(
  tribeId: string
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `${API_BASE}/${tribeId}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: 'DELETE' }),
    }
  );
}

/**
 * Transfer tribe ownership
 */
export async function transferTribeOwnership(
  tribeId: string,
  data: TransferOwnershipInput
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `${API_BASE}/${tribeId}/transfer-ownership`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
}

// ============================================================================
// Featured Media Functions
// ============================================================================

/**
 * Fetch the featured media for a tribe
 */
export async function fetchFeaturedMedia(
  tribeId: string
): Promise<FeaturedMediaWithUploader | null> {
  return apiFetch<FeaturedMediaWithUploader | null>(
    `${API_BASE}/${tribeId}/featured-media`
  );
}

/**
 * Set the featured media for a tribe
 */
export async function updateFeaturedMedia(
  tribeId: string,
  mediaId: string
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `${API_BASE}/${tribeId}/featured-media`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId }),
    }
  );
}

/**
 * Clear the featured media for a tribe
 */
export async function clearFeaturedMedia(
  tribeId: string
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `${API_BASE}/${tribeId}/featured-media`,
    {
      method: 'DELETE',
    }
  );
}
