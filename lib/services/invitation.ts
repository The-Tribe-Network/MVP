import { db } from "@/lib/database/client";
import { tribeInvitation, tribeMember, tribe } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { media } from "@/lib/database/schemas/media";
import { eq, and, or, gt, isNull, desc } from "drizzle-orm";
import type { TribeInvitation } from "@/lib/database/types";
import { sendTribeInvitationEmail } from "@/lib/email/templates/tribe-invitation/send-tribe-invitation-email";
import { sendTribeInvitationRejectedEmail } from "@/lib/email/templates/tribe-invitation-rejected/send-tribe-invitation-rejected-email";
import { sendTribeInvitationAcceptedEmail } from "@/lib/email/templates/tribe-invitation-accepted/send-tribe-invitation-accepted-email";

/**
 * Create invitations for a tribe
 */
export async function createTribeInvitations(
  tribeId: string,
  tribeName: string,
  invitations: Array<{ email: string; role: "admin" | "moderator" | "member" }>,
  invitedBy: string,
  inviterName: string
): Promise<TribeInvitation[]> {
  const createdInvitations: TribeInvitation[] = [];

  for (const invitation of invitations) {
    // Check if user exists by email
    const [invitedUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, invitation.email))
      .limit(1);

    // If user exists, check if they're already a member
    if (invitedUser) {
      const [existingMember] = await db
        .select()
        .from(tribeMember)
        .where(
          and(
            eq(tribeMember.tribeId, tribeId),
            eq(tribeMember.userId, invitedUser.id)
          )
        )
        .limit(1);

      if (existingMember) {
        continue; // Skip if already a member
      }
    }

    // Check if there's already a pending invitation
    const [existingInvitation] = await db
      .select()
      .from(tribeInvitation)
      .where(
        and(
          eq(tribeInvitation.tribeId, tribeId),
          eq(tribeInvitation.email, invitation.email),
          eq(tribeInvitation.status, "pending")
        )
      )
      .limit(1);

    if (existingInvitation) {
      continue; // Skip if already invited
    }

    // Create invitation with 7 day expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [createdInvitation] = await db
      .insert(tribeInvitation)
      .values({
        tribeId,
        email: invitation.email,
        role: invitation.role,
        invitedBy,
        status: "pending",
        expiresAt,
      } as any)
      .returning();

    createdInvitations.push(createdInvitation);

    // Send invitation email (non-blocking - don't fail if email service is unavailable)
    // The invitation is already created in the database, so email failure won't affect it
    try {
      await sendTribeInvitationEmail({
        to: invitation.email,
        tribeName,
        inviterName,
        invitationId: createdInvitation.id,
      });
    } catch (error) {
      // Log error but continue - invitation is already saved in database
      console.error(`Failed to send invitation email to ${invitation.email}:`, error);
      // Invitation record exists, user can still accept it via other means
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
 * Accept an invitation
 */
export async function acceptInvitation(
  invitationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
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

  // Check if user is already a member
  const [existingMember] = await db
    .select()
    .from(tribeMember)
    .where(
      and(
        eq(tribeMember.tribeId, invitation.tribeId),
        eq(tribeMember.userId, userId)
      )
    )
    .limit(1);

  if (existingMember) {
    // Update invitation status to accepted
    await db
      .update(tribeInvitation)
      .set({ status: "accepted" })
      .where(eq(tribeInvitation.id, invitationId));

    return { success: false, error: "User is already a member" };
  }

  // Get user who accepted the invitation
  const [acceptedUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  // Add user as member
  await db.insert(tribeMember)
    .values({
      tribeId: invitation.tribeId,
      userId: userId,
      role: invitation.role,
    } as any);

  // Update invitation status
  await db
    .update(tribeInvitation)
    .set({ status: "accepted" })
    .where(eq(tribeInvitation.id, invitationId));

  // Get tribe and inviter information for email notification
  const [tribeData] = await db
    .select()
    .from(tribe)
    .where(eq(tribe.id, invitation.tribeId))
    .limit(1);

  const [inviter] = await db
    .select()
    .from(user)
    .where(eq(user.id, invitation.invitedBy))
    .limit(1);

  // Send acceptance email to inviter (non-blocking)
  if (tribeData && inviter && acceptedUser) {
    try {
      await sendTribeInvitationAcceptedEmail({
        to: inviter.email,
        tribeName: tribeData.name,
        inviterName: inviter.name || inviter.email || "Someone",
        acceptedUserName: acceptedUser.name || acceptedUser.email || "Someone",
        tribeId: invitation.tribeId,
      });
    } catch (error) {
      console.error(`Failed to send acceptance email:`, error);
    }
  }

  return { success: true };
}

/**
 * Get pending invitations for a user by email
 * Returns invitations with tribe and inviter information
 */
export async function getUserPendingInvitations(userEmail: string) {
  const pendingInvitations = await db
    .select({
      invitation: tribeInvitation,
      tribe: tribe,
      tribeAvatar: media.fileUrl,
      inviter: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(tribeInvitation)
    .innerJoin(tribe, eq(tribeInvitation.tribeId, tribe.id))
    .leftJoin(media, eq(tribe.avatar, media.id))
    .innerJoin(user, eq(tribeInvitation.invitedBy, user.id))
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

  return pendingInvitations.map((item) => ({
    id: item.invitation.id,
    tribeId: item.invitation.tribeId,
    tribeName: item.tribe.name,
    tribeAvatar: item.tribeAvatar || item.tribe.avatar,
    invitedBy: item.inviter.name || item.inviter.email || "Someone",
    inviterId: item.inviter.id,
    role: item.invitation.role,
    createdAt: item.invitation.createdAt,
    expiresAt: item.invitation.expiresAt,
  }));
}

/**
 * Reject an invitation
 */
export async function rejectInvitation(
  invitationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
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

  if (!currentUser || currentUser.email !== invitation.email) {
    return { success: false, error: "You are not authorized to reject this invitation" };
  }

  // Update invitation status to rejected
  await db
    .update(tribeInvitation)
    .set({ status: "rejected" })
    .where(eq(tribeInvitation.id, invitationId));

  // Get tribe and inviter information for email notification
  const [tribeData] = await db
    .select()
    .from(tribe)
    .where(eq(tribe.id, invitation.tribeId))
    .limit(1);

  const [inviter] = await db
    .select()
    .from(user)
    .where(eq(user.id, invitation.invitedBy))
    .limit(1);

  // Send rejection email to inviter (non-blocking)
  if (tribeData && inviter) {
    try {
      await sendTribeInvitationRejectedEmail({
        to: inviter.email,
        tribeName: tribeData.name,
        inviterName: inviter.name || inviter.email || "Someone",
        rejectedUserName: currentUser.name || currentUser.email || "Someone",
        tribeId: invitation.tribeId,
      });
    } catch (error) {
      console.error(`Failed to send rejection email:`, error);
    }
  }

  return { success: true };
}

