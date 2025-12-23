import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchTribeById, fetchMemberWithPermissions, fetchTribeAdminMembers } from '@/lib/api/tribes';
import { fetchEventsSettings, fetchTimelineSettings, fetchFeatureToggles, fetchMediaSettings } from '@/lib/api/tribe-settings';

/**
 * Query options for fetching tribe general settings data
 * This uses the same data as tribe detail but with a specific query key for settings
 */
export function tribeGeneralSettingsOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.tribes.generalSettings(tribeId),
    queryFn: () => fetchTribeById(tribeId),
  });
}

/**
 * Query options for fetching current user's member data with permissions
 */
export function memberWithPermissionsOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.tribes.members.me(tribeId),
    queryFn: () => fetchMemberWithPermissions(tribeId),
  });
}

/**
 * Query options for fetching tribe admin members (for transfer ownership)
 */
export function tribeAdminMembersOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.tribes.members.admins(tribeId),
    queryFn: () => fetchTribeAdminMembers(tribeId),
  });
}

/**
 * Query options for fetching timeline settings
 */
export function timelineSettingsOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.tribes.settings.timeline(tribeId),
    queryFn: () => fetchTimelineSettings(tribeId),
    staleTime: 1000 * 60 * 5, // 5 minutes (settings don't change often)
  });
}

/**
 * Query options for fetching events settings
 */
export function eventsSettingsOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.tribes.settings.events(tribeId),
    queryFn: () => fetchEventsSettings(tribeId),
    staleTime: 1000 * 60 * 5, // 5 minutes (settings don't change often)
  });
}

/**
 * Query options for fetching media settings
 */
export function mediaSettingsOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.tribes.settings.media(tribeId),
    queryFn: () => fetchMediaSettings(tribeId),
    staleTime: 1000 * 60 * 5, // 5 minutes (settings don't change often)
  });
}

/**
 * Query options for fetching feature toggles
 */
export function featureTogglesOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.tribes.settings.all(tribeId),
    queryFn: () => fetchFeatureToggles(tribeId),
    staleTime: 1000 * 60 * 5, // 5 minutes (settings don't change often)
  });
}

