'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import {
  updateGeneralTribeSettings,
  deleteTribe,
  transferTribeOwnership,
} from '@/lib/api/tribes';
import type { UpdateTribeInput, TransferOwnershipInput } from '@/lib/validations/tribe';
/**
 * Update tribe general settings
 */
export function useUpdateGeneralTribeSettings(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTribeInput) =>
      updateGeneralTribeSettings(tribeId, data),
    onSuccess: () => {
      // Invalidate both general settings and detail queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.generalSettings(tribeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.detail(tribeId),
      });
      // Also invalidate legacy tribe key
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.tribe(tribeId),
      });
    },
  });
}

/**
 * Delete a tribe
 */
export function useDeleteTribe(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteTribe(tribeId),
    onSuccess: () => {
      // Invalidate all tribe-related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.all,
      });
    },
  });
}

/**
 * Transfer tribe ownership
 */
export function useTransferOwnership(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferOwnershipInput) =>
      transferTribeOwnership(tribeId, data),
    onSuccess: () => {
      // Invalidate tribe queries to refresh member data
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.generalSettings(tribeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.detail(tribeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.tribe(tribeId),
      });
    },
  });
}

