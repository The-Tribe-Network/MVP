import { NextRequest, NextResponse } from "next/server";

import { guardEventRoute, validationError } from "@/lib/services/event-routes";
import { addEventLink, getEventLinks } from "@/lib/services/event-settings";
import { eventLinkSchema } from "@/lib/validations/event-settings";

type Params = { params: Promise<{ tribe_id: string; event_id: string }> };

// GET /api/tribes/[tribe_id]/events/[event_id]/links (TRI-13, EVT-10)
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { tribe_id, event_id } = await params;
    const guard = await guardEventRoute(tribe_id, event_id);
    if (!guard.ok) return guard.response;
    return NextResponse.json(await getEventLinks(event_id));
  } catch (error) {
    console.error("Error fetching event links:", error);
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}

// POST /api/tribes/[tribe_id]/events/[event_id]/links { title, url, description? } → 201 EventLink
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { tribe_id, event_id } = await params;
    const guard = await guardEventRoute(tribe_id, event_id, { requireEdit: true });
    if (!guard.ok) return guard.response;

    const validation = eventLinkSchema.safeParse(await request.json());
    if (!validation.success) return validationError(validation.error.flatten().fieldErrors);

    const created = await addEventLink(event_id, guard.ctx.user.id, validation.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error adding event link:", error);
    return NextResponse.json({ error: "Failed to add link" }, { status: 500 });
  }
}
