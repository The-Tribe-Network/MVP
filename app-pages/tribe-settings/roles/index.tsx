"use client";

import { useQuery } from "@tanstack/react-query";
import { rolePermissionsOptions } from "@/lib/query-options/permissions";
import { RolePermissionMatrix } from "./components/role-permission-matrix";
import { RolesSettingsSkeleton } from "./loading";
import { RolesSettingsError } from "./error";

interface RolesSettingsProps {
  tribeId: string;
}

export function RolesSettings({ tribeId }: RolesSettingsProps) {
  const {
    data: rolePermissions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(rolePermissionsOptions(tribeId));

  if (isLoading) {
    return <RolesSettingsSkeleton />;
  }

  if (isError) {
    return <RolesSettingsError message={error?.message} onRetry={() => refetch()} />;
  }

  if (!rolePermissions) {
    return <RolesSettingsError message="Role permissions not found" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Role Permissions</h1>
        <p className="text-muted-foreground mt-2">
          Configure default permissions for each role in your tribe. These settings determine what
          members can do based on their role.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Permission Matrix</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Owner permissions are locked and cannot be changed. You can customize permissions for
            Admin, Moderator, and Member roles.
          </p>
        </div>

        <RolePermissionMatrix tribeId={tribeId} rolePermissions={rolePermissions} />
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <h3 className="text-sm font-medium mb-2">Important Notes</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Changes affect all members with that role immediately</li>
          <li>Individual permission overrides can be set in the Permissions tab</li>
          <li>Owner role always has all permissions and cannot be modified</li>
        </ul>
      </div>
    </div>
  );
}
