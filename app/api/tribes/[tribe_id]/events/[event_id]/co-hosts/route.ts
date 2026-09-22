import { NextRequest, NextResponse } from "next/server";

import { guardEventRoute, validationError } from "@/lib/services/event-routes";
import { addCoHost, CoHostError, getEventCoHosts } from "@/lib/services/event-settings";
import { getMemberWithPermissions } from "@/lib/services/permissions";
import { addCoHostSchema } from "@/lib/validations/event-settings";

type Params = { params: Promise<{ tribe_id: string; event_id: string }> };

// GET /api/tribes/[tribe_id]/events/[event_id]/co-hosts (TRI-13, EVT-11)
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { tribe_id, event_id } = await params;
    const guard = await guardEventRoute(tribe_id, event_id);
    if (!guard.ok) return guard.response;
    return NextResponse.json(await getEventCoHosts(event_id));
  } catch (error) {
    console.error("Error fetching co-hosts:", error);
    return NextResponse.json({ error: "Failed to fetch co-hosts" }, { status: 500 });
  }
}

// POST /api/tribes/[tribe_id]/events/[event_id]/co-hosts { userId } → 201 EventCoHost
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { tribe_id, event_id } = await params;
    const guard = await guardEventRoute(tribe_id, event_id, { requireEdit: true });
    if (!guard.ok) return guard.response;
    const { event, user } = guard.ctx;

    const validation = addCoHostSchema.safeParse(await request.json());
    if (!validation.success) return validationError(validation.error.flatten().fieldErrors);

    // Co-hosts must belong to the tribe.
    if (!(await getMemberWithPermissions(tribe_id, validation.data.userId))) {
      return NextResponse.json({ error: "That person is not a member of this tribe" }, { status: 400 });
    }

    const created = await addCoHost(event.id, validation.data.userId, user.id, event.createdBy);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof CoHostError) {
      const message =
        error.code === "IS_CREATOR" ? "The host is already the host" : "Already a co-host";
      return NextResponse.json({ error: message, code: error.code }, { status: 409 });
    }
    console.error("Error adding co-host:", error);
    return NextResponse.json({ error: "Failed to add co-host" }, { status: 500 });
  }
}
