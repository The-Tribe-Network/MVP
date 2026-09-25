import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { InvalidCursorError, listNotifications } from "@/lib/services/notification-feed";
import { listNotificationsQuerySchema } from "@/lib/validations/notifications";

/**
 * GET /api/me/notifications?filter&tribeId&cursor&limit
 * Flat feed, newest first; with `tribeId` it is NOTIF-03 and `unreadCount` is that tribe's (`listNotifications`, TRI-7)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const validation = listNotificationsQuerySchema.safeParse({
      filter: params.get("filter") ?? undefined,
      tribeId: params.get("tribeId") ?? undefined,
      cursor: params.get("cursor") ?? undefined,
      limit: params.get("limit") ?? undefined,
    });
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid query parameters", details: validation.error.flatten() }, { status: 400 });
    }

    return NextResponse.json(await listNotifications(user.id, validation.data));
  } catch (error) {
    if (error instanceof InvalidCursorError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Error listing notifications:", error);
    return NextResponse.json({ error: "Failed to list notifications" }, { status: 500 });
  }
}
