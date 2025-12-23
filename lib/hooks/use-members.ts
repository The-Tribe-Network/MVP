import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import {
  changeMemberRole,
  removeTribeMember,
  updateMemberPermissions,
  clearMemberPermissions,
} from '@/lib/api/members';
import { tribeMembersListOptions } from '@/lib/query-options/members';
import type { MemberListQuery, UpdateMemberPermissionsInput } from '@/lib/validations/members';

/**
 * Query hook to fetch tribe members with pagination and filters
 */
export function useTribeMembers(tribeId: string, query?: MemberListQuery) {
  return useQuery(tribeMembersListOptions(tribeId, query));
}

/**
 * Mutation hook to change a member's role
 */
export function useChangeMemberRole(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      newRole,
    }: {
      memberId: string;
      newRole: 'admin' | 'moderator' | 'member';
    }) => changeMemberRole(tribeId, memberId, newRole),
    onSuccess: () => {
      // Invalidate members list (all pages/filters)
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.members.all(tribeId),
      });
      // Invalidate tribe detail (member count may change)
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.detail(tribeId),
      });
    },
  });
}

/**
 * Mutation hook to remove a member from the tribe
 */
export function useRemoveMember(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => removeTribeMember(tribeId, memberId),
    onSuccess: () => {
      // Invalidate members list
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.members.all(tribeId),
      });
      // Invalidate tribe detail (member count decreases)
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.detail(tribeId),
      });
    },
  });
}

/**
 * Mutation hook to update member permissions
 */
export function useUpdateMemberPermissions(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      ...permissions
    }: { memberId: string } & Partial<Omit<UpdateMemberPermissionsInput, 'memberId'>>) =>
      updateMemberPermissions(tribeId, memberId, permissions),
    onSuccess: () => {
      // Invalidate members list (permission status may change)
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.members.all(tribeId),
      });
    },
  });
}

/**
 * Mutation hook to clear member permissions (revert to role defaults)
 */
export function useClearMemberPermissions(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => clearMemberPermissions(tribeId, memberId),
    onSuccess: () => {
      // Invalidate members list (permission status changes)
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.members.all(tribeId),
      });
    },
  });
}
