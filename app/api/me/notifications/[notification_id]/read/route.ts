import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { markNotificationRead } from "@/lib/services/notification-feed";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/me/notifications/[notification_id]/read
 * Marks one of the caller's notifications read; idempotent. Someone else's or a malformed id is 404 (`markNotificationRead`, TRI-7)
 */
export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/me/notifications/[notification_id]/read">
) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { notification_id } = await ctx.params;
    if (!UUID.test(notification_id) || !(await markNotificationRead(user.id, notification_id))) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notification read:", error);
    return NextResponse.json({ error: "Failed to mark notification read" }, { status: 500 });
  }
}
