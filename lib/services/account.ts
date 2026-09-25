import { and, asc, eq, inArray, or, sql } from "drizzle-orm";

import { db, getDbTransaction } from "@/lib/database/client";
import {
  account,
  draft,
  event,
  eventAttendee,
  eventCoHost,
  media,
  notification,
  session,
  tribe,
  tribeMember,
  tribeMemberPermission,
  tribeMemberPreference,
  user,
  userPrivacy,
  userSocialLink,
  verification,
} from "@/lib/database/schemas";
import { destroyMediaAsset } from "./media";

/**
 * Account deletion (TRI-16, USET-03 danger zone; owner decision 2026-09-25: delete anonymizes).
 *
 * The `user` row is kept as a PII-scrubbed tombstone (`deleted_at` set) instead of being deleted: post,
 * comment and event FKs to user.id cascade, so deleting the row would take the user's contributions out of
 * every tribe, and tribe.created_by / tribe_invitation.invited_by / *.set_by / *.updated_by restrict it.
 * The tombstone renders as "Deleted user" wherever content joins its author, cannot sign in (no credential
 * or OAuth account, unroutable email, and the session-create hook refuses it), and is in no member list.
 */

export const DELETED_USER_NAME = "Deleted user";

/** Unique (the email column is), unroutable (RFC 2606 `.invalid`), and recognizably a tombstone. */
export function tombstoneEmail(userId: string) {
  return `deleted+${userId}@deleted.invalid`;
}

export type OwnedTribe = { id: string; name: string };

export type DeleteAccountResult =
  | { ok: true; removedMedia: number }
  | { ok: false; code: "OWNS_TRIBES"; tribes: OwnedTribe[] };

/** Tribes the user owns; deletion is blocked until each is transferred or deleted. */
export async function getOwnedTribes(userId: string): Promise<OwnedTribe[]> {
  return db
    .select({ id: tribe.id, name: tribe.name })
    .from(tribeMember)
    .innerJoin(tribe, eq(tribeMember.tribeId, tribe.id))
    .where(and(eq(tribeMember.userId, userId), eq(tribeMember.role, "owner")))
    .orderBy(asc(tribe.name), asc(tribe.id));
}

/**
 * The user's uploads that go with the account: everything they uploaded (post photos, gallery and album
 * photos, their avatar) except assets the tribe or an event now wears — a tribe avatar / banner / featured
 * image, or an event cover — which belong to the tribe and stay.
 */
async function mediaToRemove(userId: string) {
  const rows = await db
    .select({ id: media.id, publicId: media.publicId, fileUrl: media.fileUrl })
    .from(media)
    .where(eq(media.uploadedBy, userId));
  if (rows.length === 0) return rows;

  const ids = rows.map((r) => r.id);
  const [tribeAssets, eventCovers] = await Promise.all([
    db
      .select({ avatar: tribe.avatar, banner: tribe.banner, featured: tribe.featuredMediaId })
      .from(tribe)
      .where(or(inArray(tribe.avatar, ids), inArray(tribe.banner, ids), inArray(tribe.featuredMediaId, ids))),
    db
      .select({ url: event.coverImageUrl })
      .from(event)
      .where(inArray(event.coverImageUrl, rows.map((r) => r.fileUrl))),
  ]);
  const keepIds = new Set(tribeAssets.flatMap((t) => [t.avatar, t.banner, t.featured]));
  const keepUrls = new Set(eventCovers.map((e) => e.url));
  return rows.filter((r) => !keepIds.has(r.id) && !keepUrls.has(r.fileUrl));
}

/**
 * DELETE /me/account. Blocked while the user owns a tribe. Otherwise, in one transaction:
 *
 * removed — sessions (so the bearer stops working at once), auth accounts / password, verification
 *   codes for their email, social links, privacy row, every tribe membership with its permission overrides
 *   and preferences, RSVPs and co-host slots, drafts, notifications addressed to them, and their media rows
 *   (with each photo's post / album / like links); the Cloudinary assets are destroyed after commit.
 * scrubbed — name → "Deleted user"; email → deleted+<id>@deleted.invalid; displayName, username, image,
 *   bio, location, phone, timezone, birthday → null; emailVerified / profileCompleted false; deleted_at set.
 * kept — posts, comments, events, polls and albums they created, their likes and poll votes, activity rows
 *   and notifications they caused for others: all now attributed to the tombstone.
 *
 * Safe to run again on a tombstone (every step is a no-op or re-scrub; deleted_at keeps its first value).
 */
export async function deleteAccount(userId: string): Promise<DeleteAccountResult> {
  const owned = await getOwnedTribes(userId);
  if (owned.length > 0) return { ok: false, code: "OWNS_TRIBES", tribes: owned };

  const [current] = await db.select({ email: user.email }).from(user).where(eq(user.id, userId)).limit(1);
  const removable = await mediaToRemove(userId);
  const mediaIds = removable.map((m) => m.id);

  await getDbTransaction().transaction(async (tx) => {
    // Sessions first: the bearer is dead the moment this commits
    await tx.delete(session).where(eq(session.userId, userId));
    await tx.delete(account).where(eq(account.userId, userId));
    if (current) {
      // Email-verification / reset OTPs are keyed "<type>-otp-<email>"; drop any for this address
      await tx
        .delete(verification)
        .where(
          or(
            eq(verification.identifier, current.email),
            sql`right(${verification.identifier}, ${current.email.length + 1}) = ${"-" + current.email}`
          )
        );
    }

    await tx.delete(userSocialLink).where(eq(userSocialLink.userId, userId));
    await tx.delete(userPrivacy).where(eq(userPrivacy.userId, userId));

    await tx.delete(tribeMemberPermission).where(eq(tribeMemberPermission.userId, userId));
    await tx.delete(tribeMemberPreference).where(eq(tribeMemberPreference.userId, userId));
    await tx.delete(tribeMember).where(eq(tribeMember.userId, userId));
    await tx.delete(eventAttendee).where(eq(eventAttendee.userId, userId));
    await tx.delete(eventCoHost).where(eq(eventCoHost.userId, userId));
    await tx.delete(draft).where(eq(draft.userId, userId));
    await tx.delete(notification).where(eq(notification.userId, userId));

    // post_media / album_media / media_like / activity rows cascade; album covers are set null
    if (mediaIds.length > 0) await tx.delete(media).where(inArray(media.id, mediaIds));

    await tx
      .update(user)
      .set({
        name: DELETED_USER_NAME,
        email: tombstoneEmail(userId),
        emailVerified: false,
        displayName: null,
        username: null,
        image: null,
        bio: null,
        location: null,
        phone: null,
        timezone: null,
        birthday: null,
        profileCompleted: false,
        deletedAt: sql`coalesce(${user.deletedAt}, now())`,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));
  });

  // After commit: a Cloudinary failure only leaves an orphaned asset, never a half-deleted account
  await Promise.all(removable.map((m) => destroyMediaAsset(m)));

  return { ok: true, removedMedia: removable.length };
}
