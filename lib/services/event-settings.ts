import { and, count, eq } from "drizzle-orm";

import { db } from "@/lib/database/client";
import { user } from "@/lib/database/schemas/auth";
import { event, eventAttendee, eventCoHost, eventLink, eventSettings } from "@/lib/database/schemas/event";
import { album, albumMedia, media } from "@/lib/database/schemas/media";
import { canUserSeeAlbum } from "./album";
import { tribeSettings } from "@/lib/database/schemas/tribe";
import type { Event, EventSettings } from "@/lib/database/types";
import { userWithUsernameColumns } from "@/lib/database/user-columns";
import type { EventLinkInput, UpdateEventSettingsInput } from "@/lib/validations/event-settings";

import { eventAttendeeIds, findUnreadNotification, notify } from "./notifications";
import type { MemberWithPermissions } from "./permissions";

// TRI-13 · event settings, co-hosts, links, announce (tribe-mobile DATA-MODEL-DELTA §6).
// The three tables already existed; this file is the API over them.

// ── settings ──

/** The `event_settings` row, created from the tribe's defaults the first time it is asked for. */
export async function getOrCreateEventSettings(eventId: string, tribeId: string): Promise<EventSettings> {
  const [existing] = await db.select().from(eventSettings).where(eq(eventSettings.eventId, eventId)).limit(1);
  if (existing) return existing;

  const [defaults] = await db.select().from(tribeSettings).where(eq(tribeSettings.tribeId, tribeId)).limit(1);
  const seeded = defaults
    ? {
        enableWaitlist: defaults.enableWaitlist,
        attendeeVisibility: defaults.showAttendeeList,
        enablePolls: defaults.enableEventPolls,
        pollCreationLevel: defaults.pollCreationPermissionLevel,
        pollResultsVisibility: defaults.pollResultsVisibility,
        allowAnonymousPolls: defaults.allowAnonymousPolls,
        enableReminders: defaults.enableEventReminders,
        reminderSchedule: defaults.reminderTimings,
        notifyOnRsvpChanges: defaults.notifyOnRsvpChanges,
      }
    : {};

  // Two first readers may race; the unique index makes the loser re-read.
  const inserted = await db
    .insert(eventSettings)
    .values({ eventId, ...seeded })
    .onConflictDoNothing({ target: eventSettings.eventId })
    .returning();
  if (inserted[0]) return inserted[0];
  const [row] = await db.select().from(eventSettings).where(eq(eventSettings.eventId, eventId)).limit(1);
  return row!;
}

export async function updateEventSettings(
  eventId: string,
  tribeId: string,
  patch: UpdateEventSettingsInput
): Promise<EventSettings> {
  await getOrCreateEventSettings(eventId, tribeId);
  const [updated] = await db
    .update(eventSettings)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(eventSettings.eventId, eventId))
    .returning();
  return updated!;
}

/**
 * `AlbumPreview` for `settings.linkedAlbum`: id, name, cover url, photo count. Null when the viewer may
 * not see the album (TRI-273).
 */
async function albumPreview(albumId: string | null, viewerId: string) {
  if (!albumId) return null;
  const [row] = await db
    .select({
      id: album.id,
      name: album.name,
      coverUrl: media.fileUrl,
      tribeId: album.tribeId,
      createdBy: album.createdBy,
      privacy: album.privacy,
    })
    .from(album)
    .leftJoin(media, eq(album.coverId, media.id))
    .where(eq(album.id, albumId))
    .limit(1);
  if (!row || !(await canUserSeeAlbum(row, viewerId))) return null;
  const [photos] = await db
    .select({ n: count() })
    .from(albumMedia)
    .where(eq(albumMedia.albumId, albumId));
  return { id: row.id, name: row.name, coverUrl: row.coverUrl ?? null, photoCount: photos?.n ?? 0 };
}

// ── co-hosts ──

