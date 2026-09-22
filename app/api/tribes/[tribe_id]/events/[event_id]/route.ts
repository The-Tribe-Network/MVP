import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getEventById, updateEvent, deleteEvent } from "@/lib/services/event";
import { eventEditability } from "@/lib/services/event-settings";
import { getMemberWithPermissions } from "@/lib/services/permissions";
import { updateEventDetailsSchema } from "@/lib/validations/event";

type Context = RouteContext<'/api/tribes/[tribe_id]/events/[event_id]'>;

// GET /api/tribes/[tribe_id]/events/[event_id]
export async function GET(
  request: NextRequest,
  ctx: Context
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, event_id } = await ctx.params;

    const memberData = await getMemberWithPermissions(tribe_id, user.id);
    if (!memberData) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    const event = await getEventById(event_id, user.id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // EVT-02 ⋯ Manage / EVT-04 gate: who may edit, from one place (TRI-13, DATA-MODEL-DELTA §6)
    const { isUserCoHost, canUserEdit } = await eventEditability(event, memberData, user.id);
    return NextResponse.json({ ...event, isUserCoHost, canUserEdit });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PUT /api/tribes/[tribe_id]/events/[event_id]
export async function PUT(
  request: NextRequest,
  ctx: Context
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, event_id } = await ctx.params;

    // Get event first to check ownership
    const existingEvent = await getEventById(event_id);
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const memberData = await getMemberWithPermissions(tribe_id, user.id);
    if (!memberData) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    // Creator, co-hosts, or whoever `event_settings.editPermission` allows (TRI-13)
    const { canUserEdit } = await eventEditability(existingEvent, memberData, user.id);
    if (!canUserEdit) {
      return NextResponse.json(
        { error: "No permission to edit event" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateEventDetailsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateEvent(event_id, user.id, validation.data);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/tribes/[tribe_id]/events/[event_id]
export async function DELETE(
  request: NextRequest,
  ctx: Context
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, event_id } = await ctx.params;

    const existingEvent = await getEventById(event_id);
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const memberData = await getMemberWithPermissions(tribe_id, user.id);
    if (!memberData) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    const canDelete =
      existingEvent.createdBy === user.id ||
      memberData.permissions?.canDeleteEvents === true ||
      ["owner", "admin"].includes(memberData.member.role);

    if (!canDelete) {
      return NextResponse.json(
        { error: "No permission to delete event" },
        { status: 403 }
      );
    }

    await deleteEvent(event_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
