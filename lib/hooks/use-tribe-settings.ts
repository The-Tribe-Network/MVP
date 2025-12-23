'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import {
  updateGeneralTribeSettings,
  deleteTribe,
  transferTribeOwnership,
} from '@/lib/api/tribes';
import {
  updateEventsSettings as updateEventsSettingsApi,
  updateTimelineSettings as updateTimelineSettingsApi,
  updateMediaSettings as updateMediaSettingsApi,
  updateFeatureToggles as updateFeatureTogglesApi,
} from '@/lib/api/tribe-settings';
import { eventsSettingsOptions, timelineSettingsOptions, mediaSettingsOptions, featureTogglesOptions } from '@/lib/query-options/tribe-settings';
import type { UpdateTribeInput, TransferOwnershipInput } from '@/lib/validations/tribe';
import type { UpdateEventsSettingsInput, UpdateTimelineSettingsInput, UpdateMediaSettingsInput } from '@/lib/validations/tribe-settings';
import type { UpdateFeatureTogglesInput } from '@/lib/api/tribe-settings';
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

/**
 * Fetch timeline settings for a tribe
 */
export function useTimelineSettings(tribeId: string) {
  return useQuery(timelineSettingsOptions(tribeId));
}

/**
 * Update timeline settings for a tribe
 */
export function useUpdateTimelineSettings(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTimelineSettingsInput) =>
      updateTimelineSettingsApi(tribeId, data),
    onSuccess: () => {
      // Invalidate timeline settings
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.settings.timeline(tribeId),
      });
    },
  });
}

/**
 * Fetch events settings for a tribe
 */
export function useEventsSettings(tribeId: string) {
  return useQuery(eventsSettingsOptions(tribeId));
}

/**
 * Update events settings for a tribe
 */
export function useUpdateEventsSettings(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEventsSettingsInput) =>
      updateEventsSettingsApi(tribeId, data),
    onSuccess: () => {
      // Invalidate events settings
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.settings.events(tribeId),
      });
      // Invalidate general settings (for feature toggle)
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.generalSettings(tribeId),
      });
      // Invalidate tribe detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.detail(tribeId),
      });
    },
  });
}

/**
 * Fetch media settings for a tribe
 */
export function useMediaSettings(tribeId: string) {
  return useQuery(mediaSettingsOptions(tribeId));
}

/**
 * Update media settings for a tribe
 */
export function useUpdateMediaSettings(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMediaSettingsInput) =>
      updateMediaSettingsApi(tribeId, data),
    onSuccess: () => {
      // Invalidate media settings
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.settings.media(tribeId),
      });
      // Invalidate general settings (for feature toggle)
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.generalSettings(tribeId),
      });
      // Invalidate tribe detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.detail(tribeId),
      });
    },
  });
}

/**
 * Fetch feature toggles for a tribe
 */
export function useFeatureToggles(tribeId: string) {
  return useQuery(featureTogglesOptions(tribeId));
}

/**
 * Update feature toggles for a tribe
 */
export function useUpdateFeatureToggles(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFeatureTogglesInput) =>
      updateFeatureTogglesApi(tribeId, data),
    onSuccess: () => {
      // Invalidate all settings queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.settings.all(tribeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.generalSettings(tribeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.detail(tribeId),
      });
    },
  });
}

