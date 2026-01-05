import { pgTable, text, timestamp, uuid, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  source: text("source"), // Which page/CTA triggered signup (e.g., "hero", "pricing", "features")
  referrer: text("referrer"), // HTTP referrer
  userAgent: text("user_agent"), // Browser/device info
  metadata: text("metadata"), // JSON string for future flexibility
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Survey enums - aligned with use cases page categories
export const surveyRoleEnum = pgEnum("survey_role", [
  "religious_faith",      // Religious or Faith Community
  "athletic_recreation",  // Athletic or Recreation Group
  "professional_alumni",  // Professional or Alumni Network
  "social_hobby",         // Social or Hobby Group
  "other",
]);

export const surveyPricingEnum = pgEnum("survey_pricing", [
  "free_only",
  "tier_29_49",
  "tier_50_99",
  "tier_100_199",
  "tier_200_plus",
]);

// Survey responses table - tied to waitlist email
export const waitlistSurvey = pgTable("waitlist_survey", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  role: surveyRoleEnum("role").notNull(),
  roleOther: text("role_other"), // For "other" role text input
  useCases: jsonb("use_cases").notNull().$type<string[]>(), // Array of selected use cases
  useCasesOther: text("use_cases_other"), // For "other" use case text
  problemToSolve: text("problem_to_solve").notNull(),
  willingnessToPay: surveyPricingEnum("willingness_to_pay").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
