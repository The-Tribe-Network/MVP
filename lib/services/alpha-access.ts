import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { alphaAccess } from "@/lib/database/schemas";
import type { AlphaAccessSource } from "@/lib/database/schemas/alpha-access";
import type { AccessRequestNotice } from "@/lib/email/alpha-access-emails";

/**
 * The alpha gate (TRI-370). Sign-up stays open, but with `ALPHA_GATE_ENABLED=true` a session is only created for an
 * email the owner approved in the admin app (TRI-372), or for `PLATFORM_OWNER_EMAIL`. Everyone else gets
 * 403 ALPHA_ACCESS_PENDING and a `requested` row the owner sees in the admin app.
 *
 * Off unless the env var is exactly "true", so local and Development (seed users) keep working.
 */

export const ALPHA_ACCESS_PENDING = {
  code: "ALPHA_ACCESS_PENDING",
  message: "You're on the alpha list. We'll email you when you're in.",
} as const;

export function alphaGateEnabled(): boolean {
  return process.env.ALPHA_GATE_ENABLED === "true";
}

const normalize = (email: string) => email.trim().toLowerCase();

function isPlatformOwner(email: string): boolean {
  const owner = process.env.PLATFORM_OWNER_EMAIL?.trim();
  return !!owner && normalize(owner) === normalize(email);
}

type Requester = { id: string; email: string; name: string | null };

/**
 * Adds a `requested` row for this email unless it already has one (any status), and links the account to a row
 * the owner pre-approved before it existed. Safe to call on every sign-up and blocked sign-in.
 *
 * A new row also emails the owner (TRI-373), once: `owner_notified_at` records it. A failed send is logged and
 * never fails the sign-up or sign-in that got here.
 */
export async function recordAccessRequest(requester: Requester, source: AlphaAccessSource): Promise<void> {
  const normalized = normalize(requester.email);
  // The only other unique index is lower(email), so this skips an email that already has a row
  const [created] = await db
    .insert(alphaAccess)
    .values({ email: normalized, status: "requested", userId: requester.id, source })
    .onConflictDoNothing()
    .returning({ id: alphaAccess.id });
  await db
    .update(alphaAccess)
    .set({ userId: requester.id })
    .where(and(sql`lower(${alphaAccess.email}) = ${normalized}`, isNull(alphaAccess.userId)));
  if (created && !isPlatformOwner(normalized)) {
    await notifyOwner(created.id, { email: normalized, name: requester.name, source });
  }
}

async function notifyOwner(rowId: string, request: AccessRequestNotice): Promise<void> {
  const owner = process.env.PLATFORM_OWNER_EMAIL?.trim();
  if (!owner) {
    console.warn("[alpha-access] PLATFORM_OWNER_EMAIL is not set; owner not emailed about a new request");
    return;
  }
  try {
    // Imported here so a missing RESEND_API_KEY (the client throws at import) cannot break sign-up
    const { sendAccessRequestEmail } = await import("@/lib/email/alpha-access-emails");
    await sendAccessRequestEmail(owner, request);
    await db.update(alphaAccess).set({ ownerNotifiedAt: sql`now()` }).where(eq(alphaAccess.id, rowId));
  } catch (error) {
    console.error("[alpha-access] owner email failed:", error instanceof Error ? error.message : error);
  }
}

/**
 * The source for a row the gate writes. A blocked sign-up never reaches the user-created hook (Better-Auth drops
 * its queued after-hooks when the request fails), so an account made moments ago counts as a sign-up.
 */
export function gateSource(userCreatedAt: Date): AlphaAccessSource {
  return Date.now() - userCreatedAt.getTime() < 10 * 60 * 1000 ? "sign_up" : "sign_in";
}

/** Whether this email may have a session: the platform owner always, anyone else only once approved. */
export async function hasAlphaAccess(email: string): Promise<boolean> {
  if (isPlatformOwner(email)) return true;
  const [row] = await db
    .select({ status: alphaAccess.status })
    .from(alphaAccess)
    .where(sql`lower(${alphaAccess.email}) = ${normalize(email)}`)
    .limit(1);
  return row?.status === "approved";
}
