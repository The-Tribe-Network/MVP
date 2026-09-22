import { NextRequest, NextResponse } from "next/server";

import { guardEventRoute } from "@/lib/services/event-routes";
import { deleteEventLink } from "@/lib/services/event-settings";

type Params = { params: Promise<{ tribe_id: string; event_id: string; link_id: string }> };

// DELETE /api/tribes/[tribe_id]/events/[event_id]/links/[link_id] (TRI-13, EVT-10)
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { tribe_id, event_id, link_id } = await params;
    const guard = await guardEventRoute(tribe_id, event_id, { requireEdit: true });
    if (!guard.ok) return guard.response;
    if (!(await deleteEventLink(event_id, link_id))) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event link:", error);
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}
