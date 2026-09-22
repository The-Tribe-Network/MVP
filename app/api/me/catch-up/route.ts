import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getCatchUp } from "@/lib/services/agenda";
import { catchUpQuerySchema, validateApiRequest } from "@/lib/validations/agenda";

/**
 * GET /api/me/catch-up?since&tribeId&cursor&limit
 * Ranked cross-tribe items since the caller last caught up, plus unread counts per tribe
 * (mobile contract `getCatchUp`, HOME-03, TRI-6)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = request.nextUrl.searchParams;
    const validation = validateApiRequest(catchUpQuerySchema, {
      since: params.get("since") ?? undefined,
      tribeId: params.get("tribeId") ?? undefined,
      cursor: params.get("cursor") ?? undefined,
      limit: params.get("limit") ?? undefined,
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error },
        { status: 400 }
      );
    }

    const page = await getCatchUp(user.id, validation.data);
    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching catch-up:", error);
    return NextResponse.json({ error: "Failed to fetch catch-up" }, { status: 500 });
  }
}
