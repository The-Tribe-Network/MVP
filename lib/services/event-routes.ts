import { NextResponse } from "next/server";

import { getServerUser } from "./auth";
import { eventEditability, findTribeEvent } from "./event-settings";
import { getMemberWithPermissions, type MemberWithPermissions } from "./permissions";

// Shared guard for the TRI-13 event sub-routes: signed in, a member of the tribe, the event exists in
// that tribe. `requireEdit` adds the `canEditEvent` gate (creator, co-host, or per `editPermission`).
export type EventRouteContext = {
  user: NonNullable<Awaited<ReturnType<typeof getServerUser>>>;
  member: MemberWithPermissions;
  event: NonNullable<Awaited<ReturnType<typeof findTribeEvent>>>;
  editability: Awaited<ReturnType<typeof eventEditability>>;
};

export async function guardEventRoute(
  tribeId: string,
  eventId: string,
  options: { requireEdit?: boolean } = {}
): Promise<{ ok: true; ctx: EventRouteContext } | { ok: false; response: NextResponse }> {
  const user = await getServerUser();
  if (!user) return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const member = await getMemberWithPermissions(tribeId, user.id);
  if (!member) return { ok: false, response: NextResponse.json({ error: "Not a member" }, { status: 403 }) };

  const event = await findTribeEvent(tribeId, eventId);
  if (!event) return { ok: false, response: NextResponse.json({ error: "Event not found" }, { status: 404 }) };

  const editability = await eventEditability(event, member, user.id);
  if (options.requireEdit && !editability.canUserEdit) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No permission to manage this event" }, { status: 403 }),
    };
  }
  return { ok: true, ctx: { user, member, event, editability } };
}

export function validationError(details: unknown) {
  return NextResponse.json({ error: "Validation failed", details }, { status: 400 });
}