export async function getEventCoHosts(eventId: string) {
  return db
    .select({
      id: eventCoHost.id,
      eventId: eventCoHost.eventId,
      userId: eventCoHost.userId,
      addedBy: eventCoHost.addedBy,
      createdAt: eventCoHost.createdAt,
      user: userWithUsernameColumns,
    })
    .from(eventCoHost)
    .innerJoin(user, eq(eventCoHost.userId, user.id))
    .where(eq(eventCoHost.eventId, eventId))
    .orderBy(eventCoHost.createdAt);
}

export class CoHostError extends Error {
  constructor(public readonly code: "ALREADY_CO_HOST" | "IS_CREATOR" | "NOT_A_MEMBER") {
    super(code);
    this.name = "CoHostError";
  }
}

export async function addCoHost(eventId: string, userId: string, addedBy: string, creatorId: string) {
  if (userId === creatorId) throw new CoHostError("IS_CREATOR");
  const inserted = await db
    .insert(eventCoHost)
    .values({ eventId, userId, addedBy })
    .onConflictDoNothing({ target: [eventCoHost.eventId, eventCoHost.userId] })
    .returning();
  if (!inserted[0]) throw new CoHostError("ALREADY_CO_HOST");
  const rows = await getEventCoHosts(eventId);
  return rows.find((row) => row.userId === userId)!;
}

export async function removeCoHost(eventId: string, userId: string): Promise<boolean> {
  const deleted = await db
    .delete(eventCoHost)
    .where(and(eq(eventCoHost.eventId, eventId), eq(eventCoHost.userId, userId)))
    .returning({ id: eventCoHost.id });
  return deleted.length > 0;
}

// ── links ──

export async function getEventLinks(eventId: string) {
  return db
    .select({
      id: eventLink.id,
      eventId: eventLink.eventId,
      title: eventLink.title,
      url: eventLink.url,
      description: eventLink.description,
      orderIndex: eventLink.orderIndex,
      createdBy: eventLink.createdBy,
      createdAt: eventLink.createdAt,
    })
    .from(eventLink)
    .where(eq(eventLink.eventId, eventId))
    .orderBy(eventLink.orderIndex, eventLink.createdAt);
}

export async function addEventLink(eventId: string, createdBy: string, input: EventLinkInput) {
  const [last] = await db.select({ n: count() }).from(eventLink).where(eq(eventLink.eventId, eventId));
  const [row] = await db
    .insert(eventLink)
    .values({
      eventId,
      title: input.title,
      url: input.url,
      description: input.description ?? null,
      orderIndex: last?.n ?? 0,
      createdBy,
    })
    .returning();
  return row!;
}

export async function deleteEventLink(eventId: string, linkId: string): Promise<boolean> {
  const deleted = await db
    .delete(eventLink)
    .where(and(eq(eventLink.eventId, eventId), eq(eventLink.id, linkId)))
    .returning({ id: eventLink.id });
  return deleted.length > 0;
}

// ── permissions ──

type EditContext = {
  event: Pick<Event, "createdBy">;
  settings: Pick<EventSettings, "editPermission">;
  member: MemberWithPermissions;
  coHosts: { userId: string }[];
  userId: string;
};

/**
 * The one place that says who may edit an event (DATA-MODEL-DELTA §6): the creator and co-hosts always;
 * otherwise `event_settings.editPermission` decides, with a `canEditEvents` override or an owner/admin
 * role standing in for "admins". Used by PUT /events/{id}, the detail's `canUserEdit` and the settings
 * routes.
 */
export function canEditEvent({ event, settings, member, coHosts, userId }: EditContext): boolean {
  if (event.createdBy === userId) return true;
  if (coHosts.some((row) => row.userId === userId)) return true;
  const isAdmin =
    member.permissions?.canEditEvents === true || member.member.role === "owner" || member.member.role === "admin";
  switch (settings.editPermission ?? "creator_and_admins") {
    case "creator_only":
      return false;
    case "creator_and_admins":
      return isAdmin;
    case "all_members":
      return true;
  }
}

