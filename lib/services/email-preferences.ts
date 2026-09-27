import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { tribeMember, tribeMemberPreference, user, userEmailPreference } from "@/lib/database/schemas";
import { excludeBlocked } from "@/lib/services/blocks";
import type { EmailCategory } from "@/lib/email/unsubscribe";

/**
 * Email opt-outs and the skip rules every alpha email shares (TRI-344).
 *
 * Opt-outs live in `user_email_preference` (no row = everything on); the only control in the alpha is the
 * unsubscribe link in each email.
 */

const COLUMN = {
  eventUpdates: userEmailPreference.eventUpdates,
  digest: userEmailPreference.digest,
} as const;

/** Switch one category on or off for a user (the unsubscribe link, and its undo). */
export async function setEmailOptIn(userId: string, category: EmailCategory, enabled: boolean): Promise<void> {
  const field = category === "eventUpdates" ? { eventUpdates: enabled } : { digest: enabled };
  await db
    .insert(userEmailPreference)
    .values({ userId, ...field })
    .onConflictDoUpdate({ target: userEmailPreference.userId, set: { ...field, updatedAt: new Date() } });
}

export interface EmailRecipient {
  id: string;
  email: string;
  name: string;
  displayName: string | null;
  timezone: string | null;
}

export interface EmailRecipientFilter {
  category: EmailCategory;
  /** Whoever caused the email (the host who cancelled, …): members blocked either way with them are skipped */
  actorId?: string | null;
  /** Skip members who muted this tribe (NOTIF-04). Event updates don't pass it: a cancelled event still reaches you */
  mutedTribeId?: string;
}

/**
 * Of `userIds`, the users who should get an email of `category`. Skipped: deleted or deactivated accounts,
 * unverified addresses, anyone who opted out of the category, anyone blocked either way with the actor, and,
 * when asked, anyone who muted the tribe. One query however many ids.
 */
export async function emailRecipients(userIds: string[], filter: EmailRecipientFilter): Promise<EmailRecipient[]> {
  const ids = [...new Set(userIds)].filter((id) => id !== filter.actorId);
  if (ids.length === 0) return [];
  const optedIn = COLUMN[filter.category];

  return db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      timezone: user.timezone,
    })
    .from(user)
    .leftJoin(userEmailPreference, eq(userEmailPreference.userId, user.id))
    .where(
      and(
        inArray(user.id, ids),
        isNull(user.deletedAt),
        isNull(user.deactivatedAt),
        eq(user.emailVerified, true),
        sql`coalesce(${optedIn}, true)`,
        excludeBlocked(filter.actorId, user.id),
        filter.mutedTribeId
          ? sql`not exists (select 1 from ${tribeMemberPreference} tmp join ${tribeMember} tm on tm.id = tmp.tribe_member_id
              where tmp.user_id = ${user.id} and tm.tribe_id = ${filter.mutedTribeId}::uuid and tmp.notifications_muted)`
          : undefined
      )
    );
}
