import { boolean, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "@/lib/database/schemas/auth";

/**
 * A user's email opt-outs (TRI-344). No row = every category on. Written by the one-click unsubscribe link
 * (`/api/email/unsubscribe`); there's no app setting for it in the alpha. When notification preferences land
 * (TRI-8, `email: { enabled, dailyDigest }`), these two map onto them.
 *
 * Kept out of Better-Auth's `user` table so an auth read never depends on this migration.
 */
export const userEmailPreference = pgTable("user_email_preference", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  // Event cancelled / time changed (TRI-349) and the day-before reminder (TRI-350)
  eventUpdates: boolean("event_updates").default(true).notNull(),
  // The daily digest of unread notifications (TRI-347)
  digest: boolean("digest").default(true).notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
