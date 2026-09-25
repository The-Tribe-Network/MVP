import { pgTable, text, timestamp, boolean, uuid, date } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  username: text("username").unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  location: text("location"),
  profileCompleted: boolean("profile_completed").default(false).notNull(),
  tourCompleted: boolean("tour_completed").default(false).notNull(),
  // Account fields (TRI-16, USET-02/03). tri16-account-fields.sql
  phone: text("phone"), // free text, lightly validated
  language: text("language").default("en"), // BCP-47 language tag
  timezone: text("timezone"), // IANA zone name
  birthday: date("birthday"), // 'YYYY-MM-DD'; set at email sign-up (13+), null for social sign-ups
  // Set by DELETE /me/account: the row stays as a PII-scrubbed tombstone so the user's posts, comments and
  // events (FKs cascade on user delete) survive, attributed to "Deleted user". See lib/services/account.ts.
  deletedAt: timestamp("deleted_at"),
  // Set by POST /me/account/deactivate (TRI-293): hidden from member lists, profiles, notifications and invites
  // until the user signs in again, which clears it (session-create hook in lib/clients/auth.ts)
  deactivatedAt: timestamp("deactivated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
