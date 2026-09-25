import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getMemberPosts } from "@/lib/services/profile";
import { memberContentQuerySchema, validateApiRequest } from "@/lib/validations/profile";

/**
 * GET /api/users/[user_id]/posts?tribeId&limit&offset
 * Posts by the member in tribes the caller shares with them, newest first, in the feed `Post` shape plus `tribe` (PROF-02 Posts tab; contract `getMemberPosts`). Bare array.
 * `tribeId` narrows to one shared tribe; an unshared `tribeId` returns nothing (TRI-15).
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/users/[user_id]/posts">) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user_id } = await ctx.params;
    const params = request.nextUrl.searchParams;
    const validation = validateApiRequest(memberContentQuerySchema, {
      tribeId: params.get("tribeId") ?? undefined,
      limit: params.get("limit") ?? undefined,
      offset: params.get("offset") ?? undefined,
    });
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid query parameters", details: validation.error }, { status: 400 });
    }

    const result = await getMemberPosts(user.id, user_id, validation.data);
    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching member posts:", error);
    return NextResponse.json({ error: "Failed to fetch member posts" }, { status: 500 });
  }
}
