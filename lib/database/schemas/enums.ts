import { pgEnum } from "drizzle-orm/pg-core";

export const privacyType = pgEnum("privacy_type", ["private", "public"]);

export const tribeRole = pgEnum("tribe_role", ["owner", "admin", "moderator", "member"]);

export const tribeCategory = pgEnum("tribe_category", [
  "social",
  "gaming",
  "family",
  "work",
  "hobbies",
  "other",
]);

export const activityType = pgEnum("activity_type", [
  "post",
  "photo",
  "event",
  "member",
  "comment",
  "like",
]);

export const mediaType = pgEnum("media_type", ["image", "video", "document"]);

// Derived on write from what the post carries; denormalized so the feed can filter in SQL
export const postKind = pgEnum("post_kind", [
  "text",
  "photo",
  "photos",
  "event",
  "poll",
  "album",
  "video",
  "announcement",
]);

// What a saved draft is building (TRI-168); the payload is the matching create input in progress
export const draftKind = pgEnum("draft_kind", ["post", "event"]);

// RSVP status, pinned (TRI-10); was free text defaulting to 'going'
export const rsvpStatus = pgEnum("rsvp_status", ["going", "maybe", "not_going"]);

export const invitationStatus = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "rejected",
  "expired",
]);

export const eventStatus = pgEnum("event_status", [
  "upcoming",
  "ongoing",
  "completed",
  "cancelled",
]);

export const messageType = pgEnum("message_type", ["group", "direct"]);

export const albumPrivacy = pgEnum("album_privacy", ["public", "private", "admin_only"]);

export const permissionLevel = pgEnum("permission_level", [
  "all_members",
  "moderators",
  "admins",
  "owner_only",
]);

export const eventEditPermission = pgEnum("event_edit_permission", [
  "creator_only",
  "creator_and_admins",
  "all_members",
]);

export const attendeeListVisibility = pgEnum("attendee_list_visibility", [
  "all_members",
  "count_only",
  "hidden",
]);

export const pollCreationPermission = pgEnum("poll_creation_permission", [
  "event_creator",
  "moderators",
  "admins",
]);

export const pollResultsVisibility = pgEnum("poll_results_visibility", [
  "immediate",
  "after_voting",
  "after_close",
  "hidden",
]);


// Delivery channels beyond the in-app feed (TRI-179); in-app read state is `notification.read_at`
export const notificationChannel = pgEnum("notification_channel", ["push", "email"]);

// `suppressed` = not sent on purpose (mute, preference, quiet hours); the in-app row still exists
export const notificationDeliveryStatus = pgEnum("notification_delivery_status", [
  "pending",
  "sent",
  "failed",
  "suppressed",
]);
