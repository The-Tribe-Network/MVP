import { and, eq, isNull, lte, sql } from "drizzle-orm";
import { after } from "next/server";

import { db } from "@/lib/database/client";
import { event, tribe, user } from "@/lib/database/schemas";
import { eventChangeEmail } from "@/lib/database/schemas/email";
import type { Event } from "@/lib/database/types";
import { appName, sendEmail } from "@/lib/email/client";
import { renderEmail, type EmailBlock } from "@/lib/email/layout";
import { escapeHtml } from "@/lib/email/templates/content-report/escape";
import { emailRecipients } from "@/lib/services/email-preferences";
import { appLink, type NotifyExecutor } from "@/lib/services/notifications";

/**
 * "Your event was cancelled / moved" email to going + maybe attendees and hosts (TRI-349). Push isn't in the alpha,
 * so this is how someone who doesn't open the app hears that the plan changed.
 *
 * The edit's transaction queues a row (`queueEventChangeEmail`), the same trigger as the in-app `event_update`
 * (TRI-191: cancel, time or place; title and description edits say nothing). Nothing is sent inside the
 * transaction (ADR-17: notifications stay transport-free). A cancellation is sent right after the request; a
 * time or place change waits `CHANGE_WINDOW_MS` so a host fixing a typo twice sends one email, and the cron route
 * sends it. Recipients' opt-out (`eventUpdates`) and the shared skip rules apply at send time.
 */

const CHANGE_WINDOW_MS = 10 * 60_000;

type EventSnapshot = Pick<Event, "id" | "tribeId" | "title" | "startDate" | "endDate" | "location">;

export async function queueEventChangeEmail(
  executor: NotifyExecutor,
  input: {
    before: EventSnapshot;
    after: EventSnapshot;
    kind: "cancelled" | "changed";
    deleted?: boolean;
    actorId: string;
    recipients: string[];
  }
) {
  const { before, after: next, kind } = input;
  const recipients = [...new Set(input.recipients)];
  if (recipients.length === 0) return;
  const now = new Date();
  await executor
    .insert(eventChangeEmail)
    .values({
      eventId: next.id,
      tribeId: next.tribeId,
      kind,
      deleted: input.deleted ?? false,
      actorId: input.actorId,
      recipientIds: recipients,
      title: next.title,
      beforeStart: before.startDate,
      beforeEnd: before.endDate,
      beforeLocation: before.location,
      afterStart: next.startDate,
      afterEnd: next.endDate,
      afterLocation: next.location,
      sendAfter: kind === "cancelled" ? now : new Date(now.getTime() + CHANGE_WINDOW_MS),
    })
    .onConflictDoUpdate({
      target: eventChangeEmail.eventId,
      targetWhere: sql`${eventChangeEmail.sentAt} IS NULL`,
      // Fold into the pending row: keep its "before" and its deadline (the window doesn't slide), take the latest
      // "after"; a cancellation wins and goes now
      set: {
        kind: sql`CASE WHEN excluded.kind = 'cancelled' THEN 'cancelled' ELSE ${eventChangeEmail.kind} END`,
        deleted: sql`${eventChangeEmail.deleted} OR excluded.deleted`,
        actorId: sql`excluded.actor_id`,
        recipientIds: sql`ARRAY(SELECT DISTINCT unnest(${eventChangeEmail.recipientIds} || excluded.recipient_ids))`,
        title: sql`excluded.title`,
        afterStart: sql`excluded.after_start`,
        afterEnd: sql`excluded.after_end`,
        afterLocation: sql`excluded.after_location`,
        sendAfter: sql`LEAST(${eventChangeEmail.sendAfter}, excluded.send_after)`,
        updatedAt: now,
      },
    });
}

/**
 * Sends a just-queued cancellation after the response goes out. Outside a request (scripts) `after()` throws; the
 * cron route picks the row up instead.
 */
export function sendDueEventChangeEmailsSoon() {
  try {
    after(() => sendDueEventChangeEmails().then(() => undefined));
  } catch {
    // not in a request: the next cron tick sends it
  }
}

/**
 * Sends every due row once. Each row is claimed (`sent_at` set) before sending, so the cron and an `after()` running
 * together never both send it; a send that fails is logged, not retried.
 */
export async function sendDueEventChangeEmails(now = new Date()): Promise<{ rows: number; emails: number }> {
  const due = await db
    .select({ id: eventChangeEmail.id })
    .from(eventChangeEmail)
    .where(and(isNull(eventChangeEmail.sentAt), lte(eventChangeEmail.sendAfter, now)));

  let rows = 0;
  let emails = 0;
  for (const { id } of due) {
    const [row] = await db
      .update(eventChangeEmail)
      .set({ sentAt: now })
      .where(and(eq(eventChangeEmail.id, id), isNull(eventChangeEmail.sentAt)))
      .returning();
    if (!row) continue; // claimed by another run
    rows += 1;
    try {
      emails += await sendRow(row);
    } catch (error) {
      console.error(`[event-change-email] row ${row.id} failed:`, error instanceof Error ? error.message : error);
    }
  }
  return { rows, emails };
}

type Row = typeof eventChangeEmail.$inferSelect;

