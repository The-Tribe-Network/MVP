import { NextRequest, NextResponse } from "next/server";

import { guardEventRoute } from "@/lib/services/event-routes";
import { requestCoHostAccess } from "@/lib/services/event-settings";

type Params = { params: Promise<{ tribe_id: string; event_id: string }> };

// POST /api/tribes/[tribe_id]/events/[event_id]/co-hosts/request (TRI-13, EVT-04-no-permission).
// Notifies the creator; 409 while an earlier request is still unread.
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { tribe_id, event_id } = await params;
    const guard = await guardEventRoute(tribe_id, event_id);
    if (!guard.ok) return guard.response;
    const { event, user, editability } = guard.ctx;
    if (editability.canUserEdit) {
      return NextResponse.json({ error: "You can already manage this event" }, { status: 409 });
    }
    const result = await requestCoHostAccess(event, { id: user.id, name: user.name });
    if (result === "pending") {
      return NextResponse.json({ error: "A request is already pending" }, { status: 409 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error requesting co-host access:", error);
    return NextResponse.json({ error: "Failed to send the request" }, { status: 500 });
  }
}
