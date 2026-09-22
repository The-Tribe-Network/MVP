import { NextRequest, NextResponse } from "next/server";

import { guardEventRoute, validationError } from "@/lib/services/event-routes";
import { getEventSettingsBundle, updateEventSettings } from "@/lib/services/event-settings";
import { updateEventSettingsSchema } from "@/lib/validations/event-settings";

type Params = { params: Promise<{ tribe_id: string; event_id: string }> };

// GET /api/tribes/[tribe_id]/events/[event_id]/settings — EventSettingsBundle (TRI-13, EVT-04/07–11).
// Any member may read; the bundle says whether they may edit.
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { tribe_id, event_id } = await params;
    const guard = await guardEventRoute(tribe_id, event_id);
    if (!guard.ok) return guard.response;
    const { event, member, user } = guard.ctx;
    return NextResponse.json(await getEventSettingsBundle(event, member, user.id));
  } catch (error) {
    console.error("Error fetching event settings:", error);
    return NextResponse.json({ error: "Failed to fetch event settings" }, { status: 500 });
  }
}

// PATCH /api/tribes/[tribe_id]/events/[event_id]/settings — partial EventSettings, returns the bundle.
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { tribe_id, event_id } = await params;
    const guard = await guardEventRoute(tribe_id, event_id, { requireEdit: true });
    if (!guard.ok) return guard.response;
    const { event, member, user } = guard.ctx;

    const validation = updateEventSettingsSchema.safeParse(await request.json());
    if (!validation.success) return validationError(validation.error.flatten().fieldErrors);

    await updateEventSettings(event.id, event.tribeId, validation.data);
    return NextResponse.json(await getEventSettingsBundle(event, member, user.id));
  } catch (error) {
    console.error("Error updating event settings:", error);
    return NextResponse.json({ error: "Failed to update event settings" }, { status: 500 });
  }
}
