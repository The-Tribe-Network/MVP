import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { createEvent, getTribeEvents } from "@/lib/services/event";
import { getMemberWithPermissions } from "@/lib/services/permissions";
import { checkPermission } from "@/lib/services/role-permissions";
import { createEventWithPollSchema } from "@/lib/validations/event";

// GET /api/tribes/[tribe_id]/events
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tribe_id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await params;

    // Check membership
    const memberData = await getMemberWithPermissions(tribe_id, user.id);
    if (!memberData) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as any;
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const events = await getTribeEvents(tribe_id, {
      status: status || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      userId: user.id, // Pass userId to get attendance info
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/tribes/[tribe_id]/events
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tribe_id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await params;

    // Check permissions
    const memberData = await getMemberWithPermissions(tribe_id, user.id);
    if (!memberData) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    // Effective canCreateEvents, gated by the tribe's eventCreationPermissionLevel
    const canCreate = await checkPermission(tribe_id, user.id, "canCreateEvents");

    if (!canCreate) {
      return NextResponse.json(
        { error: "No permission to create events" },
        { status: 403 }
      );
    }

    // Validate body
    const body = await request.json();
    const validation = createEventWithPollSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const { poll, ...eventData} = validation.data;

    // Create event (service handles poll creation too)
    const newEvent = await createEvent(tribe_id, user.id, {
      ...eventData,
      poll: poll ? {
        question: poll.question,
        options: poll.options,
        allowMultiple: poll.allowMultiple,
        isAnonymous: poll.isAnonymous,
        endsAt: poll.endsAt ?? undefined,
      } : undefined,
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
