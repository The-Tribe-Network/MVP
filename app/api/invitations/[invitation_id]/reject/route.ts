import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { rejectInvitation } from "@/lib/services/invitation";
import { validateApiRequest } from "@/lib/validations/tribe";
import { z } from "zod";

const invitationIdSchema = z.object({
  id: z.string().uuid("Invalid invitation ID format"),
});

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/invitations/[invitation_id]/reject'>
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invitation_id } = await ctx.params;

    // Validate invitation ID parameter
    const validation = validateApiRequest(invitationIdSchema, { id: invitation_id });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid invitation ID", details: validation.error },
        { status: 400 }
      );
    }

    // Reject invitation
    const result = await rejectInvitation(validation.data.id, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to reject invitation" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Invitation rejected successfully" });
  } catch (error) {
    console.error("Error rejecting invitation:", error);
    return NextResponse.json(
      { error: "Failed to reject invitation" },
      { status: 500 }
    );
  }
}

