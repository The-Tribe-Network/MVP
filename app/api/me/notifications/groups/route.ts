import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { listNotificationGroups } from "@/lib/services/notification-feed";
import { listNotificationGroupsQuerySchema } from "@/lib/validations/notifications";

/**
 * GET /api/me/notifications/groups?filter&perGroup
 * Grouped by tribe, newest activity first, plus `personal` and the badge `unreadCount` (`listNotificationGroups`, NOTIF-01, TRI-7)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const validation = listNotificationGroupsQuerySchema.safeParse({
      filter: params.get("filter") ?? undefined,
      perGroup: params.get("perGroup") ?? undefined,
    });
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid query parameters", details: validation.error.flatten() }, { status: 400 });
    }

    return NextResponse.json(
      await listNotificationGroups(user.id, validation.data.filter, validation.data.perGroup)
    );
  } catch (error) {
    console.error("Error listing notification groups:", error);
    return NextResponse.json({ error: "Failed to list notifications" }, { status: 500 });
  }
}
