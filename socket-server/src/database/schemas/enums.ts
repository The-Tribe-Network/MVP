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

