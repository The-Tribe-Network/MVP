import { createHmac, timingSafeEqual } from "node:crypto";
import { publicBaseUrl } from "@/lib/constants/urls";

/**
 * Email categories a user can switch off (TRI-344). Security and account emails (codes, password or email
 * changed, account deleted) have no category: they always go out and carry no unsubscribe link.
 */
export const EMAIL_CATEGORIES = {
  eventUpdates: {
    label: "event updates",
    description: "emails when an event you're going to is cancelled or moved, and the day-before reminder",
  },
  digest: {
    label: "the daily digest",
    description: "the daily email of notifications you haven't seen",
  },
} as const;

export type EmailCategory = keyof typeof EMAIL_CATEGORIES;

export function isEmailCategory(value: unknown): value is EmailCategory {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(EMAIL_CATEGORIES, value);
}

function signature(userId: string, category: EmailCategory): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is required to sign unsubscribe links");
  // Domain-separated so this HMAC can never stand in for anything else signed with the same secret
  return createHmac("sha256", secret).update(`email-unsubscribe:v1:${userId}:${category}`).digest("base64url");
}

/**
 * `<userId>.<category>.<hmac>`. It never expires: an unsubscribe link has to keep working in old emails. It only
 * ever switches one category of email for one user, so a leaked link can do nothing else.
 */
export function createUnsubscribeToken(userId: string, category: EmailCategory): string {
  return `${userId}.${category}.${signature(userId, category)}`;
}

export function verifyUnsubscribeToken(token: string | null | undefined): { userId: string; category: EmailCategory } | null {
  const parts = token?.split(".");
  if (!parts || parts.length !== 3) return null;
  const [userId, category, given] = parts;
  if (!isEmailCategory(category) || !/^[0-9a-f-]{36}$/i.test(userId)) return null;
  const expected = Buffer.from(signature(userId, category));
  const actual = Buffer.from(given);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return { userId, category };
}

export function unsubscribeUrl(userId: string, category: EmailCategory): string {
  return `${publicBaseUrl()}/api/email/unsubscribe?token=${encodeURIComponent(createUnsubscribeToken(userId, category))}`;
}

/** RFC 8058 one-click headers; Gmail and Yahoo require them on bulk mail. */
export function unsubscribeHeaders(userId: string, category: EmailCategory): Record<string, string> {
  return {
    "List-Unsubscribe": `<${unsubscribeUrl(userId, category)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
