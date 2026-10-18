import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getEventPolls, createPoll } from "@/lib/services/poll";
import { getMemberWithPermissions } from "@/lib/services/permissions";
import { getEventById } from "@/lib/services/event";
import { canCreateEventPoll, findTribeEvent, getOrCreateEventSettings } from "@/lib/services/event-settings";
import { createPollSchema } from "@/lib/validations/poll";
import { reportServerError } from "@/lib/clients/sentry";

// GET /api/tribes/[tribe_id]/events/[event_id]/polls
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

    // The event must be in the tribe the caller is a member of (TRI-552)
    if (!(await findTribeEvent(tribe_id, event_id))) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const polls = await getEventPolls(event_id, user.id);
    return NextResponse.json(polls);
  } catch (error) {
    console.error("Error fetching polls:", error);
    reportServerError(error, { route: "/api/tribes/[tribe_id]/events/[event_id]/polls", method: "GET" });
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 }
    );
  }
}

// POST /api/tribes/[tribe_id]/events/[event_id]/polls
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

    const eventRow = await getEventById(event_id);
    if (!eventRow || eventRow.tribeId !== tribe_id) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Effective canCreateEvents AND the event's pollCreationLevel
    const canCreate = await canCreateEventPoll(eventRow, memberData, user.id);

    if (!canCreate) {
      return NextResponse.json(
        { error: "No permission to create polls" },
        { status: 403 }
      );
    }
    // The host's switch in the event settings (TRI-560)
    if ((await getOrCreateEventSettings(eventRow.id, eventRow.tribeId)).enablePolls === false) {
      return NextResponse.json({ error: "Polls are turned off for this event" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createPollSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const newPoll = await createPoll(event_id, user.id, {
      ...validation.data,
      endsAt: validation.data.endsAt
        ? new Date(validation.data.endsAt)
        : undefined,
    });

    return NextResponse.json(newPoll, { status: 201 });
  } catch (error) {
    console.error("Error creating poll:", error);
    reportServerError(error, { route: "/api/tribes/[tribe_id]/events/[event_id]/polls", method: "POST" });
    return NextResponse.json(
      { error: "Failed to create poll" },
      { status: 500 }
    );
  }
}
