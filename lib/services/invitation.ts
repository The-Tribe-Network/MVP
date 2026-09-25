import { db, getDbTransaction } from "@/lib/database/client";
import { tribeInvitation, tribeMember, tribe } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { media } from "@/lib/database/schemas/media";
import { event } from "@/lib/database/schemas/event";
import { eq, and, or, gt, isNull, desc, inArray, sql, aliasedTable } from "drizzle-orm";
import type { TribeInvitation } from "@/lib/database/types";
import { sendTribeInvitationEmail } from "@/lib/email/templates/tribe-invitation/send-tribe-invitation-email";
import { sendTribeInvitationRejectedEmail } from "@/lib/email/templates/tribe-invitation-rejected/send-tribe-invitation-rejected-email";
import { sendTribeInvitationAcceptedEmail } from "@/lib/email/templates/tribe-invitation-accepted/send-tribe-invitation-accepted-email";
import { userPreviewColumns } from "@/lib/database/user-columns";
import { appLink, notify, type NotifyExecutor } from "./notifications";

/**
 * Create invitations for a tribe
 * OPTIMIZED: Batch queries instead of N+1 loops
 * Reduces from 4N database calls to ~5 database calls total
 */
/**
 * TRI-187 "invited you to {tribe}", to an invitee who has an account. The tribe is set but the user hasn't joined,
 * so the feed puts it in the personal group (TRI-7). One row per invitation: a resend collapses into it while unread.
 */
async function notifyInvitee(
  tx: NotifyExecutor,
  invitationId: string,
  tribeId: string,
  tribeName: string,
  inviterId: string,
  inviteeId: string
) {
  await notify(tx, {
    type: "invite",
    actorId: inviterId,
    tribeId,
    entityType: "invitation",
    entityId: invitationId,
    recipients: [inviteeId],
    title: `invited you to ${tribeName}`,
    message: "",
    link: appLink.invite(invitationId),
    collapse: true,
  });
}

export async function createTribeInvitations(
  tribeId: string,
  tribeName: string,
  invitations: Array<{ email: string; role: "admin" | "moderator" | "member" }>,
  invitedBy: string,
  inviterName: string
): Promise<TribeInvitation[]> {
  if (invitations.length === 0) return [];

  const emails = invitations.map(inv => inv.email);

  // Batch fetch all data in parallel (3 queries instead of 3N queries)
  const [existingUsers, existingMembers, existingInvitations] = await Promise.all([
    // Get all users by email
    db.select().from(user).where(inArray(user.email, emails)),

    // Get all existing members for this tribe whose emails match
    db.select({
      userId: tribeMember.userId,
      userEmail: user.email,
    })
    .from(tribeMember)
    .innerJoin(user, eq(tribeMember.userId, user.id))
    .where(
      and(
        eq(tribeMember.tribeId, tribeId),
        inArray(user.email, emails)
      )
    ),

    // Get all pending invitations for this tribe
    db.select()
    .from(tribeInvitation)
    .where(
      and(
        eq(tribeInvitation.tribeId, tribeId),
        inArray(tribeInvitation.email, emails),
        eq(tribeInvitation.status, "pending")
      )
    ),
  ]);

  // Create lookup sets for fast checking
  const existingMemberEmails = new Set(existingMembers.map(m => m.userEmail));
  const existingInvitationEmails = new Set(existingInvitations.map(inv => inv.email));
  // TRI-293: nobody can invite a deactivated account (skipped like an existing member)
  const deactivatedEmails = new Set(existingUsers.filter(u => u.deactivatedAt).map(u => u.email));

  // Filter invitations to only valid ones
  const validInvitations = invitations.filter(invitation => {
    // Skip if already a member
    if (existingMemberEmails.has(invitation.email)) return false;

    // Skip if the account is deactivated
    if (deactivatedEmails.has(invitation.email)) return false;

    // Skip if already has pending invitation
    if (existingInvitationEmails.has(invitation.email)) return false;

    return true;
  });

  if (validInvitations.length === 0) return [];

  // Batch insert all valid invitations (1 query instead of N queries)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // TRI-187: invitees who already have an account also get an in-app row, in the same transaction
  const userIdByEmail = new Map(existingUsers.map((u) => [u.email, u.id]));
  const createdInvitations = await getDbTransaction().transaction(async (tx) => {
    const rows = await tx
      .insert(tribeInvitation)
      .values(
        validInvitations.map(invitation => ({
          tribeId,
          email: invitation.email,
          role: invitation.role,
          invitedBy,
          status: "pending" as const,
          expiresAt,
        }))
      )
      .returning();
    for (const row of rows) {
      const inviteeId = userIdByEmail.get(row.email);
      if (inviteeId) await notifyInvitee(tx, row.id, tribeId, tribeName, invitedBy, inviteeId);
    }
    return rows;
  });

  // Send invitation emails (non-blocking)
  for (const createdInvitation of createdInvitations) {
    try {
      await sendTribeInvitationEmail({
        to: createdInvitation.email,
        tribeName,
        inviterName,
        invitationId: createdInvitation.id,
      });
    } catch (error) {
      console.error(`Failed to send invitation email to ${createdInvitation.email}:`, error);
    }
  }

  return createdInvitations;
}

