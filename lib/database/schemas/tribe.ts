import { pgTable, text, timestamp, boolean, unique, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { privacyType, tribeRole, tribeCategory, invitationStatus } from "./enums";

export const tribe = pgTable("tribe", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  avatar: uuid("avatar").references((): any => {
    // Lazy reference to avoid circular dependency with media schema
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { media } = require("./media");
    return media.id;
  }, { onDelete: "set null" }),
  location: text("location"),
  privacy: privacyType("privacy").notNull().default("private"),
  category: tribeCategory("category").notNull().default("other"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isTrending: boolean("is_trending").notNull().default(false),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const tribeMember = pgTable("tribe_member", {
  id: uuid("id").primaryKey().defaultRandom(),
  tribeId: uuid("tribe_id")
    .notNull()
    .references(() => tribe.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: tribeRole("role").notNull().default("member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  uniqueTribeUser: unique().on(table.tribeId, table.userId),
}));

export const tribeMemberPermission = pgTable("tribe_member_permission", {
  id: uuid("id").primaryKey().defaultRandom(),
  tribeMemberId: uuid("tribe_member_id")
    .notNull()
    .references(() => tribeMember.id, { onDelete: "cascade" }),
  tribeId: uuid("tribe_id")
    .notNull()
    .references(() => tribe.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

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
  canDeleteTribe: boolean("can_delete_tribe"),
  canTransferOwnership: boolean("can_transfer_ownership"),

  // Messaging permissions
  canSendMessages: boolean("can_send_messages"),

  // Notes
  restrictionReason: text("restriction_reason"),
  setBy: uuid("set_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const tribeMemberPreference = pgTable("tribe_member_preference", {
  id: uuid("id").primaryKey().defaultRandom(),
  tribeMemberId: uuid("tribe_member_id")
    .notNull()
    .references(() => tribeMember.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Determines if the user wants to automatically add media to an album when they make a post
  autoAddPostMediaToTribe: boolean("auto_add_post_media_to_tribe").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const tribeInvitation = pgTable("tribe_invitation", {
  id: uuid("id").primaryKey().defaultRandom(),
  tribeId: uuid("tribe_id")
    .notNull()
    .references(() => tribe.id, { onDelete: "cascade" }),
  invitedBy: uuid("invited_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  email: text("email").notNull(),
  role: tribeRole("role").notNull().default("member"),
  status: invitationStatus("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

