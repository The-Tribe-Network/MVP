import { pgTable, uuid, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { tribe } from "./tribe";
import { user } from "./auth";
import { tribeRole } from "./enums";

/**
 * Tribe Role Permission Table
 *
 * Defines customizable default permissions for each role within a specific tribe.
 * Implements the second layer of the three-layer permission system:
 * 1. Individual Override (tribeMemberPermission) - highest priority
 * 2. Tribe Role Default (this table) - middle priority
 * 3. System Default (hardcoded) - fallback
 *
 * All permission fields are nullable:
 * - null = use system default
 * - true = explicitly allowed (overrides system default)
 * - false = explicitly denied (overrides system default)
 */
export const tribeRolePermission = pgTable(
  "tribe_role_permission",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tribeId: uuid("tribe_id")
      .notNull()
      .references(() => tribe.id, { onDelete: "cascade" }),
    role: tribeRole("role").notNull(),

    // Posting permissions
    canPost: boolean("can_post"),
    canComment: boolean("can_comment"),
    canEditOwnPosts: boolean("can_edit_own_posts"),
    canDeleteOwnPosts: boolean("can_delete_own_posts"),

    // Media permissions
    canUploadMedia: boolean("can_upload_media"),
    canCreateAlbums: boolean("can_create_albums"),
    canDeleteOwnMedia: boolean("can_delete_own_media"),

    // Event permissions
    canCreateEvents: boolean("can_create_events"),
    canEditEvents: boolean("can_edit_events"),
    canDeleteEvents: boolean("can_delete_events"),

    // Member management permissions
    canInviteMembers: boolean("can_invite_members"),
    canRemoveMembers: boolean("can_remove_members"),
    canChangeMemberRoles: boolean("can_change_member_roles"),
    canManagePermissions: boolean("can_manage_permissions"),

    // Content moderation permissions
    canModeratePosts: boolean("can_moderate_posts"),
    canModerateComments: boolean("can_moderate_comments"),
    canDeleteAnyPost: boolean("can_delete_any_post"),
    canDeleteAnyComment: boolean("can_delete_any_comment"),
    canDeleteAnyMedia: boolean("can_delete_any_media"),

    // Tribe management permissions
    canEditTribeSettings: boolean("can_edit_tribe_settings"),

    // Messaging permissions
    canSendMessages: boolean("can_send_messages"),

    // Metadata
    updatedBy: uuid("updated_by").references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    // Ensure only one permission record per tribe-role combination
    uniqueTribeRole: unique().on(table.tribeId, table.role),
  })
);
