import { getServerUser } from "@/lib/services/auth";
import { checkTribeMembership } from "@/lib/services/permissions";
import { tribeIdParamSchema, validateApiRequest } from "@/lib/validations/tribe";
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/members'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;
    const validation = validateApiRequest(tribeIdParamSchema, { id: tribe_id });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid tribe ID", details: validation.error },
        { status: 400 }
      );
    }

    const isMember = await checkTribeMembership(validation.data.id, user.id);
    console.log("isMember", isMember);
    return NextResponse.json({ isMember }, { status: 200 });
  } catch (error) {
    console.error("Error checking tribe membership:", error);
    return NextResponse.json(
      { error: "Failed to check tribe membership" },
      { status: 500 }
    );
  }
}