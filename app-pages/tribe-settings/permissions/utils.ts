import type { TribeMemberPermission } from '@/lib/database/types';

/**
 * Format permission key to human-readable label
 * Examples:
 * - 'canPost' → 'post'
 * - 'canCreateEvents' → 'create events'
 * - 'canDeleteAnyMedia' → 'delete any media'
 */
export function formatPermissionName(key: string): string {
  // Remove 'can' prefix
  const withoutCan = key.replace(/^can/, '');

  // Insert spaces before capital letters and convert to lowercase
  return withoutCan
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim();
}

/**
 * Get summary of permission overrides
 * Returns permissions that are explicitly restricted (false) or elevated (true)
 *
 * @param permissions - The member's permission overrides (null values = use role default)
 * @returns Object with arrays of restricted and elevated permission labels
 */
export function getPermissionSummary(permissions: TribeMemberPermission | null): {
  restricted: string[];
  elevated: string[];
} {
  if (!permissions) {
    return { restricted: [], elevated: [] };
  }

  const restricted: string[] = [];
  const elevated: string[] = [];

  // Permission keys to check (exclude metadata fields)
  const permissionKeys = [
    'canPost',
    'canComment',
    'canEditOwnPosts',
    'canDeleteOwnPosts',
    'canUploadMedia',
    'canCreateAlbums',
    'canDeleteOwnMedia',
    'canCreateEvents',
    'canEditEvents',
    'canDeleteEvents',
    'canInviteMembers',
    'canRemoveMembers',
    'canChangeMemberRoles',
    'canManagePermissions',
    'canModeratePosts',
    'canModerateComments',
    'canDeleteAnyPost',
    'canDeleteAnyComment',
    'canDeleteAnyMedia',
    'canEditTribeSettings',
    'canSendMessages',
  ] as const;

  for (const key of permissionKeys) {
    const value = permissions[key];

    // null means "use role default" - we only care about explicit overrides
    if (value === false) {
      restricted.push(formatPermissionName(key));
    } else if (value === true) {
      elevated.push(formatPermissionName(key));
    }
  }

  return { restricted, elevated };
}

/**
 * Format a list of permissions into a readable summary string
 * Limits to first 3 items and adds "and X more" if there are more
 */
export function formatPermissionList(permissions: string[], maxItems = 3): string {
  if (permissions.length === 0) return '';
  if (permissions.length <= maxItems) return permissions.join(', ');

  const visible = permissions.slice(0, maxItems);
  const remaining = permissions.length - maxItems;

  return `${visible.join(', ')} and ${remaining} more`;
}