/**
 * Get invitation by ID
 */
export async function getInvitationById(id: string): Promise<TribeInvitation | null> {
  const [invitation] = await db
    .select()
    .from(tribeInvitation)
    .where(eq(tribeInvitation.id, id))
    .limit(1);

  return invitation || null;
}

/**
 * Get all invitations for a tribe with inviter information
 * OPTIMIZED: Single query with join (not N+1 queries)
 */
export async function getTribeInvitations(tribeId: string) {
  const invitations = await db
    .select({
      id: tribeInvitation.id,
      tribeId: tribeInvitation.tribeId,
      email: tribeInvitation.email,
      role: tribeInvitation.role,
      status: tribeInvitation.status,
      expiresAt: tribeInvitation.expiresAt,
      createdAt: tribeInvitation.createdAt,
      inviterName: user.name,
      inviterEmail: user.email,
      inviterId: user.id,
    })
    .from(tribeInvitation)
    .innerJoin(user, eq(tribeInvitation.invitedBy, user.id))
    .where(eq(tribeInvitation.tribeId, tribeId))
    .orderBy(desc(tribeInvitation.createdAt));

  return invitations;
}

/**
 * Resend a tribe invitation
 * Updates existing invitation record (status and expiry)
 */
export async function resendTribeInvitation(
  invitationId: string,
  tribeId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Get invitation and validate
  const invitation = await getInvitationById(invitationId);

  if (!invitation) {
    return { success: false, error: "Invitation not found" };
  }

  if (invitation.tribeId !== tribeId) {
    return { success: false, error: "Invitation does not belong to this tribe" };
  }

  if (!['pending', 'expired'].includes(invitation.status)) {
    return { success: false, error: "Can only resend pending or expired invitations" };
  }

  // Update status and expiry (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Fetch tribe and inviter info for email
  const [tribeData, inviter, invitee] = await Promise.all([
    db.select().from(tribe).where(eq(tribe.id, tribeId)).limit(1),
    db.select().from(user).where(eq(user.id, userId)).limit(1),
    db.select({ id: user.id }).from(user).where(eq(user.email, invitation.email)).limit(1),
  ]);

  // A resend collapses into the invitee's unread row (TRI-187); once read, it is a fresh nudge
  await getDbTransaction().transaction(async (tx) => {
    await tx.update(tribeInvitation).set({ status: "pending", expiresAt }).where(eq(tribeInvitation.id, invitationId));
    if (invitee[0] && tribeData[0]) {
      await notifyInvitee(tx, invitationId, tribeId, tribeData[0].name, userId, invitee[0].id);
    }
  });

  // Resend email (non-blocking)
  if (tribeData[0] && inviter[0]) {
    try {
      await sendTribeInvitationEmail({
        to: invitation.email,
        tribeName: tribeData[0].name,
        inviterName: inviter[0].name || inviter[0].email || "Someone",
        invitationId: invitation.id,
      });
    } catch (error) {
      console.error(`Failed to resend invitation email:`, error);
    }
  }

  return { success: true };
}

