'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { tribeInvitationsOptions } from '@/lib/query-options/tribe-invitations';
import { resendInvitation, cancelInvitation } from '@/lib/api/tribes';
import { toast } from 'sonner';

/**
 * Fetch all invitations for a tribe
 */
export function useTribeInvitations(tribeId: string) {
  return useQuery(tribeInvitationsOptions(tribeId));
}

/**
 * Resend a tribe invitation
 */
export function useResendInvitation(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      resendInvitation(tribeId, invitationId),
    onSuccess: () => {
      toast.success('Invitation resent successfully');
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.invitations.tribe(tribeId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resend invitation');
    },
  });
}

/**
 * Cancel a pending tribe invitation
 */
export function useCancelInvitation(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      cancelInvitation(tribeId, invitationId),
    onSuccess: () => {
      toast.success('Invitation cancelled successfully');
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.invitations.tribe(tribeId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel invitation');
    },
  });
}
