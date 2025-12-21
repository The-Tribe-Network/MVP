import { apiFetch } from './client';
import type { PollWithDetails } from '@/lib/database/types';

const API_BASE = '/api/tribes';

// ============================================================================
// Types
// ============================================================================

export interface CreatePollInput {
  question: string;
  options: string[];
  allowMultiple: boolean;
  isAnonymous: boolean;
  endsAt?: string;
}

export interface CreatePollParams {
  tribeId: string;
  eventId: string;
  data: CreatePollInput;
}

export interface DeletePollParams {
  tribeId: string;
  eventId: string;
  pollId: string;
}

export interface VotePollParams {
  tribeId: string;
  eventId: string;
  pollId: string;
  optionIds: string[];
}

export interface RemoveVoteParams {
  tribeId: string;
  eventId: string;
  pollId: string;
  optionId?: string;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch polls for an event
 */
export async function fetchEventPolls(
  tribeId: string,
  eventId: string
): Promise<PollWithDetails[]> {
  return apiFetch<PollWithDetails[]>(
    `${API_BASE}/${tribeId}/events/${eventId}/polls`
  );
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new poll
 */
export async function createPoll(
  params: CreatePollParams
): Promise<PollWithDetails> {
  const { tribeId, eventId, data } = params;
  return apiFetch<PollWithDetails>(
    `${API_BASE}/${tribeId}/events/${eventId}/polls`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
}

/**
 * Delete a poll
 */
export async function deletePoll(
  params: DeletePollParams
): Promise<{ success: boolean }> {
  const { tribeId, eventId, pollId } = params;
  return apiFetch<{ success: boolean }>(
    `${API_BASE}/${tribeId}/events/${eventId}/polls/${pollId}`,
    { method: 'DELETE' }
  );
}

/**
 * Vote on a poll
 */
export async function votePoll(
  params: VotePollParams
): Promise<{ success: boolean }> {
  const { tribeId, eventId, pollId, optionIds } = params;
  return apiFetch<{ success: boolean }>(
    `${API_BASE}/${tribeId}/events/${eventId}/polls/${pollId}/votes`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionIds }),
    }
  );
}

/**
 * Remove vote from a poll
 */
export async function removeVote(
  params: RemoveVoteParams
): Promise<{ success: boolean }> {
  const { tribeId, eventId, pollId, optionId } = params;

  const url = new URL(
    `${API_BASE}/${tribeId}/events/${eventId}/polls/${pollId}/votes`,
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  );
  if (optionId) {
    url.searchParams.set('optionId', optionId);
  }

  return apiFetch<{ success: boolean }>(url.toString(), {
    method: 'DELETE',
  });
}
