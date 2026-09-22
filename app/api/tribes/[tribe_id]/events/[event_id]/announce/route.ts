import { NextRequest, NextResponse } from "next/server";

import { guardEventRoute, validationError } from "@/lib/services/event-routes";
import { announceToAttendees } from "@/lib/services/event-settings";
import { announceSchema } from "@/lib/validations/event-settings";

type Params = { params: Promise<{ tribe_id: string; event_id: string }> };

// POST /api/tribes/[tribe_id]/events/[event_id]/announce { message } → { recipients } (TRI-13, EVT-09).
// Writes a notification row per going/maybe attendee; delivery beyond that is TRI-189.
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { tribe_id, event_id } = await params;
    const guard = await guardEventRoute(tribe_id, event_id, { requireEdit: true });
    if (!guard.ok) return guard.response;

    const validation = announceSchema.safeParse(await request.json());
    if (!validation.success) return validationError(validation.error.flatten().fieldErrors);

    const recipients = await announceToAttendees(guard.ctx.event, guard.ctx.user.id, validation.data.message);
    return NextResponse.json({ recipients });
  } catch (error) {
    console.error("Error announcing to attendees:", error);
    return NextResponse.json({ error: "Failed to send the announcement" }, { status: 500 });
  }
}