/**
 * Cancel a pending tribe invitation
 * Marks invitation as rejected
 */
export async function cancelTribeInvitation(
  invitationId: string,
  tribeId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const invitation = await getInvitationById(invitationId);

  if (!invitation) {
    return { success: false, error: "Invitation not found" };
  }

  if (invitation.tribeId !== tribeId) {
    return { success: false, error: "Invitation does not belong to this tribe" };
  }

  if (invitation.status !== 'pending') {
    return { success: false, error: "Can only cancel pending invitations" };
  }

  // Update status to rejected
  await db
    .update(tribeInvitation)
    .set({ status: "rejected" })
    .where(eq(tribeInvitation.id, invitationId));

  return { success: true };
}

/**
 * Whether the signed-in user is the person the invitation was addressed to.
 * Emails compare case-insensitively: the inviter typed the address, the user signed up with it.
 */
function isInvitee(userEmail: string | null | undefined, invitation: TribeInvitation): boolean {
  return !!userEmail && userEmail.trim().toLowerCase() === invitation.email.trim().toLowerCase();
}

/**
 * Accept an invitation
 * OPTIMIZED: Reduces from 7 DB calls to 4 DB calls (with 2 in parallel)
 */
export async function acceptInvitation(
  invitationId: string,
  userId: string
): Promise<{ success: boolean; error?: string; status?: number }> {
  const invitation = await getInvitationById(invitationId);

  if (!invitation) {
    return { success: false, error: "Invitation not found" };
  }

  if (invitation.status !== "pending") {
    return { success: false, error: "Invitation is not pending" };
  }

  if (invitation.expiresAt && invitation.expiresAt < new Date()) {
    return { success: false, error: "Invitation has expired" };
  }

  // Check if user is already a member and get user info in parallel
  const [existingMember, acceptedUser] = await Promise.all([
    db.select()
      .from(tribeMember)
      .where(
        and(
          eq(tribeMember.tribeId, invitation.tribeId),
          eq(tribeMember.userId, userId)
        )
      )
      .limit(1),
    db.select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1),
  ]);

  // Only the invitee may accept (TRI-196). Checked before the already-a-member branch so a
  // stranger can't flip someone else's invitation to accepted either.
  if (!acceptedUser[0] || !isInvitee(acceptedUser[0].email, invitation)) {
    return { success: false, error: "You are not authorized to accept this invitation", status: 403 };
  }

  if (existingMember[0]) {
    // Update invitation status to accepted
    await db
      .update(tribeInvitation)
      .set({ status: "accepted" })
      .where(eq(tribeInvitation.id, invitationId));

    return { success: false, error: "User is already a member" };
  }

  // Add user as member and update invitation in a transaction
  // OPTIMIZED: Wrapped in transaction to ensure data consistency
  // Must use the WebSocket driver — the neon-http `db` has no transaction support
  const [tribeData, inviter] = await Promise.all([
    db.select().from(tribe).where(eq(tribe.id, invitation.tribeId)).limit(1),
    db.select().from(user).where(eq(user.id, invitation.invitedBy)).limit(1),
  ]);

  await getDbTransaction().transaction(async (tx) => {
    await tx.insert(tribeMember).values({
      tribeId: invitation.tribeId,
      userId: userId,
      role: invitation.role,
    } as any);

    await tx.update(tribeInvitation)
      .set({ status: "accepted" })
      .where(eq(tribeInvitation.id, invitationId));

    // TRI-187: the inviter hears it was accepted
    await notify(tx, {
      type: "invite",
      actorId: userId,
      tribeId: invitation.tribeId,
      entityType: "invitation",
      entityId: invitationId,
      recipients: [invitation.invitedBy],
      title: `accepted your invite to ${tribeData[0]?.name ?? "your tribe"}`,
      message: "",
      link: appLink.tribe(invitation.tribeId),
    });
  });

  // Send acceptance email to inviter (non-blocking)
  if (tribeData[0] && inviter[0] && acceptedUser[0]) {
    try {
      await sendTribeInvitationAcceptedEmail({
        to: inviter[0].email,
        tribeName: tribeData[0].name,
        inviterName: inviter[0].name || inviter[0].email || "Someone",
        acceptedUserName: acceptedUser[0].name || acceptedUser[0].email || "Someone",
        tribeId: invitation.tribeId,
      });
    } catch (error) {
      console.error(`Failed to send acceptance email:`, error);
    }
  }

  return { success: true };
}

