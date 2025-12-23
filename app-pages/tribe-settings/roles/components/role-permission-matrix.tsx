"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateRolePermissions } from "@/lib/hooks/use-permissions";
import type { RolePermissionMatrix as RolePermissionMatrixType } from "@/lib/database/types";

interface RolePermissionMatrixProps {
  tribeId: string;
  rolePermissions: RolePermissionMatrixType[];
}

// Permission categories and labels
const PERMISSION_CATEGORIES = {
  posting: {
    label: "Posting",
    permissions: {
      canPost: "Create posts",
      canComment: "Comment on posts",
      canEditOwnPosts: "Edit own posts",
      canDeleteOwnPosts: "Delete own posts",
    },
  },
  media: {
    label: "Media",
    permissions: {
      canUploadMedia: "Upload media",
      canCreateAlbums: "Create albums",
      canDeleteOwnMedia: "Delete own media",
    },
  },
  events: {
    label: "Events",
    permissions: {
      canCreateEvents: "Create events",
      canEditEvents: "Edit events",
      canDeleteEvents: "Delete events",
    },
  },
  members: {
    label: "Members",
    permissions: {
      canInviteMembers: "Invite members",
      canRemoveMembers: "Remove members",
      canChangeMemberRoles: "Change member roles",
      canManagePermissions: "Manage permissions",
    },
  },
  moderation: {
    label: "Moderation",
    permissions: {
      canModeratePosts: "Moderate posts",
      canModerateComments: "Moderate comments",
      canDeleteAnyPost: "Delete any post",
      canDeleteAnyComment: "Delete any comment",
      canDeleteAnyMedia: "Delete any media",
    },
  },
  tribe: {
    label: "Tribe Settings",
    permissions: {
      canEditTribeSettings: "Edit tribe settings",
    },
  },
  messaging: {
    label: "Messaging",
    permissions: {
      canSendMessages: "Send messages",
    },
  },
} as const;

// System defaults for reference
const SYSTEM_DEFAULTS: Record<string, Record<string, boolean>> = {
  owner: Object.fromEntries(
    Object.values(PERMISSION_CATEGORIES).flatMap((cat) =>
      Object.keys(cat.permissions).map((key) => [key, true])
    )
  ),
  admin: Object.fromEntries(
    Object.values(PERMISSION_CATEGORIES).flatMap((cat) =>
      Object.keys(cat.permissions).map((key) => [key, true])
    )
  ),
  moderator: {
    canPost: true,
    canComment: true,
    canEditOwnPosts: true,
    canDeleteOwnPosts: true,
    canUploadMedia: true,
    canCreateAlbums: true,
    canDeleteOwnMedia: true,
    canCreateEvents: true,
    canEditEvents: false,
    canDeleteEvents: false,
    canInviteMembers: true,
    canRemoveMembers: false,
    canChangeMemberRoles: false,
    canManagePermissions: false,
    canModeratePosts: true,
    canModerateComments: true,
    canDeleteAnyPost: true,
    canDeleteAnyComment: true,
    canDeleteAnyMedia: false,
    canEditTribeSettings: false,
    canSendMessages: true,
  },
  member: {
    canPost: true,
    canComment: true,
    canEditOwnPosts: true,
    canDeleteOwnPosts: true,
    canUploadMedia: true,
    canCreateAlbums: false,
    canDeleteOwnMedia: true,
    canCreateEvents: false,
    canEditEvents: false,
    canDeleteEvents: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeMemberRoles: false,
    canManagePermissions: false,
    canModeratePosts: false,
    canModerateComments: false,
    canDeleteAnyPost: false,
    canDeleteAnyComment: false,
    canDeleteAnyMedia: false,
    canEditTribeSettings: false,
    canSendMessages: true,
  },
};

