import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { leaveTribe } from "@/lib/services/tribe";
import { checkTribeMembership } from "@/lib/services/permissions";
import { tribeIdParamSchema, validateApiRequest } from "@/lib/validations/tribe";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tribe_id: string }> }
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await params;

    // Validate tribe ID parameter
    const validation = validateApiRequest(tribeIdParamSchema, { id: tribe_id });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid tribe ID", details: validation.error },
        { status: 400 }
      );
    }

    // Check if user is a member of the tribe
    const isMember = await checkTribeMembership(validation.data.id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of this tribe to leave it" },
        { status: 403 }
      );
    }

    // Attempt to leave the tribe
    const result = await leaveTribe(validation.data.id, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to leave tribe" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Successfully left tribe" });
  } catch (error) {
    console.error("Error leaving tribe:", error);
    return NextResponse.json(
      { error: "Failed to leave tribe" },
      { status: 500 }
    );
  }
}

