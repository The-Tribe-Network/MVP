import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchTribeById, fetchMemberWithPermissions, fetchTribeAdminMembers } from '@/lib/api/tribes';

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

