'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Shield, UserMinus, Key } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { MemberListItem } from '@/lib/database/types';

interface CreateColumnsProps {
  currentUserRole: 'owner' | 'admin' | 'moderator' | 'member';
  canChangeMemberRoles: boolean;
  canRemoveMembers: boolean;
  canManagePermissions: boolean;
  onChangeRole: (member: MemberListItem) => void;
  onRemove: (member: MemberListItem) => void;
  onManagePermissions: (member: MemberListItem) => void;
}

const roleColors = {
  owner: 'bg-purple-500',
  admin: 'bg-blue-500',
  moderator: 'bg-green-500',
  member: 'bg-gray-500',
};

const roleHierarchy = { owner: 4, admin: 3, moderator: 2, member: 1 };

export function createMemberColumns({
  currentUserRole,
  canChangeMemberRoles,
  canRemoveMembers,
  canManagePermissions,
  onChangeRole,
  onRemove,
  onManagePermissions,
}: CreateColumnsProps): ColumnDef<MemberListItem>[] {
  const currentUserLevel = roleHierarchy[currentUserRole];

  return [
    {
      accessorKey: 'user',
      header: 'Member',
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              {user.username && (
                <div className="text-sm text-muted-foreground">
                  @{user.username}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge variant="secondary" className={roleColors[role]}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'joinedAt',
      header: 'Joined',
      cell: ({ row }) => {
        return formatDistanceToNow(new Date(row.original.joinedAt), {
          addSuffix: true,
        });
      },
    },
    {
      accessorKey: 'hasCustomPermissions',
      header: 'Permissions',
      cell: ({ row }) => {
        const { hasCustomPermissions, restrictionReason } = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {hasCustomPermissions ? 'Custom' : 'Default'}
            </span>
            {restrictionReason && (
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                ({restrictionReason})
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const member = row.original;
        const memberLevel = roleHierarchy[member.role];
        const canManage = currentUserLevel > memberLevel;

        // Owner cannot be managed - show indicator
        if (member.role === 'owner') {
          return (
            <span className="text-sm text-muted-foreground">—</span>
          );
        }

        // Show actions only if user can manage this member
        if (!canManage) {
          return (
            <span className="text-sm text-muted-foreground">—</span>
          );
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canChangeMemberRoles && (
                <DropdownMenuItem onClick={() => onChangeRole(member)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Change Role
                </DropdownMenuItem>
              )}
              {canManagePermissions && (
                <DropdownMenuItem onClick={() => onManagePermissions(member)}>
                  <Key className="mr-2 h-4 w-4" />
                  Manage Permissions
                </DropdownMenuItem>
              )}
              {(canChangeMemberRoles || canManagePermissions) &&
                canRemoveMembers && <DropdownMenuSeparator />}
              {canRemoveMembers && (
                <DropdownMenuItem
                  onClick={() => onRemove(member)}
                  className="text-destructive"
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Remove Member
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
