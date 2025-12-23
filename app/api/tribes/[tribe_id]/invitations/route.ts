import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getTribeById } from "@/lib/services/tribe";
import { checkTribeMembership } from "@/lib/services/permissions";
import { checkPermission } from "@/lib/services/role-permissions";
import { createTribeInvitations, getTribeInvitations } from "@/lib/services/invitation";
import { tribeIdParamSchema, validateApiRequest } from "@/lib/validations/tribe";
import { inviteTribeMembersSchema } from "@/lib/validations/tribe";

type RouteContext<T extends string> = {
  params: Promise<Record<string, string>>;
};

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/invitations'>
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Validate tribe ID
    const tribeValidation = validateApiRequest(tribeIdParamSchema, { id: tribe_id });
    if (!tribeValidation.success) {
      return NextResponse.json(
        { error: "Invalid tribe ID", details: tribeValidation.error },
        { status: 400 }
      );
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
        { error: "You don't have permission to view invitations" },
        { status: 403 }
      );
    }

    // Fetch invitations
    const invitations = await getTribeInvitations(tribe_id);

    return NextResponse.json(invitations, { status: 200 });
  } catch (error) {
    console.error("Error fetching tribe invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/invitations'>
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Validate tribe ID parameter
    const tribeValidation = validateApiRequest(tribeIdParamSchema, { id: tribe_id });
    if (!tribeValidation.success) {
      return NextResponse.json(
        { error: "Invalid tribe ID", details: tribeValidation.error },
        { status: 400 }
      );
    }

    // Fetch tribe to verify it exists
    const tribeData = await getTribeById(tribeValidation.data.id);
    if (!tribeData) {
      return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
    }

    // Check membership
    const isMember = await checkTribeMembership(tribeValidation.data.id, user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check permission using new three-layer system
    const canInvite = await checkPermission(tribeValidation.data.id, user.id, 'canInviteMembers');
    if (!canInvite) {
      return NextResponse.json(
        { error: "You don't have permission to send invitations" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateApiRequest(inviteTribeMembersSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    // Get inviter name
    const inviterName = user.name || user.email || "Someone";

    // Create invitations
    const createdInvitations = await createTribeInvitations(
      tribeValidation.data.id,
      tribeData.name,
      validation.data.invitations.map((invitation) => ({
        email: invitation.email,
        role: invitation.role || "member",
      })),
      user.id,
      inviterName
    );

    return NextResponse.json(
      {
        success: true,
        message: `Successfully sent ${createdInvitations.length} invitation(s)`,
        invitations: createdInvitations,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending tribe invitations:", error);
    return NextResponse.json(
      { error: "Failed to send invitations" },
      { status: 500 }
    );
  }
}

