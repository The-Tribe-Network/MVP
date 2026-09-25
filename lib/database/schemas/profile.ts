import { pgTable, text, timestamp, boolean, uuid, integer, unique } from "drizzle-orm/pg-core";
import { user } from "@/lib/database/schemas/auth";
import { socialNetwork } from "@/lib/database/schemas/enums";

/**
 * A member's social links (PROF-02 header, PROF-03 editor). One row per network per user (owner decision
 * TRI-81); written replace-all through PATCH /user/profile `socialLinks`. `value` is normalized server-side:
 * a bare handle (no `@`) for youtube / instagram / tiktok / x, a full https URL for `website` (and for a
 * YouTube channel URL that has no @handle).
 */
export const userSocialLink = pgTable("user_social_link", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  network: socialNetwork("network").notNull(),
  value: text("value").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  uniqueUserNetwork: unique().on(t.userId, t.network),
}));

/**
 * Privacy preferences (USET-06). One row per user, created on the first PATCH; a user without a row has
 * the column defaults (see DEFAULT_PRIVACY in lib/services/profile.ts).
 */
export const userPrivacy = pgTable("user_privacy", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  profileVisibility: text("profile_visibility").notNull().default("everyone"), // 'everyone' | 'tribe_members'
  showOnlineStatus: boolean("show_online_status").notNull().default(true),
  showLastSeen: boolean("show_last_seen").notNull().default(true),
  showEmail: boolean("show_email").notNull().default(false),
  showLocation: boolean("show_location").notNull().default(true),
  showJoinDate: boolean("show_join_date").notNull().default(true),
  showSharedTribes: boolean("show_shared_tribes").notNull().default(true),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
