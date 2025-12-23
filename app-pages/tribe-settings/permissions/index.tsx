'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { membersWithPermissionsOptions } from '@/lib/query-options/permissions';
import { memberWithPermissionsOptions } from '@/lib/query-options/tribe-settings';
import { resetMemberPermissions } from '@/lib/api/permissions';
import { createPermissionColumns } from './columns';
import { ManagePermissionsDialog } from '../components/manage-permissions-dialog';
import { AddPermissionOverrideDialog } from './dialogs/add-permission-override-dialog';
import type { TribeMemberWithPermissionsExtended, MemberListItem } from '@/lib/database/types';
import { toast } from 'sonner';

interface PermissionsSettingsProps {
  tribeId: string;
}

export function PermissionsSettings({ tribeId }: PermissionsSettingsProps) {
  // Fetch current user's permissions
  const { data: currentUserData } = useQuery(
    memberWithPermissionsOptions(tribeId)
  );

  // Fetch members with custom overrides
  const { data: members, isLoading } = useQuery(
    membersWithPermissionsOptions(tribeId)
  );

  // Dialog states
  const [selectedMember, setSelectedMember] = useState<
    | MemberListItem
    | TribeMemberWithPermissionsExtended
    | null
  >(null);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [addOverrideOpen, setAddOverrideOpen] = useState(false);

  // Check permissions
  const canManagePermissions = useMemo(() => {
    if (!currentUserData) return false;
    const { member, permissions: perms } = currentUserData;
    return (
      perms?.canManagePermissions ?? ['owner', 'admin'].includes(member.role)
    );
  }, [currentUserData]);

  // Handle reset permissions with confirmation
  const handleResetPermissions = (member: TribeMemberWithPermissionsExtended) => {
    if (!confirm(`Reset ${member.user.name}'s permissions to role defaults?`)) {
      return;
    }

    // Call the API directly
    resetMemberPermissions(tribeId, member.userId)
      .then(() => {
        toast.success('Permissions reset to role defaults');
        // Manually invalidate - we could use the queryClient here
        window.location.reload();
      })
      .catch((error: Error) => {
        toast.error(error.message || 'Failed to reset permissions');
      });
  };

  // Table columns
  const columns = useMemo(
    () =>
      createPermissionColumns({
        onEditPermissions: (member) => {
          setSelectedMember(member);
          setPermissionsOpen(true);
        },
        onResetPermissions: canManagePermissions
          ? handleResetPermissions
          : undefined,
      }),
    [canManagePermissions]
  );

  // Show access denied if user doesn't have permission
  if (currentUserData && !canManagePermissions) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to manage member permissions. Contact a tribe
          owner or admin.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Permission Overrides</h2>
          <p className="text-muted-foreground">
            Manage custom permissions for individual members that override their
            role defaults.
          </p>
        </div>
        {canManagePermissions && (
          <Button onClick={() => setAddOverrideOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Override
          </Button>
        )}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !members || members.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/50">
          <p className="text-muted-foreground mb-4">
            No members have custom permission overrides.
          </p>
          {canManagePermissions && (
            <Button onClick={() => setAddOverrideOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Permission Override
            </Button>
          )}
        </div>
      ) : (
        <DataTable columns={columns} data={members} />
      )}

      {/* Reused dialog from shared components */}
      <ManagePermissionsDialog
        tribeId={tribeId}
        member={selectedMember}
        open={permissionsOpen}
        onOpenChange={setPermissionsOpen}
      />

      <AddPermissionOverrideDialog
        tribeId={tribeId}
        open={addOverrideOpen}
        onOpenChange={setAddOverrideOpen}
        onSelectMember={(member) => {
          setSelectedMember(member);
          setPermissionsOpen(true);
        }}
      />
    </div>
  );
}
