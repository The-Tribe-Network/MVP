import { z } from "zod";

/**
 * Permission Set Schema
 *
 * Represents a set of permission overrides where:
 * - null/undefined = use default (either role default or system default)
 * - true = explicitly allow (override default deny)
 * - false = explicitly deny (override default allow)
 */
const permissionSetSchema = z.object({
  // Posting permissions
  canPost: z.boolean().nullable().optional(),
  canComment: z.boolean().nullable().optional(),
  canEditOwnPosts: z.boolean().nullable().optional(),
  canDeleteOwnPosts: z.boolean().nullable().optional(),

  // Media permissions
  canUploadMedia: z.boolean().nullable().optional(),
  canCreateAlbums: z.boolean().nullable().optional(),
  canDeleteOwnMedia: z.boolean().nullable().optional(),

  // Event permissions
  canCreateEvents: z.boolean().nullable().optional(),
  canEditEvents: z.boolean().nullable().optional(),
  canDeleteEvents: z.boolean().nullable().optional(),

  // Member management permissions
  canInviteMembers: z.boolean().nullable().optional(),
  canRemoveMembers: z.boolean().nullable().optional(),
  canChangeMemberRoles: z.boolean().nullable().optional(),
  canManagePermissions: z.boolean().nullable().optional(),

  // Content moderation permissions
  canModeratePosts: z.boolean().nullable().optional(),
  canModerateComments: z.boolean().nullable().optional(),
  canDeleteAnyPost: z.boolean().nullable().optional(),
  canDeleteAnyComment: z.boolean().nullable().optional(),
  canDeleteAnyMedia: z.boolean().nullable().optional(),

  // Tribe management permissions
  canEditTribeSettings: z.boolean().nullable().optional(),

  // Messaging permissions
  canSendMessages: z.boolean().nullable().optional(),
});

/**
 * Update Role Permissions Schema
 *
 * For updating tribe-specific role permission defaults.
 * Used by PATCH /api/tribes/[tribe_id]/roles/[role]
 */
export const updateRolePermissionsSchema = z.object({
  permissions: permissionSetSchema,
});

/**
 * Update Member Permissions Schema
 *
 * For updating individual member permission overrides.
 * Used by PUT /api/tribes/[tribe_id]/members/[user_id]/permissions
 */
export const updateMemberPermissionsSchema = z.object({
  permissions: permissionSetSchema,
  restrictionReason: z
    .string()
    .max(500, "Restriction reason must be less than 500 characters")
    .trim()
    .nullable()
    .optional(),
});

/**
 * Change Member Role Schema
 *
 * For changing a member's role in a tribe.
 * Used by PATCH /api/tribes/[tribe_id]/members/[user_id]/role
 *
 * Note: Owner role cannot be set via this endpoint (use transfer ownership)
 */
export const changeMemberRoleSchema = z.object({
  role: z.enum(["admin", "moderator", "member"], {
    errorMap: () => ({
      message: "Role must be one of: admin, moderator, member",
    }),
  }),
});

/**
 * Type exports
 */
export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;
export type UpdateMemberPermissionsInput = z.infer<typeof updateMemberPermissionsSchema>;
export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>;

/**
 * API Request Validation Helper
 *
 * Validates request data against a Zod schema and returns a typed result.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with success flag and either data or error
 */
export function validateApiRequest<T>(
  schema: z.Schema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}
