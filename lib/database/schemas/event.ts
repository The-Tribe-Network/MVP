import { pgTable, text, timestamp, unique, uuid, integer, boolean, index } from "drizzle-orm/pg-core";
import { tribe } from "./tribe";
import { user } from "./auth";
import { album } from "./media";
import {
  eventStatus,
  attendeeListVisibility,
  pollCreationPermission,
  pollResultsVisibility,
  eventEditPermission,
  rsvpStatus,
} from "./enums";

export const event = pgTable("event", {
  id: uuid("id").primaryKey().defaultRandom(),
  tribeId: uuid("tribe_id")
    .notNull()
    .references(() => tribe.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  coverImageUrl: text("cover_image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: eventStatus("status").notNull().default("upcoming"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  // GET /me/agenda: the caller's tribes × a date range (TRI-6, migrations/tri6-agenda-index.sql)
  tribeStartIdx: index("idx_event_tribe_start").on(table.tribeId, table.startDate),
}));

export const eventAttendee = pgTable("event_attendee", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: rsvpStatus("status").notNull().default("going"),
  // +1s this member brings (clamped to event_settings.guestAllowance) and a note for the host (TRI-10)
  guestCount: integer("guest_count").notNull().default(0),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  uniqueEventUser: unique().on(table.eventId, table.userId),
}));

/**
 * Per-event settings that override tribe-level defaults
 * Allows event creators to customize RSVP, polls, and visibility settings
 */
export const eventSettings = pgTable("event_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .unique()
    .references(() => event.id, { onDelete: "cascade" }),

  // === RSVP & ATTENDANCE SETTINGS ===
  capacityLimit: integer("capacity_limit"), // null = unlimited
  enableWaitlist: boolean("enable_waitlist").default(true),
  rsvpDeadline: timestamp("rsvp_deadline"),
  attendeeVisibility: attendeeListVisibility("attendee_visibility").default("all_members"),
  guestAllowance: integer("guest_allowance").default(0), // +1s per member
  requireRsvpApproval: boolean("require_rsvp_approval").default(false),

  // === POLL SETTINGS (override tribe defaults) ===
  enablePolls: boolean("enable_polls").default(true),
  pollCreationLevel: pollCreationPermission("poll_creation_level").default("event_creator"),
  pollResultsVisibility: pollResultsVisibility("poll_results_visibility").default("after_voting"),
  allowAnonymousPolls: boolean("allow_anonymous_polls").default(true),

  // === MEDIA SETTINGS ===
  linkedAlbumId: uuid("linked_album_id")
    .references(() => album.id, { onDelete: "set null" }),
  autoCreateAlbum: boolean("auto_create_album").default(true),
  allowAttendeeUploads: boolean("allow_attendee_uploads").default(true),

  // === NOTIFICATION SETTINGS ===
  enableReminders: boolean("enable_reminders").default(true),
  reminderSchedule: text("reminder_schedule").default("1d,1h"), // Comma-separated: "1w,1d,1h,15m"
  notifyOnRsvpChanges: boolean("notify_on_rsvp_changes").default(true),
  notifyOnComments: boolean("notify_on_comments").default(true),
  notifyOnPollResults: boolean("notify_on_poll_results").default(true),

  // === PERMISSION OVERRIDES ===
  editPermission: eventEditPermission("edit_permission").default("creator_and_admins"),

  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Co-hosts for an event - grants edit permissions to specific members
 * beyond the standard role-based permissions
 */
export const eventCoHost = pgTable("event_co_host", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  addedBy: uuid("added_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueEventCoHost: unique().on(table.eventId, table.userId),
}));

/**
 * External links attached to an event (Zoom, tickets, parking, etc.)
 */
export const eventLink = pgTable("event_link", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").default(0),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

