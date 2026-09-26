import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { markCatchUpItemRead } from "@/lib/services/tribe";
import { catchUpReadSchema, validateApiRequest } from "@/lib/validations/agenda";

/**
 * POST /api/me/catch-up/read  { itemId, tribeId }
 * HOME-03: the caller opened a Catch up item, so catch-up hides it (until newer activity) and the
 * tribe's unreadCount skips it if it is a post (TRI-332)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const validation = validateApiRequest(catchUpReadSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const marked = await markCatchUpItemRead(user.id, validation.data.tribeId, validation.data.itemId);
    if (!marked) {
      return NextResponse.json({ error: "You are not a member of this tribe" }, { status: 403 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking a catch-up item read:", error);
    return NextResponse.json({ error: "Failed to mark the item read" }, { status: 500 });
  }
}
