import { db } from "@/lib/database/client";
import { tribeInvitation, tribeMember } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { eq, and } from "drizzle-orm";
import type { TribeInvitation } from "@/lib/database/types";
import { sendTribeInvitationEmail } from "@/lib/email/templates/tribe-invitation/send-tribe-invitation-email";

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

  return { success: true };
}

