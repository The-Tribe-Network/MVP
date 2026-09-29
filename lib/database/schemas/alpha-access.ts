import { check, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "@/lib/database/schemas/auth";

export type AlphaAccessStatus = "requested" | "approved" | "revoked";
export type AlphaAccessSource = "sign_up" | "sign_in" | "manual" | "backfill";

/**
 * The alpha allowlist (TRI-369). Anyone can sign up, but only an `approved` email gets a session (the gate is
 * TRI-370). One row per email: sign-up writes `requested`, the owner approves or revokes it in the admin app
 * (TRI-372), and can pre-approve an email before its owner signs up (`manual`, no `user_id` yet).
 *
 * Keyed on the email rather than the user so a pre-approval exists before the account does; `user_id` is linked
 * when the account is created. Existing users are not auto-approved (owner, 2026-09-28): the rollout backfills
 * them as `requested`.
 */
export const alphaAccess = pgTable(
  "alpha_access",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    status: text("status").$type<AlphaAccessStatus>().notNull(),
    userId: uuid("user_id").references(() => user.id, { onDelete: "set null" }),
    source: text("source").$type<AlphaAccessSource>().notNull(),
    note: text("note"),
    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    approvedAt: timestamp("approved_at"),
    revokedAt: timestamp("revoked_at"),
    // The owner's "new sign-up" email went out (TRI-373); set once so repeated blocked sign-ins send nothing
    ownerNotifiedAt: timestamp("owner_notified_at"),
  },
  (table) => ({
    email: uniqueIndex("uq_alpha_access_email").on(sql`lower(${table.email})`),
    userId: index("idx_alpha_access_user_id").on(table.userId),
    status: check("alpha_access_status", sql`${table.status} IN ('requested', 'approved', 'revoked')`),
    source: check("alpha_access_source", sql`${table.source} IN ('sign_up', 'sign_in', 'manual', 'backfill')`),
  })
);
