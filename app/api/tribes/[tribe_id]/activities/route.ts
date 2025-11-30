import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getTribeActivities } from "@/lib/services/activity";
import { checkTribeMembership } from "@/lib/services/permissions";
import { tribeIdParamSchema, validateApiRequest } from "@/lib/validations/post";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/activities'>
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Validate tribe ID parameter
    const tribeValidation = validateApiRequest(tribeIdParamSchema, { tribe_id });
    if (!tribeValidation.success) {
      return NextResponse.json(
        { error: "Invalid tribe ID", details: tribeValidation.error },
        { status: 400 }
      );
    }

    // Check tribe membership
    const isMember = await checkTribeMembership(tribeValidation.data.tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of this tribe to view activities" },
        { status: 403 }
      );
    }

    // Get pagination params
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Fetch activities
    const activities = await getTribeActivities(
      tribeValidation.data.tribe_id,
      limit,
      offset
    );

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

