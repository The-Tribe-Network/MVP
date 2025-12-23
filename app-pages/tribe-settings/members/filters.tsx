'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MemberFiltersProps {
  role?: 'owner' | 'admin' | 'moderator' | 'member';
  hasCustomPermissions?: boolean;
  onRoleChange: (role?: 'owner' | 'admin' | 'moderator' | 'member') => void;
  onPermissionStatusChange: (status?: boolean) => void;
  onClearFilters: () => void;
}

export function MemberFilters({
  role,
  hasCustomPermissions,
  onRoleChange,
  onPermissionStatusChange,
  onClearFilters,
}: MemberFiltersProps) {
  const hasActiveFilters =
    role !== undefined || hasCustomPermissions !== undefined;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={role || 'all'}
        onValueChange={(v) =>
          onRoleChange(v === 'all' ? undefined : (v as any))
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="owner">Owner</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="moderator">Moderator</SelectItem>
          <SelectItem value="member">Member</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={
          hasCustomPermissions === undefined
            ? 'all'
            : hasCustomPermissions
            ? 'custom'
            : 'default'
        }
        onValueChange={(v) =>
          onPermissionStatusChange(
            v === 'all' ? undefined : v === 'custom'
          )
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All permissions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All permissions</SelectItem>
          <SelectItem value="custom">Custom permissions</SelectItem>
          <SelectItem value="default">Default permissions</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
