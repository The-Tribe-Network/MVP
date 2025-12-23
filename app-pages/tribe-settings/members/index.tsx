'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { memberWithPermissionsOptions } from '@/lib/query-options/tribe-settings';
import { useTribeMembers } from '@/lib/hooks/use-members';
import { createMemberColumns } from './columns';
import { MemberFilters } from './filters';
import { ChangeRoleDialog } from './dialogs/change-role-dialog';
import { RemoveMemberDialog } from './dialogs/remove-member-dialog';
import { ManagePermissionsDialog } from '../components/manage-permissions-dialog';
import type { MemberListItem } from '@/lib/database/types';
import type { MemberListQuery } from '@/lib/validations/members';

interface MembersSettingsProps {
  tribeId: string;
}

export function MembersSettings({ tribeId }: MembersSettingsProps) {
  // Fetch current user's permissions
  const { data: currentUserData } = useQuery(
    memberWithPermissionsOptions(tribeId)
  );

  // State for filters and pagination
  const [query, setQuery] = useState<MemberListQuery>({
    page: 1,
    pageSize: 50,
  });

  // Fetch members with current query
  const { data, isLoading, isError, error, refetch } = useTribeMembers(
    tribeId,
    query
  );

  // Dialog states
  const [selectedMember, setSelectedMember] = useState<MemberListItem | null>(
    null
  );
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);

  // Extract permissions from current user data
  const permissions = useMemo(() => {
    if (!currentUserData) {
      return {
        role: 'member' as const,
        canChangeMemberRoles: false,
        canRemoveMembers: false,
        canManagePermissions: false,
      };
    }

    const { member, permissions: perms } = currentUserData;

    return {
      role: member.role,
      canChangeMemberRoles:
        perms?.canChangeMemberRoles ??
        ['owner', 'admin'].includes(member.role),
      canRemoveMembers:
        perms?.canRemoveMembers ?? ['owner', 'admin'].includes(member.role),
      canManagePermissions:
        perms?.canManagePermissions ??
        ['owner', 'admin'].includes(member.role),
    };
  }, [currentUserData]);

  // Table columns with permission-aware actions
  const columns = useMemo(
    () =>
      createMemberColumns({
        currentUserRole: permissions.role,
        canChangeMemberRoles: permissions.canChangeMemberRoles,
        canRemoveMembers: permissions.canRemoveMembers,
        canManagePermissions: permissions.canManagePermissions,
        onChangeRole: (member) => {
          setSelectedMember(member);
          setChangeRoleOpen(true);
        },
        onRemove: (member) => {
          setSelectedMember(member);
          setRemoveOpen(true);
        },
        onManagePermissions: (member) => {
          setSelectedMember(member);
          setPermissionsOpen(true);
        },
      }),
    [permissions]
  );

  // Handle search
  const handleSearch = (value: string) => {
    setQuery((prev) => ({ ...prev, page: 1, search: value || undefined }));
  };

  // Handle filters
  const handleRoleFilter = (
    role?: 'owner' | 'admin' | 'moderator' | 'member'
  ) => {
    setQuery((prev) => ({ ...prev, page: 1, role }));
  };

  const handlePermissionStatusFilter = (status?: boolean) => {
    setQuery((prev) => ({ ...prev, page: 1, hasCustomPermissions: status }));
  };

  const handleClearFilters = () => {
    setQuery({ page: 1, pageSize: 50 });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  if (isLoading) {
    return <div className="p-6">Loading members...</div>;
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-destructive">
          Error loading members: {error?.message}
        </p>
        <button onClick={() => refetch()} className="mt-2 text-primary">
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6">No members found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Members</h1>
        <p className="text-muted-foreground mt-2">
          Manage tribe members, roles, and permissions
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data.members}
        searchPlaceholder="Search members..."
        onSearch={handleSearch}
        filterComponent={
          <MemberFilters
            role={query.role}
            hasCustomPermissions={query.hasCustomPermissions}
            onRoleChange={handleRoleFilter}
            onPermissionStatusChange={handlePermissionStatusFilter}
            onClearFilters={handleClearFilters}
          />
        }
        pagination={{
          pageIndex: data.page,
          pageSize: data.pageSize,
          total: data.total,
          onPageChange: handlePageChange,
        }}
      />

      {/* Dialogs */}
      <ChangeRoleDialog
        tribeId={tribeId}
        member={selectedMember}
        open={changeRoleOpen}
        onOpenChange={setChangeRoleOpen}
        currentUserRole={permissions.role}
      />

      <RemoveMemberDialog
        tribeId={tribeId}
        member={selectedMember}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />

      <ManagePermissionsDialog
        tribeId={tribeId}
        member={selectedMember}
        open={permissionsOpen}
        onOpenChange={setPermissionsOpen}
      />
    </div>
  );
}
