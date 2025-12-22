import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getTribeById } from "@/lib/services/tribe";
import { checkTribeMembership } from "@/lib/services/permissions";
import { createTribeInvitations } from "@/lib/services/invitation";
import { tribeIdParamSchema, validateApiRequest } from "@/lib/validations/tribe";
import { inviteTribeMembersSchema } from "@/lib/validations/tribe";

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

    // Check if user is a member of the tribe
    const isMember = await checkTribeMembership(tribeValidation.data.id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of this tribe to send invitations" },
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

