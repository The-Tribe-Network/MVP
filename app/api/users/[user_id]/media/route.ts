import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getMemberMedia } from "@/lib/services/profile";
import { memberContentQuerySchema, validateApiRequest } from "@/lib/validations/profile";

/**
 * GET /api/users/[user_id]/media?tribeId&limit&offset
 * Photos the member uploaded in tribes the caller shares with them, that the caller may see, newest first, in the `listMedia` shape `{ media, total, hasMore }` (PROF-02-photos; proposed `getMemberMedia`).
 * `tribeId` narrows to one shared tribe; an unshared `tribeId` returns nothing (TRI-15).
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/users/[user_id]/media">) {
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

    const result = await getMemberMedia(user.id, user_id, validation.data);
    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching member media:", error);
    return NextResponse.json({ error: "Failed to fetch member media" }, { status: 500 });
  }
}
