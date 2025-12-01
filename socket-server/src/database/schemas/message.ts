import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { tribe } from "./tribe";
import { messageType } from "./enums";

export const message = pgTable("message", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageType: messageType("message_type").notNull().default("group"),
  tribeId: uuid("tribe_id").references(() => tribe.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  recipientId: uuid("recipient_id").references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageRead = pgTable("message_read", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: uuid("message_id")
    .notNull()
    .references(() => message.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  readAt: timestamp("read_at").defaultNow().notNull(),
}, (table) => ({
  uniqueMessageUser: unique().on(table.messageId, table.userId),
}));

