/**
 * Seed Utilities
 *
 * Helper functions and constants for database seeding.
 */

import { hashPassword } from "better-auth/crypto";

// ============================================================================
// CONSTANTS
// ============================================================================

/** Your account UUID - added as admin to all seeded tribes */
export const REAL_USER_ID = "72dbb552-5e46-4719-b0c8-91312647a138";

/** Common password for all seed users */
export const SEED_PASSWORD = "SeedPassword123!";

/** Email domain for seed users (for easy identification/cleanup) */
export const SEED_EMAIL_DOMAIN = "@tribe-seed.test";

// ============================================================================
// DATE HELPERS
// ============================================================================

/**
 * Generate a date N days in the past
 * @param days - Number of days ago
 * @returns Date object with randomized time
 */
export function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  // Randomize the hour to make timestamps more realistic (8am - 10pm)
  date.setHours(Math.floor(Math.random() * 14) + 8);
  date.setMinutes(Math.floor(Math.random() * 60));
  date.setSeconds(Math.floor(Math.random() * 60));
  return date;
}

/**
 * Generate a date N days from now
 * @param days - Number of days from now (positive = future, negative = past)
 * @returns Date object with event-appropriate time
 */
export function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  // Set to a reasonable event time
  date.setHours(days > 0 ? 18 : 12); // Future events at 6pm, past at noon
  date.setMinutes(0);
  date.setSeconds(0);
  return date;
}

// ============================================================================
// AVATAR HELPERS
// ============================================================================

/**
 * Generate an avatar URL from randomuser.me
 * @param gender - 'male' or 'female'
 * @param seed - Numeric seed to get consistent avatar
 * @returns Avatar image URL
 */
export function getAvatarUrl(gender: "male" | "female", seed: number): string {
  const folder = gender === "male" ? "men" : "women";
  // randomuser.me has portraits 0-99
  const index = seed % 100;
  return `https://randomuser.me/api/portraits/${folder}/${index}.jpg`;
}

// ============================================================================
// PASSWORD HELPERS
// ============================================================================

/**
 * Hash a password using Better-Auth's scrypt implementation
 * @param password - Plain text password
 * @returns Hashed password string
 */
export async function hashSeedPassword(password: string): Promise<string> {
  return await hashPassword(password);
}

// ============================================================================
// LOGGING HELPERS
// ============================================================================

/**
 * Log a success message with green checkmark
 */
export function logSuccess(message: string): void {
  console.log(`  \x1b[32m✓\x1b[0m ${message}`);
}

/**
 * Log an info message
 */
export function logInfo(message: string): void {
  console.log(`  ${message}`);
}

/**
 * Log a tribe header
 */
export function logTribe(tribeName: string): void {
  console.log(`\n\x1b[36m📦 Seeding tribe: ${tribeName}\x1b[0m`);
}

/**
 * Log the start of seeding
 */
export function logStart(): void {
  console.log("\n\x1b[33m🌱 Starting database seeding...\x1b[0m\n");
}

/**
 * Log completion of seeding
 */
export function logComplete(): void {
  console.log("\n\x1b[32m✅ Database seeding completed!\x1b[0m\n");
}

/**
 * Log an error
 */
export function logError(message: string): void {
  console.error(`\x1b[31m❌ ${message}\x1b[0m`);
}
