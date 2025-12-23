'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Key, RotateCcw } from 'lucide-react';
import type { TribeMemberWithPermissionsExtended } from '@/lib/database/types';
import { getPermissionSummary, formatPermissionList } from './utils';

interface CreateColumnsProps {
  onEditPermissions: (member: TribeMemberWithPermissionsExtended) => void;
  onResetPermissions?: (member: TribeMemberWithPermissionsExtended) => void;
}

const roleColors = {
  owner: 'bg-purple-500 text-white',
  admin: 'bg-blue-500 text-white',
  moderator: 'bg-green-500 text-white',
  member: 'bg-gray-500 text-white',
};

export function createPermissionColumns({
  onEditPermissions,
  onResetPermissions,
}: CreateColumnsProps): ColumnDef<TribeMemberWithPermissionsExtended>[] {
  return [
    // Member column with avatar
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

    // Role column
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge variant="secondary" className={roleColors[role]}>
            {role}
          </Badge>
        );
      },
    },

    // Permission summary column
    {
      id: 'permissions',
      header: 'Custom Permissions',
      cell: ({ row }) => {
        const summary = getPermissionSummary(row.original.permissions);
        const hasRestrictions = summary.restricted.length > 0;
        const hasElevations = summary.elevated.length > 0;

        if (!hasRestrictions && !hasElevations) {
          return (
            <div className="text-sm text-muted-foreground">No overrides</div>
          );
        }

        return (
          <div className="text-sm space-y-1">
            {hasRestrictions && (
              <div className="text-red-600">
                <span className="font-medium">Restricted:</span>{' '}
                {formatPermissionList(summary.restricted)}
              </div>
            )}
            {hasElevations && (
              <div className="text-green-600">
                <span className="font-medium">Elevated:</span>{' '}
                {formatPermissionList(summary.elevated)}
              </div>
            )}
          </div>
        );
      },
    },

    // Reason column
    {
      accessorKey: 'restrictionReason',
      header: 'Reason',
      cell: ({ row }) => {
        const reason = row.original.permissions?.restrictionReason;
        return reason ? (
          <div className="text-sm text-muted-foreground italic max-w-xs truncate">
            &ldquo;{reason}&rdquo;
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">—</div>
        );
      },
    },

    // Actions column
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditPermissions(row.original)}>
              <Key className="h-4 w-4 mr-2" />
              Edit Permissions
            </DropdownMenuItem>
            {onResetPermissions && (
              <DropdownMenuItem
                onClick={() => onResetPermissions(row.original)}
                className="text-destructive focus:text-destructive"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
