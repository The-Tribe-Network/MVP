import { index, jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { tribe } from "./tribe";
import { draftKind } from "./enums";

// A composer or wizard in progress, kept server-side so it survives a reinstall and follows the
// user across devices (TRI-99). Many per user per tribe per kind. The payload is the request body
// being built plus UI-only fields the client owns; the server stores it opaquely (TRI-168).
export const draft = pgTable(
  "draft",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tribeId: uuid("tribe_id")
      .notNull()
      .references(() => tribe.id, { onDelete: "cascade" }),
    kind: draftKind("kind").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // The list query: one user's drafts for a tribe and kind, newest first
    userTribeKindIdx: index("idx_draft_user_tribe_kind_updated").on(
      table.userId,
      table.tribeId,
      table.kind,
      table.updatedAt.desc()
    ),
  })
);
