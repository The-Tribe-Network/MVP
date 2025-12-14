import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { addEventAttendee, removeEventAttendee } from "@/lib/services/event";
import { getMemberWithPermissions } from "@/lib/services/permissions";

// POST /api/tribes/[tribe_id]/events/[event_id]/attendees
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

    const memberData = await getMemberWithPermissions(tribe_id, user.id);
    if (!memberData) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    const body = await request.json();
    const status = body.status || "going"; // going, maybe, not_going

    await addEventAttendee(event_id, user.id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding attendee:", error);
    return NextResponse.json(
      { error: "Failed to RSVP" },
      { status: 500 }
    );
  }
}

// DELETE /api/tribes/[tribe_id]/events/[event_id]/attendees
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tribe_id: string; event_id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, event_id } = await params;

    await removeEventAttendee(event_id, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing attendee:", error);
    return NextResponse.json(
      { error: "Failed to remove RSVP" },
      { status: 500 }
    );
  }
}
