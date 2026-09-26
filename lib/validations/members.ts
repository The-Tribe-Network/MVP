import { z } from 'zod';

/**
 * Validation schema for changing a member's role
 */
export const changeMemberRoleSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  newRole: z.enum(['admin', 'moderator', 'member'], {
    errorMap: () => ({ message: 'Role must be admin, moderator, or member' }),
  }),
});

/**
 * Validation schema for removing a member from tribe
 */
export const removeMemberSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
});

/**
 * Validation schema for updating member permissions
 * All permission fields are optional, but at least one must be specified
 */
export const updateMemberPermissionsSchema = z
  .object({
    memberId: z.string().uuid('Invalid member ID'),
    restrictionReason: z.string().max(500).optional(),
    // Posting permissions
    canPost: z.boolean().optional(),
    canComment: z.boolean().optional(),
    canEditOwnPosts: z.boolean().optional(),
    canDeleteOwnPosts: z.boolean().optional(),
    // Media permissions
    canUploadMedia: z.boolean().optional(),
    canCreateAlbums: z.boolean().optional(),
    canDeleteOwnMedia: z.boolean().optional(),
    // Event permissions
    canCreateEvents: z.boolean().optional(),
    canEditEvents: z.boolean().optional(),
    canDeleteEvents: z.boolean().optional(),
    // Member permissions
    canInviteMembers: z.boolean().optional(),
    canRemoveMembers: z.boolean().optional(),
    canChangeMemberRoles: z.boolean().optional(),
    canManagePermissions: z.boolean().optional(),
    // Moderation permissions
    canModeratePosts: z.boolean().optional(),
    canModerateComments: z.boolean().optional(),
    canDeleteAnyPost: z.boolean().optional(),
    canDeleteAnyComment: z.boolean().optional(),
    canDeleteAnyMedia: z.boolean().optional(),
    // Tribe permissions
    canEditTribeSettings: z.boolean().optional(),
    canDeleteTribe: z.boolean().optional(),
    canTransferOwnership: z.boolean().optional(),
    // Messaging permissions
    canSendMessages: z.boolean().optional(),
    // Timelines (TRI-314)
    canCreateTimelines: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Extract all fields except memberId and restrictionReason
      const { memberId, restrictionReason, ...permissions } = data;
      // At least one permission must be specified
      return Object.values(permissions).some((val) => val !== undefined);
    },
    { message: 'At least one permission must be specified' }
  );

/**
 * Validation schema for member list query parameters
 * Supports pagination, search, and filtering
 */
export const memberListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().optional(),
  role: z.enum(['owner', 'admin', 'moderator', 'member']).optional(),
  hasCustomPermissions: z.coerce.boolean().optional(),
  joinedAfter: z.string().datetime().optional(),
  joinedBefore: z.string().datetime().optional(),
});

/**
 * Helper function to validate API requests
 * Returns typed success/error result
 */
export function validateApiRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

// Type exports
export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
export type UpdateMemberPermissionsInput = z.infer<typeof updateMemberPermissionsSchema>;
export type MemberListQuery = z.infer<typeof memberListQuerySchema>;
