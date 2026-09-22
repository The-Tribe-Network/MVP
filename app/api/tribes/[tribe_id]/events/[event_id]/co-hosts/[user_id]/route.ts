import { NextRequest, NextResponse } from "next/server";

import { guardEventRoute } from "@/lib/services/event-routes";
import { removeCoHost } from "@/lib/services/event-settings";

type Params = { params: Promise<{ tribe_id: string; event_id: string; user_id: string }> };

// DELETE /api/tribes/[tribe_id]/events/[event_id]/co-hosts/[user_id] (TRI-13, EVT-11).
// Anyone who may edit can remove a co-host; a co-host may also remove themselves.
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { tribe_id, event_id, user_id } = await params;
    const guard = await guardEventRoute(tribe_id, event_id);
    if (!guard.ok) return guard.response;
    const { user, editability } = guard.ctx;
    if (!editability.canUserEdit && user.id !== user_id) {
      return NextResponse.json({ error: "No permission to manage this event" }, { status: 403 });
    }
    if (!(await removeCoHost(event_id, user_id))) {
      return NextResponse.json({ error: "Co-host not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing co-host:", error);
    return NextResponse.json({ error: "Failed to remove co-host" }, { status: 500 });
  }
}