async function sendRow(queued: Row): Promise<number> {
  // The event as it is now, if it still exists: edits that queued nothing (a new title) still show up
  const [current] = queued.deleted
    ? []
    : await db
        .select({ title: event.title, startDate: event.startDate, endDate: event.endDate, location: event.location })
        .from(event)
        .where(eq(event.id, queued.eventId));
  const row: Row = current
    ? { ...queued, title: current.title, afterStart: current.startDate, afterEnd: current.endDate, afterLocation: current.location }
    : queued;
  const timeChanged =
    row.beforeStart.getTime() !== row.afterStart.getTime() ||
    (row.beforeEnd?.getTime() ?? null) !== (row.afterEnd?.getTime() ?? null);
  const placeChanged = (row.beforeLocation ?? null) !== (row.afterLocation ?? null);
  // Edited and then put back within the window: nothing to say
  if (row.kind === "changed" && !timeChanged && !placeChanged) return 0;

  const recipients = await emailRecipients(row.recipientIds, { category: "eventUpdates", actorId: row.actorId });
  if (recipients.length === 0) return 0;

  const [tribeRow] = await db.select({ name: tribe.name }).from(tribe).where(eq(tribe.id, row.tribeId));
  const [actor] = row.actorId
    ? await db
        .select({ name: user.name, displayName: user.displayName, timezone: user.timezone })
        .from(user)
        .where(eq(user.id, row.actorId))
    : [];
  const tribeName = tribeRow?.name ?? "your tribe";
  const actorName = actor ? actor.displayName || actor.name : "A host";
  const link = row.deleted ? appLink.tribe(row.tribeId) : appLink.event(row.tribeId, row.eventId);

  let sent = 0;
  for (const recipient of recipients) {
    // The recipient's own zone, else the host's (a proxy for where the event is), else UTC
    const timeZone = validZone(recipient.timezone) ?? validZone(actor?.timezone) ?? "UTC";
    const { subject, content } = compose(row, { tribeName, actorName, timeZone, timeChanged, placeChanged, link });
    const unsubscribe = { userId: recipient.id, category: "eventUpdates" as const };
    try {
      await sendEmail({ to: recipient.email, subject, ...renderEmail({ ...content, unsubscribe }), unsubscribe });
      sent += 1;
    } catch {
      // sendEmail logged it (domain only)
    }
  }
  return sent;
}

function compose(
  row: Row,
  ctx: { tribeName: string; actorName: string; timeZone: string; timeChanged: boolean; placeChanged: boolean; link: string }
) {
  const when = (start: Date, end: Date | null) => formatWhen(start, end, ctx.timeZone);
  const reason = `You're getting this because you're going to, might go to, or host ${row.title} in ${ctx.tribeName}.`;
  const button = { label: `Open in ${appName}`, url: ctx.link };

  if (row.kind === "cancelled") {
    const was = [when(row.afterStart, row.afterEnd), row.afterLocation].filter(Boolean).join(" · ");
    return {
      subject: `Cancelled: ${row.title}`,
      content: {
        heading: `${row.title} is cancelled`,
        preheader: `${ctx.actorName} cancelled it in ${ctx.tribeName}.`,
        blocks: [`${ctx.actorName} cancelled ${row.title} in ${ctx.tribeName}.`, `It was planned for ${was}.`],
        // A deleted event has no page: the button opens the tribe
        button: row.deleted ? { label: `Open ${ctx.tribeName}`, url: ctx.link } : button,
        reason,
      },
    };
  }

  const what = ctx.timeChanged && ctx.placeChanged ? "time and place" : ctx.timeChanged ? "time" : "place";
  const blocks: EmailBlock[] = [`${ctx.actorName} changed the ${what} of ${row.title} in ${ctx.tribeName}.`];
  if (ctx.timeChanged) blocks.push(changeBlock("When", when(row.beforeStart, row.beforeEnd), when(row.afterStart, row.afterEnd)));
  if (ctx.placeChanged) blocks.push(changeBlock("Where", row.beforeLocation || "No place set", row.afterLocation || "No place set"));
  return {
    subject: `New ${what}: ${row.title}`,
    content: {
      heading: `${row.title} has a new ${what}`,
      preheader: ctx.timeChanged ? `Now ${when(row.afterStart, row.afterEnd)}` : `Now at ${row.afterLocation ?? "no set place"}`,
      blocks,
      button,
      reason,
    },
  };
}

/** "When: ~~old~~ → new" as a block, with the old value struck through in HTML */
function changeBlock(label: string, from: string, to: string): EmailBlock {
  return {
    html: `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:#09090b"><strong>${label}:</strong> <span style="color:#67676f;text-decoration:line-through">${escapeHtml(from)}</span><br><strong>Now:</strong> ${escapeHtml(to)}</p>`,
    text: `${label}: ${from}\nNow: ${to}`,
  };
}

/** "Mon, Sep 28, 2:00 PM – 4:00 PM EDT" in `timeZone`; the end's date only when it's another day */
export function formatWhen(start: Date, end: Date | null, timeZone: string): string {
  const day = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric" }).format(d);
  const time = (d: Date, zone: boolean) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      ...(zone ? { timeZoneName: "short" as const } : {}),
    }).format(d);
  if (!end) return `${day(start)}, ${time(start, true)}`;
  const sameDay = day(start) === day(end);
  return sameDay
    ? `${day(start)}, ${time(start, false)} – ${time(end, true)}`
    : `${day(start)}, ${time(start, false)} – ${day(end)}, ${time(end, true)}`;
}

function validZone(zone: string | null | undefined): string | null {
  if (!zone) return null;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return zone;
  } catch {
    return null;
  }
}

