import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getMemberEvents } from "@/lib/services/profile";
import { memberContentQuerySchema, validateApiRequest } from "@/lib/validations/profile";

/**
 * GET /api/users/[user_id]/events?tribeId&limit&offset
 * Events the member hosts or co-hosts in tribes the caller shares with them, in the tribe events list shape (PROF-02 Events tab; proposed `getMemberEvents`). Bare array.
 * `tribeId` narrows to one shared tribe; an unshared `tribeId` returns nothing (TRI-15).
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/users/[user_id]/events">) {
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

    const result = await getMemberEvents(user.id, user_id, validation.data);
    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching member events:", error);
    return NextResponse.json({ error: "Failed to fetch member events" }, { status: 500 });
  }
}
