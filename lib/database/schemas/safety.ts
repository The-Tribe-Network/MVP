import { check, index, pgTable, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "@/lib/database/schemas/auth";
import { tribe } from "@/lib/database/schemas/tribe";
import { reportReason, reportStatus, reportTargetType } from "@/lib/database/schemas/enums";

/**
 * A member's report of a post, comment, photo or member of a tribe (TRI-237; owner decision TRI-105: a
 * report floor for the alpha). Written by POST /reports, which emails the tribe owner and the platform
 * owner. No queue or dashboard yet (TRI-19): `status` stays `open`, `resolved_*` stay null.
 *
 * `target_id` is polymorphic (post / comment / media / user id), so it has no FK: a report outlives the
 * content it points at, as evidence. A deleted reporter's row stays too — account deletion (TRI-16) keeps
 * the user row as a tombstone, so `reporter_id` then names "Deleted user".
 */
export const report = pgTable(
  "report",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tribeId: uuid("tribe_id")
      .notNull()
      .references(() => tribe.id, { onDelete: "cascade" }),
    targetType: reportTargetType("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    reason: reportReason("reason").notNull(),
    note: text("note"),
    status: reportStatus("status").notNull().default("open"),
    resolvedBy: uuid("resolved_by").references(() => user.id, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // One open report per reporter per target: a repeat is answered with the existing row (idempotent)
    openPerTarget: uniqueIndex("report_open_reporter_target_unique")
      .on(table.reporterId, table.targetType, table.targetId)
      .where(sql`${table.status} = 'open'`),
    // The per-reporter rate limit counts the last hour
    reporterCreated: index("idx_report_reporter_created").on(table.reporterId, table.createdAt),
    tribeCreated: index("idx_report_tribe_created").on(table.tribeId, table.createdAt),
  })
);

/**
 * `blocker` blocked `blocked` (TRI-238). Filtering is in both directions (lib/services/blocks.ts): neither
 * sees the other's content, profile or activity. Membership is untouched. Rows go with either user
 * (FK cascade; account deletion removes them explicitly since the user row stays as a tombstone).
 */
export const userBlock = pgTable(
  "user_block",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blockerId: uuid("blocker_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    blockedId: uuid("blocked_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // Also the (blocker_id, …) index for "whom did I block" and the forward anti-join probe
    uniquePair: unique("user_block_blocker_blocked_unique").on(table.blockerId, table.blockedId),
    // The reverse anti-join probe: "who blocked me"
    blockedBlocker: index("idx_user_block_blocked_blocker").on(table.blockedId, table.blockerId),
    notSelf: check("user_block_not_self", sql`${table.blockerId} <> ${table.blockedId}`),
  })
);