/** Rows of `count(*)` per tribe id, as a map with 0 for tribes that have none. */
function countMap(rows: { tribeId: string | null; count: number }[]): Map<string, number> {
  return new Map(rows.filter((r) => r.tribeId !== null).map((r) => [r.tribeId as string, r.count]));
}

/**
 * Pending invitations addressed to `userEmail` (mobile contract: `PendingInvitation[]`, TRIBE-02).
 *
 * Each item carries the flat legacy fields the web app reads (`tribeName`, `tribeAvatar`,
 * `invitedBy`, `inviterId`) plus, for the mobile invite screen (TRI-147):
 * - `tribe`: the contract's `TribeWithCounts` — the tribe row with `avatarUrl` / `bannerUrl`
 *   resolved, its creator as a UserPreview, and `memberCount` / `eventCount` / `mediaCount`.
 *   The three counts are one grouped query each over every tribe on the page, never per row.
 * - `inviter`: the inviter as a UserPreview (name and avatar; `id`, `name`, `image` only —
 *   never the email).
 */
export async function getUserPendingInvitations(userEmail: string) {
  const avatarMedia = aliasedTable(media, "avatar_media");
  const bannerMedia = aliasedTable(media, "banner_media");
  const inviter = aliasedTable(user, "inviter");
  const creator = aliasedTable(user, "creator");

  const rows = await db
    .select({
      invitation: {
        id: tribeInvitation.id,
        tribeId: tribeInvitation.tribeId,
        role: tribeInvitation.role,
        createdAt: tribeInvitation.createdAt,
        expiresAt: tribeInvitation.expiresAt,
      },
      tribe: {
        id: tribe.id,
        name: tribe.name,
        description: tribe.description,
        avatar: tribe.avatar,
        banner: tribe.banner,
        color: tribe.color,
        featuredMediaId: tribe.featuredMediaId,
        location: tribe.location,
        privacy: tribe.privacy,
        category: tribe.category,
        isFeatured: tribe.isFeatured,
        isTrending: tribe.isTrending,
        createdBy: tribe.createdBy,
        createdAt: tribe.createdAt,
        updatedAt: tribe.updatedAt,
      },
      avatarUrl: avatarMedia.fileUrl,
      bannerUrl: bannerMedia.fileUrl,
      creator: { id: creator.id, name: creator.name, displayName: creator.displayName, image: creator.image },
      inviter: { id: inviter.id, name: inviter.name, displayName: inviter.displayName, image: inviter.image },
    })
    .from(tribeInvitation)
    .innerJoin(tribe, eq(tribeInvitation.tribeId, tribe.id))
    .leftJoin(avatarMedia, eq(tribe.avatar, avatarMedia.id))
    .leftJoin(bannerMedia, eq(tribe.banner, bannerMedia.id))
    .innerJoin(creator, eq(tribe.createdBy, creator.id))
    .innerJoin(inviter, eq(tribeInvitation.invitedBy, inviter.id))
    .where(
      and(
        eq(tribeInvitation.email, userEmail),
        eq(tribeInvitation.status, "pending"),
        or(
          isNull(tribeInvitation.expiresAt),
          gt(tribeInvitation.expiresAt, new Date())
        )
      )
    )
    .orderBy(desc(tribeInvitation.createdAt));

  // TribeWithCounts: three grouped counts over the page's tribes (a constant number of queries)
  const tribeIds = [...new Set(rows.map((r) => r.tribe.id))];
  const [memberCounts, eventCounts, mediaCounts] = tribeIds.length === 0
    ? [[], [], []]
    : await Promise.all([
      db
        .select({ tribeId: tribeMember.tribeId, count: sql<number>`count(*)::int` })
        .from(tribeMember)
        .where(inArray(tribeMember.tribeId, tribeIds))
        .groupBy(tribeMember.tribeId),
      db
        .select({ tribeId: event.tribeId, count: sql<number>`count(*)::int` })
        .from(event)
        .where(inArray(event.tribeId, tribeIds))
        .groupBy(event.tribeId),
      db
        .select({ tribeId: media.tribeId, count: sql<number>`count(*)::int` })
        .from(media)
        .where(inArray(media.tribeId, tribeIds))
        .groupBy(media.tribeId),
    ]);
  const members = countMap(memberCounts);
  const events = countMap(eventCounts);
  const mediaItems = countMap(mediaCounts);

  return rows.map((item) => ({
    id: item.invitation.id,
    tribeId: item.invitation.tribeId,
    tribeName: item.tribe.name,
    tribeAvatar: item.avatarUrl || item.tribe.avatar,
    invitedBy: item.inviter.name || "Someone",
    inviterId: item.inviter.id,
    role: item.invitation.role,
    createdAt: item.invitation.createdAt,
    expiresAt: item.invitation.expiresAt,
    inviter: item.inviter,
    tribe: {
      ...item.tribe,
      avatarUrl: item.avatarUrl ?? null,
      bannerUrl: item.bannerUrl ?? null,
      creator: item.creator,
      memberCount: members.get(item.tribe.id) ?? 0,
      eventCount: events.get(item.tribe.id) ?? 0,
      mediaCount: mediaItems.get(item.tribe.id) ?? 0,
    },
  }));
}

