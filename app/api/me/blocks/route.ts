import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { listBlocks } from "@/lib/services/blocks";
import { listBlocksQuerySchema } from "@/lib/validations/reports";

/**
 * GET /api/me/blocks?limit=&offset= (TRI-238, USET-06 blocked list)
 * The users the caller blocked, newest first: 200 `{ blocks: [{ user: { id, name, displayName, username, image },
 * createdAt }], total, hasMore }`. limit 1–100 (default 50). 400 bad paging · 401.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = listBlocksQuerySchema.safeParse({
      limit: request.nextUrl.searchParams.get("limit") ?? undefined,
      offset: request.nextUrl.searchParams.get("offset") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", code: "INVALID_QUERY", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(await listBlocks(user.id, parsed.data));
  } catch (error) {
    console.error("Error listing blocks:", error);
    return NextResponse.json({ error: "Failed to list blocked users" }, { status: 500 });
  }
}
