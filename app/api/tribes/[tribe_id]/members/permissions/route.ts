import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { checkTribeMembership } from "@/lib/services/permissions";
import { getTribeMembersWithPermissions } from "@/lib/services/member-permissions";

type RouteContext<T extends string> = {
  params: Promise<Record<string, string>>;
};

/**
 * GET /api/tribes/[tribe_id]/members/permissions
 *
 * Fetch tribe members who have custom permission overrides.
 * Supports optional search and role filtering.
 *
 * @requires Tribe membership
 * @query search - Optional search term for name/username
 * @query role - Optional role filter
 * @returns Array of members with their permission overrides
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/tribes/[tribe_id]/members/permissions">
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Check membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") || undefined;

    const members = await getTribeMembersWithPermissions(tribe_id, { search, role });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members with permissions:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}