/** `isUserCreator` / `isUserCoHost` / `canUserEdit` for one caller (the event detail and the bundle). */
export async function eventEditability(
  eventRow: Pick<Event, "id" | "tribeId" | "createdBy">,
  member: MemberWithPermissions,
  userId: string
) {
  const [settings, coHosts] = await Promise.all([
    getOrCreateEventSettings(eventRow.id, eventRow.tribeId),
    getEventCoHosts(eventRow.id),
  ]);
  return {
    settings,
    coHosts,
    isUserCreator: eventRow.createdBy === userId,
    isUserCoHost: coHosts.some((row) => row.userId === userId),
    canUserEdit: canEditEvent({ event: eventRow, settings, member, coHosts, userId }),
  };
}

// ── bundle ──

/** `EventSettingsBundle` for GET/PATCH …/settings. */
export async function getEventSettingsBundle(
  eventRow: Pick<Event, "id" | "tribeId" | "createdBy">,
  member: MemberWithPermissions,
  userId: string
) {
  const [{ settings, coHosts, isUserCreator, isUserCoHost, canUserEdit }, links] = await Promise.all([
    eventEditability(eventRow, member, userId),
    getEventLinks(eventRow.id),
  ]);
  const linkedAlbum = await albumPreview(settings.linkedAlbumId, userId);
  const { id: _id, createdAt: _c, updatedAt: _u, eventId: _e, ...fields } = settings;
  return {
    settings: { ...fields, linkedAlbum },
    coHosts,
    links,
    isUserCreator,
    isUserCoHost,
    canUserEdit,
  };
}

// ── announce / co-host request ──

const eventLinkFor = (tribeId: string, eventId: string) => `/tribes/${tribeId}/events/${eventId}`;

/**
 * EVT-09 "Send to all attendees": a notification per going/maybe attendee (the sender excluded), returned
 * as `{ recipients }`. The type becomes `announcement` with TRI-189; it stays `event_update` until then.
 */
export async function announceToAttendees(
  eventRow: Pick<Event, "id" | "tribeId" | "title">,
  senderId: string,
  message: string
): Promise<number> {
  const recipients = await eventAttendeeIds(db, eventRow.id);
  return notify(db, {
    type: "event_update",
    actorId: senderId,
    tribeId: eventRow.tribeId,
    entityType: "event",
    entityId: eventRow.id,
    recipients,
    title: eventRow.title,
    message,
    link: eventLinkFor(eventRow.tribeId, eventRow.id),
  });
}

/**
 * EVT-04-no-permission "Request co-host access": one notification to the creator. A second request
 * while the first is unread answers 409 (the contract's "already pending").
 */
export async function requestCoHostAccess(
  eventRow: Pick<Event, "id" | "tribeId" | "title" | "createdBy">,
  requester: { id: string; name: string }
): Promise<"sent" | "pending"> {
  const request = {
    type: "event_cohost_request",
    entityType: "event",
    entityId: eventRow.id,
    collapse: requester.id,
  } as const;
  if (await findUnreadNotification(db, eventRow.createdBy, request)) return "pending";
  await notify(db, {
    ...request,
    actorId: requester.id,
    tribeId: eventRow.tribeId,
    recipients: [eventRow.createdBy],
    title: eventRow.title,
    message: coHostRequestMessage(requester.name),
    link: eventLinkFor(eventRow.tribeId, eventRow.id),
  });
  return "sent";
}

const coHostRequestMessage = (name: string) => `${name} asked to co-host this event`;

/** Load the event row the routes gate on, scoped to the tribe in the URL. */
export async function findTribeEvent(tribeId: string, eventId: string) {
  const [row] = await db
    .select({ id: event.id, tribeId: event.tribeId, title: event.title, createdBy: event.createdBy })
    .from(event)
    .where(and(eq(event.id, eventId), eq(event.tribeId, tribeId)))
    .limit(1);
  return row ?? null;
}