/**
 * Reject an invitation
 * OPTIMIZED: Reduces DB calls by parallelizing queries
 */
export async function rejectInvitation(
  invitationId: string,
  userId: string
): Promise<{ success: boolean; error?: string; status?: number }> {
  const invitation = await getInvitationById(invitationId);

  if (!invitation) {
    return { success: false, error: "Invitation not found" };
  }

  if (invitation.status !== "pending") {
    return { success: false, error: "Invitation is not pending" };
  }

  // Get user to verify email matches
  const [currentUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!currentUser || !isInvitee(currentUser.email, invitation)) {
    return { success: false, error: "You are not authorized to reject this invitation", status: 403 };
  }

  // Update invitation status and get tribe/inviter info in parallel
  const [[, tribeData, inviter]] = await Promise.all([
    Promise.all([
      db.update(tribeInvitation)
        .set({ status: "rejected" })
        .where(eq(tribeInvitation.id, invitationId)),
      db.select().from(tribe).where(eq(tribe.id, invitation.tribeId)).limit(1),
      db.select().from(user).where(eq(user.id, invitation.invitedBy)).limit(1),
    ]),
  ]);

  // Send rejection email to inviter (non-blocking)
  if (tribeData[0] && inviter[0]) {
    try {
      await sendTribeInvitationRejectedEmail({
        to: inviter[0].email,
        tribeName: tribeData[0].name,
        inviterName: inviter[0].name || inviter[0].email || "Someone",
        rejectedUserName: currentUser.name || currentUser.email || "Someone",
        tribeId: invitation.tribeId,
      });
    } catch (error) {
      console.error(`Failed to send rejection email:`, error);
    }
  }

  return { success: true };
}

