import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { removeMultipleEventAttendees, getEventById } from "@/lib/services/event";
import { getMemberWithPermissions } from "@/lib/services/permissions";

// POST /api/tribes/[tribe_id]/events/[event_id]/attendees/bulk-remove
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tribe_id: string; event_id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, event_id } = await params;

    // Check membership and permissions
    const memberData = await getMemberWithPermissions(tribe_id, user.id);
    if (!memberData) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    // Get the event to check ownership
    const event = await getEventById(event_id, user.id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Only the event creator, admins, or owners can bulk remove attendees
    const isEventCreator = event.createdBy === user.id;
    const isAdminOrOwner = memberData.member.role === 'owner' || memberData.member.role === 'admin';

    if (!isEventCreator && !isAdminOrOwner) {
      return NextResponse.json(
        { error: "You don't have permission to manage attendees" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userIds } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Don't allow removing the event creator
    const filteredUserIds = userIds.filter((id: string) => id !== event.createdBy);

    if (filteredUserIds.length === 0) {
      return NextResponse.json(
        { error: "Cannot remove the event host" },
        { status: 400 }
      );
    }

    await removeMultipleEventAttendees(event_id, filteredUserIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing attendees:", error);
    return NextResponse.json(
      { error: "Failed to remove attendees" },
      { status: 500 }
    );
  }
}
