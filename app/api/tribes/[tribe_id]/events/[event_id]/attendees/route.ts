import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import {
  addEventAttendee,
  EventFullError,
  getEventAttendees,
  removeEventAttendee,
} from "@/lib/services/event";
import { rsvpSchema } from "@/lib/validations/event";
import { getMemberWithPermissions } from "@/lib/services/permissions";

// GET /api/tribes/[tribe_id]/events/[event_id]/attendees
export async function GET(
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

    const attendees = await getEventAttendees(event_id);
    return NextResponse.json(attendees);
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}

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

    // Web sends `{ status }` only; mobile adds guestCount and note (EVT-18, TRI-10).
    const body = (await request.json().catch(() => ({}))) as unknown;
    const parsed = rsvpSchema.safeParse(
      body && typeof body === "object" && !("status" in body) ? { ...body, status: "going" } : body
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await addEventAttendee(event_id, user.id, parsed.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof EventFullError) {
      return NextResponse.json(
        { error: error.message, code: "EVENT_FULL", waitlisted: error.waitlisted },
        { status: 409 }
      );
    }
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