export function RolePermissionMatrix({ tribeId, rolePermissions }: RolePermissionMatrixProps) {
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());

  // Get mutation hooks for each role
  const { mutate: updateAdmin } = useUpdateRolePermissions(tribeId, "admin");
  const { mutate: updateModerator } = useUpdateRolePermissions(tribeId, "moderator");
  const { mutate: updateMember } = useUpdateRolePermissions(tribeId, "member");

  const getMutationForRole = (role: string) => {
    switch (role) {
      case "admin":
        return updateAdmin;
      case "moderator":
        return updateModerator;
      case "member":
        return updateMember;
      default:
        return null;
    }
  };

  const handlePermissionToggle = (role: string, permissionKey: string, currentValue: boolean) => {
    const mutation = getMutationForRole(role);
    if (!mutation) return;

    const updateKey = `${role}-${permissionKey}`;
    setPendingUpdates((prev) => new Set(prev).add(updateKey));

    mutation(
      {
        permissions: {
          [permissionKey]: !currentValue,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Updated ${role} permissions`);
          setPendingUpdates((prev) => {
            const next = new Set(prev);
            next.delete(updateKey);
            return next;
          });
        },
        onError: (error: Error) => {
          toast.error(error.message || `Failed to update ${role} permissions`);
          setPendingUpdates((prev) => {
            const next = new Set(prev);
            next.delete(updateKey);
            return next;
          });
        },
      }
    );
  };

  // Get effective permission value (tribe override or system default)
  const getEffectivePermission = (role: string, permissionKey: string): boolean => {
    const roleData = rolePermissions.find((r) => r.role === role);
    if (!roleData) return SYSTEM_DEFAULTS[role]?.[permissionKey] ?? false;

    const tribeValue = roleData.permissions[permissionKey];
    if (tribeValue !== null && tribeValue !== undefined) {
      return tribeValue === true;
    }

    return SYSTEM_DEFAULTS[role]?.[permissionKey] ?? false;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-semibold bg-muted">Permission</th>
            <th className="text-center p-3 font-semibold bg-muted">Owner</th>
            <th className="text-center p-3 font-semibold bg-muted">Admin</th>
            <th className="text-center p-3 font-semibold bg-muted">Moderator</th>
            <th className="text-center p-3 font-semibold bg-muted">Member</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => (
            <>
              {/* Category Header */}
              <tr key={`category-${categoryKey}`} className="border-b bg-muted/50">
                <td colSpan={5} className="p-2 font-semibold text-sm">
                  {category.label}
                </td>
              </tr>

              {/* Permission Rows */}
              {Object.entries(category.permissions).map(([permKey, permLabel]) => {
                const ownerValue = getEffectivePermission("owner", permKey);
                const adminValue = getEffectivePermission("admin", permKey);
                const moderatorValue = getEffectivePermission("moderator", permKey);
                const memberValue = getEffectivePermission("member", permKey);

                return (
                  <tr key={permKey} className="border-b hover:bg-muted/20">
                    <td className="p-3 text-sm">{permLabel}</td>

                    {/* Owner - Always locked */}
                    <td className="p-3 text-center">
                      {ownerValue ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </td>

                    {/* Admin - Editable */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center">
                        {pendingUpdates.has(`admin-${permKey}`) ? (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                          <Checkbox
                            checked={adminValue}
                            onCheckedChange={() => handlePermissionToggle("admin", permKey, adminValue)}
                          />
                        )}
                      </div>
                    </td>

                    {/* Moderator - Editable */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center">
                        {pendingUpdates.has(`moderator-${permKey}`) ? (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                          <Checkbox
                            checked={moderatorValue}
                            onCheckedChange={() =>
                              handlePermissionToggle("moderator", permKey, moderatorValue)
                            }
                          />
                        )}
                      </div>
                    </td>

                    {/* Member - Editable */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center">
                        {pendingUpdates.has(`member-${permKey}`) ? (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                          <Checkbox
                            checked={memberValue}
                            onCheckedChange={() => handlePermissionToggle("member", permKey, memberValue)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
