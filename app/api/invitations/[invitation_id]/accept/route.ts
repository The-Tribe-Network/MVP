import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { acceptInvitation } from "@/lib/services/invitation";
import { validateApiRequest } from "@/lib/validations/tribe";
import { z } from "zod";

const invitationIdSchema = z.object({
  id: z.string().uuid("Invalid invitation ID format"),
});

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/invitations/[invitation_id]/accept'>
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

    // Accept invitation
    const result = await acceptInvitation(validation.data.id, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to accept invitation" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Invitation accepted successfully" });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}

