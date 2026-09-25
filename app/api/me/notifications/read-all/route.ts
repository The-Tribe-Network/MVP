import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { markAllNotificationsRead } from "@/lib/services/notification-feed";
import { markAllReadBodySchema } from "@/lib/validations/notifications";

/**
 * POST /api/me/notifications/read-all { tribeId? }
 * NOTIF-01 "Clear all"; with `tribeId`, NOTIF-03 "Clear all" and NOTIF-04 "Mark all as read" (`markAllNotificationsRead`, TRI-7)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const text = await request.text();
    let body: unknown = {};
    if (text.trim()) {
      try {
        body = JSON.parse(text);
      } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
    }
    const validation = markAllReadBodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid body", details: validation.error.flatten() }, { status: 400 });
    }

    await markAllNotificationsRead(user.id, validation.data.tribeId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications read:", error);
    return NextResponse.json({ error: "Failed to mark notifications read" }, { status: 500 });
  }
}
