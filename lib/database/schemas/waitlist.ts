import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  source: text("source"), // Which page/CTA triggered signup (e.g., "hero", "pricing", "features")
  referrer: text("referrer"), // HTTP referrer
  userAgent: text("user_agent"), // Browser/device info
  metadata: text("metadata"), // JSON string for future flexibility
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
