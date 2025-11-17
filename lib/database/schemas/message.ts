import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { tribe } from "./tribe";
import { messageType } from "./enums";

export const message = pgTable("message", {
  id: text("id").primaryKey(),
  messageType: messageType("message_type").notNull().default("group"),
  tribeId: text("tribe_id").references(() => tribe.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  recipientId: text("recipient_id").references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageRead = pgTable("message_read", {
  id: text("id").primaryKey(),
  messageId: text("message_id")
    .notNull()
    .references(() => message.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  readAt: timestamp("read_at").defaultNow().notNull(),
}, (table) => ({
  uniqueMessageUser: unique().on(table.messageId, table.userId),
}));

