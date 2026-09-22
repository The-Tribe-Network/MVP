import { pgTable, text, timestamp, boolean, unique, uuid, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";
import {
  privacyType,
  tribeRole,
  tribeCategory,
  invitationStatus,
  permissionLevel,
  eventEditPermission,
  attendeeListVisibility,
  pollCreationPermission,
  pollResultsVisibility,
  albumPrivacy,
} from "./enums";

// Note: avatar and featuredMediaId reference media.id, but we cannot add the .references() constraint here
// due to circular dependency (media.ts imports tribe). The relationship is enforced
// through Drizzle relations in relations.ts and database-level foreign key constraints.
export const tribe = pgTable("tribe", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  avatar: uuid("avatar"),
  banner: uuid("banner"), // 16:9 aspect ratio banner image - references media.id
  color: text("color"), // Optional brand colour (HOME-02 calendar dots); null → the client hashes the tribe id
  featuredMediaId: uuid("featured_media_id"), // References media.id - for tribe media highlights page
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

  // When the member last tapped "Done" on HOME-03 catch-up; TribeSummary.unreadCount counts posts since then
  lastCatchUpAt: timestamp("last_catch_up_at"),

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

export const tribeSettings = pgTable("tribe_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  tribeId: uuid("tribe_id")
    .notNull()
    .unique()
    .references(() => tribe.id, { onDelete: "cascade" }),

  // === FEATURE TOGGLES ===
  eventsEnabled: boolean("events_enabled").default(true).notNull(),
  albumsEnabled: boolean("albums_enabled").default(true).notNull(),
  pollsEnabled: boolean("polls_enabled").default(true).notNull(),

  // === TIMELINE SETTINGS ===
  postingPermissionLevel: permissionLevel("posting_permission_level").default("all_members").notNull(),
  commentingPermissionLevel: permissionLevel("commenting_permission_level").default("all_members").notNull(),
  allowPostEditing: boolean("allow_post_editing").default(true).notNull(),
  allowPostDeletion: boolean("allow_post_deletion").default(true).notNull(),
  allowMediaInPosts: boolean("allow_media_in_posts").default(true).notNull(),
  maxImagesPerPost: integer("max_images_per_post").default(10).notNull(),
  allowLinksInPosts: boolean("allow_links_in_posts").default(true).notNull(),
  enableLinkPreviews: boolean("enable_link_previews").default(true).notNull(),
  enablePostLikes: boolean("enable_post_likes").default(true).notNull(),
  enableCommentLikes: boolean("enable_comment_likes").default(true).notNull(),
  enableNestedReplies: boolean("enable_nested_replies").default(true).notNull(),
  enablePinnedPosts: boolean("enable_pinned_posts").default(true).notNull(),
  defaultFeedSort: text("default_feed_sort").default("newest").notNull(),

  // === MEDIA SETTINGS ===
  mediaUploadPermissionLevel: permissionLevel("media_upload_permission_level").default("all_members").notNull(),
  maxMediaFileSize: integer("max_media_file_size").default(10).notNull(), // in MB
  autoAddPostMediaToGallery: boolean("auto_add_post_media_to_gallery").default(true).notNull(),
  albumCreationPermissionLevel: permissionLevel("album_creation_permission_level").default("all_members").notNull(),
  defaultAlbumPrivacy: albumPrivacy("default_album_privacy").default("public").notNull(),
  allowCollaborativeAlbums: boolean("allow_collaborative_albums").default(true).notNull(),
  autoCreateEventAlbums: boolean("auto_create_event_albums").default(false).notNull(),
  enableMediaLikes: boolean("enable_media_likes").default(true).notNull(),
  requireMediaApproval: boolean("require_media_approval").default(false).notNull(),

  // === EVENTS SETTINGS ===
  eventCreationPermissionLevel: permissionLevel("event_creation_permission_level").default("moderators").notNull(),
  eventEditPermissionLevel: eventEditPermission("event_edit_permission_level").default("creator_and_admins").notNull(),
  requireEventEndDate: boolean("require_event_end_date").default(false).notNull(),
  requireEventLocation: boolean("require_event_location").default(false).notNull(),
  enableRsvps: boolean("enable_rsvps").default(true).notNull(),
  showAttendeeList: attendeeListVisibility("show_attendee_list").default("all_members").notNull(),
  enableRsvpDeadline: boolean("enable_rsvp_deadline").default(true).notNull(),
  enableCapacityLimit: boolean("enable_capacity_limit").default(true).notNull(),
  enableWaitlist: boolean("enable_waitlist").default(true).notNull(),
  enableEventPolls: boolean("enable_event_polls").default(true).notNull(),
  pollCreationPermissionLevel: pollCreationPermission("poll_creation_permission_level").default("event_creator").notNull(),
  allowAnonymousPolls: boolean("allow_anonymous_polls").default(true).notNull(),
  pollResultsVisibility: pollResultsVisibility("poll_results_visibility").default("after_voting").notNull(),
  enableEventReminders: boolean("enable_event_reminders").default(true).notNull(),
  reminderTimings: text("reminder_timings").default("1d,1h").notNull(), // Comma-separated: "1d,1h,15m"
  notifyOnRsvpChanges: boolean("notify_on_rsvp_changes").default(true).notNull(),
  enableCalendarExport: boolean("enable_calendar_export").default(true).notNull(),

  // === MODERATION SETTINGS ===
  autoHoldPostsWithLinks: boolean("auto_hold_posts_with_links").default(false).notNull(),
  reviewFirstPost: boolean("review_first_post").default(false).notNull(),

  // Metadata
  updatedBy: uuid("updated_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

