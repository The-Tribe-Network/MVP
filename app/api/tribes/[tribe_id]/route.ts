import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getTribeById } from "@/lib/services/tribe";
import { checkTribeMembership } from "@/lib/services/permissions";
import { tribeIdParamSchema, validateApiRequest } from "@/lib/validations/tribe";

export async function GET(
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

    // Fetch tribe
    const tribeData = await getTribeById(validation.data.id);

    if (!tribeData) {
      return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
    }

    // Check if user is a member of the tribe
    const isMember = await checkTribeMembership(validation.data.id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of this tribe to access it" },
        { status: 403 }
      );
    }

    return NextResponse.json(tribeData);
  } catch (error) {
    console.error("Error fetching tribe:", error);
    return NextResponse.json(
      { error: "Failed to fetch tribe" },
      { status: 500 }
    );
  }
}

