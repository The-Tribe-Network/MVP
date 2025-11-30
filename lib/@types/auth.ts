import { auth } from "@/lib/clients/auth"
import { user, session, account, verification } from "@/lib/database/schemas"

// Drizzle schema types (includes all database fields)
export type InsertUser = typeof user.$inferInsert
export type SelectUser = typeof user.$inferSelect

export type BetterAuthSession = typeof auth.$Infer.Session
// Base Better Auth user type (includes id, email, name, etc. from Better Auth)
type BaseBetterAuthUser = typeof auth.$Infer.Session.user
// Define BetterAuthUser with all fields from database schema
// This ensures type safety - Better Auth's additionalFields should include these,
// but we extend explicitly to ensure TypeScript recognizes them immediately
export type BetterAuthUser = BaseBetterAuthUser & {
  username: SelectUser['username'];
  displayName: SelectUser['displayName'];
  bio: SelectUser['bio'];
  location: SelectUser['location'];
  profileCompleted: SelectUser['profileCompleted'];
}

// Extended user type with profile fields
export type UserWithProfile = SelectUser & {
  displayName: string;
  bio: string | null;
  location: string;
  profileCompleted: boolean;
}

export type InsertSession = typeof session.$inferInsert
export type SelectSession = typeof session.$inferSelect

export type InsertAccount = typeof account.$inferInsert
export type SelectAccount = typeof account.$inferSelect

export type InsertVerification = typeof verification.$inferInsert
export type SelectVerification = typeof verification.$inferSelect