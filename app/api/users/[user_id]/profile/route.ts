import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getMemberProfile } from "@/lib/services/profile";
import { memberProfileQuerySchema, validateApiRequest } from "@/lib/validations/profile";

/**
 * GET /api/users/[user_id]/profile?tribeId
 * Member profile scoped to the tribes the caller shares with the member (PROF-02, TRI-15; contract
 * `getMemberProfile`). Unshared tribes appear only as `privateTribeCount`. `tribeId` scopes `counts`
 * to one shared tribe; an unshared one scopes them to nothing.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/users/[user_id]/profile">) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user_id } = await ctx.params;
    const validation = validateApiRequest(memberProfileQuerySchema, {
      tribeId: request.nextUrl.searchParams.get("tribeId") ?? undefined,
    });
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid query parameters", details: validation.error }, { status: 400 });
    }

    const profile = await getMemberProfile(user.id, user_id, validation.data.tribeId);
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching member profile:", error);
    return NextResponse.json({ error: "Failed to fetch member profile" }, { status: 500 });
  }
}
