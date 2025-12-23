import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { checkTribeMembership } from "@/lib/services/permissions";
import { checkPermission } from "@/lib/services/role-permissions";
import { resendTribeInvitation, cancelTribeInvitation } from "@/lib/services/invitation";
import { validateApiRequest, tribeIdParamSchema } from "@/lib/validations/tribe";
import { z } from "zod";

type RouteContext<T extends string> = {
  params: Promise<Record<string, string>>;
};

const invitationIdSchema = z.object({
  invitation_id: z.string().uuid("Invalid invitation ID"),
});

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/invitations/[invitation_id]'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, invitation_id } = await ctx.params;

    // Validate parameters
    const tribeValidation = validateApiRequest(tribeIdParamSchema, { id: tribe_id });
    const invitationValidation = validateApiRequest(invitationIdSchema, { invitation_id });

    if (!tribeValidation.success || !invitationValidation.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Check membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check permission using new three-layer system
    const canInvite = await checkPermission(tribe_id, user.id, 'canInviteMembers');
    if (!canInvite) {
      return NextResponse.json(
        { error: "You don't have permission to manage invitations" },
        { status: 403 }
      );
    }

    // Resend invitation
    const result = await resendTribeInvitation(invitation_id, tribe_id, user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, message: "Invitation resent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resending invitation:", error);
    return NextResponse.json(
      { error: "Failed to resend invitation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/invitations/[invitation_id]'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, invitation_id } = await ctx.params;

    // Validate parameters
    const tribeValidation = validateApiRequest(tribeIdParamSchema, { id: tribe_id });
    const invitationValidation = validateApiRequest(invitationIdSchema, { invitation_id });

    if (!tribeValidation.success || !invitationValidation.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Check membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check permission using new three-layer system
    const canInvite = await checkPermission(tribe_id, user.id, 'canInviteMembers');
    if (!canInvite) {
      return NextResponse.json(
        { error: "You don't have permission to manage invitations" },
        { status: 403 }
      );
    }

    // Cancel invitation
    const result = await cancelTribeInvitation(invitation_id, tribe_id, user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, message: "Invitation cancelled successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    return NextResponse.json(
      { error: "Failed to cancel invitation" },
      { status: 500 }
    );
  }
}
