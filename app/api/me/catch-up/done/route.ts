import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { markCatchUpDone } from "@/lib/services/tribe";
import { catchUpDoneSchema, validateApiRequest } from "@/lib/validations/agenda";

/**
 * POST /api/me/catch-up/done  { tribeId? }
 * HOME-03 "Done": stamps tribe_member_preference.last_catch_up_at for every tribe the caller is in
 * (or one tribe), so catch-up and `GET /tribes` unreadCount start over from now (TRI-6)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // The body is optional; an empty one means every tribe
    const body = (await request.json().catch(() => ({}))) ?? {};
    const validation = validateApiRequest(catchUpDoneSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const markedAt = await markCatchUpDone(user.id, validation.data.tribeId);
    if (!markedAt) {
      return NextResponse.json({ error: "You are not a member of this tribe" }, { status: 403 });
    }
    return NextResponse.json({ success: true, lastCatchUpAt: markedAt });
  } catch (error) {
    console.error("Error marking catch-up done:", error);
    return NextResponse.json({ error: "Failed to mark catch-up done" }, { status: 500 });
  }
}
