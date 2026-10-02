import { and, eq, gt, isNotNull, lte, ne, sql } from "drizzle-orm";

import { db } from "@/lib/database/client";
import { event, eventSettings } from "@/lib/database/schemas/event";
import { poll, pollOption, pollVote } from "@/lib/database/schemas/poll";
import { post } from "@/lib/database/schemas/post";
import { tribeSettings } from "@/lib/database/schemas/tribe";
import { appLink, eventAttendeeIds, eventHostIds, notify } from "./notifications";
import { DAY_BEFORE_MINUTES, sendDayBeforeReminderEmails } from "./event-reminder-emails";

/**
 * Notifications triggered by time, not by a write (TRI-190 reminders, TRI-219 poll results), run by the cron route
 * `/api/cron/notifications`. Both only insert rows through `notify()` with `once`, so overlapping or repeated ticks
 * send nothing twice, even after the recipient read the first row.
 */

const MINUTE = 60_000;
const UNIT_MINUTES = { m: 1, h: 60, d: 24 * 60, w: 7 * 24 * 60 } as const;

/** "1w,1d,1h,15m" → minutes before the start, largest first. Unknown parts are ignored. */
export function parseReminderSchedule(schedule: string | null | undefined): number[] {
  const minutes = (schedule ?? "")
    .split(",")
    .map((part) => /^\s*(\d+)\s*([mhdw])\s*$/.exec(part))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number(match[1]) * UNIT_MINUTES[match[2] as keyof typeof UNIT_MINUTES])
    .filter((value) => value > 0);
  return [...new Set(minutes)].sort((a, b) => b - a);
}

function startsInLabel(minutes: number) {
  const [value, unit] =
    minutes % UNIT_MINUTES.w === 0 ? [minutes / UNIT_MINUTES.w, "week"]
    : minutes % UNIT_MINUTES.d === 0 ? [minutes / UNIT_MINUTES.d, "day"]
    : minutes % UNIT_MINUTES.h === 0 ? [minutes / UNIT_MINUTES.h, "hour"]
    : [minutes, "minute"];
  return `starts in ${value} ${unit}${value === 1 ? "" : "s"}`;
}

/**
 * A window is due from `start − w` for a grace period of half the window, at most 30 min (two 15-min ticks). A tick
 * later than that skips it: no "starts in 1 hour" 20 minutes before the event (TRI-190).
 */
export function dueReminderWindow(start: Date, windows: number[], now: Date): number | null {
  const untilStart = (start.getTime() - now.getTime()) / MINUTE;
  if (untilStart <= 0) return null;
  // Smallest window first, so a fresh event inside two windows gets only the nearer reminder
  for (const window of [...windows].sort((a, b) => a - b)) {
    const grace = Math.min(30, window / 2);
    if (untilStart <= window && untilStart > window - grace) return window;
  }
  return null;
}

/** TRI-190: in-app reminders to going + maybe attendees, per the event's (else the tribe's) reminder settings. */
export async function runEventReminders(now = new Date()) {
  // Far enough for any window a schedule names ("4w" at most in practice)
  const horizon = new Date(now.getTime() + UNIT_MINUTES.w * 4 * MINUTE);
  const candidates = await db
    .select({
      id: event.id,
      tribeId: event.tribeId,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      createdBy: event.createdBy,
      eventEnabled: eventSettings.enableReminders,
      eventSchedule: eventSettings.reminderSchedule,
      tribeEnabled: tribeSettings.enableEventReminders,
      tribeSchedule: tribeSettings.reminderTimings,
    })
    .from(event)
    .leftJoin(eventSettings, eq(eventSettings.eventId, event.id))
    .leftJoin(tribeSettings, eq(tribeSettings.tribeId, event.tribeId))
    .where(and(ne(event.status, "cancelled"), gt(event.startDate, now), lte(event.startDate, horizon)));

  let sent = 0;
  let emails = 0;
  for (const row of candidates) {
    const enabled = row.eventEnabled ?? row.tribeEnabled ?? true;
    if (!enabled) continue;
    // TRI-350: the day-before email follows the one-day mark whatever the in-app schedule says
    if (dueReminderWindow(row.startDate, [DAY_BEFORE_MINUTES], now) === DAY_BEFORE_MINUTES) {
      emails += await sendDayBeforeReminderEmails(row);
    }
    const windows = parseReminderSchedule(row.eventSchedule ?? row.tribeSchedule ?? "1d,1h");
    const window = dueReminderWindow(row.startDate, windows, now);
    if (window === null) continue;
    sent += await notify(db, {
      type: "event_reminder",
      actorId: null,
      tribeId: row.tribeId,
      entityType: "event",
      entityId: row.id,
      recipients: await eventAttendeeIds(db, row.id),
      title: `${row.title} ${startsInLabel(window)}`,
      message: "",
      link: appLink.event(row.tribeId, row.id),
      // Keyed by window and start: a rescheduled event is reminded again for its new time
      collapse: `${window}m:${row.startDate.toISOString()}`,
      once: true,
    });
  }
  return { candidates: candidates.length, sent, emails };
}

/** "A won" / "Tied: A and B" / "No votes", or null when the result must not be named (`hidden`). */
export function pollResultMessage(
  options: { text: string; votes: number }[],
  visibility: string | null
): string | null {
  if (visibility === "hidden") return null;
  const top = Math.max(0, ...options.map((option) => option.votes));
  if (top === 0) return "No votes";
  const winners = options.filter((option) => option.votes === top).map((option) => option.text);
  if (winners.length === 1) return `${winners[0]} won`;
  return `Tied: ${winners.slice(0, -1).join(", ")} and ${winners[winners.length - 1]}`;
}

/** A closed poll's per-option vote counts, in option order, and everyone who voted. */
async function pollTally(pollId: string) {
  const options = await db
    .select({ text: pollOption.text, votes: sql<number>`count(${pollVote.id})::int` })
    .from(pollOption)
    .leftJoin(pollVote, eq(pollVote.optionId, pollOption.id))
    .where(eq(pollOption.pollId, pollId))
    .groupBy(pollOption.id, pollOption.text, pollOption.order)
    .orderBy(pollOption.order);
  const voters = await db
    .selectDistinct({ userId: pollVote.userId })
    .from(pollVote)
    .where(eq(pollVote.pollId, pollId));
  return { options, voterIds: voters.map((voter) => voter.userId) };
}

/**
 * When a poll's `endsAt` passes, tell the people it concerns. Anonymous polls name nobody (the rows have no actor
 * anyway). Polls are looked at for a week after closing, so a missed tick still catches them.
 * - Event polls (TRI-219): its voters, its creator, the hosts and the going + maybe attendees, while the event's
 *   "Poll results" setting is on; never for cancelled events.
 * - Post polls (TRI-424): the post's author (the poll's creator) and its voters. They have no settings: like reads
 *   (`lib/services/poll.ts`), their results show once the poll closes (`after_voting`), so the winner is named.
 */
export async function runPollResults(now = new Date()) {
  const since = new Date(now.getTime() - UNIT_MINUTES.w * MINUTE);
  const closedWindow = and(isNotNull(poll.endsAt), lte(poll.endsAt, now), gt(poll.endsAt, since));
  const closed = await db
    .select({
      id: poll.id,
      question: poll.question,
      createdBy: poll.createdBy,
      eventId: event.id,
      tribeId: event.tribeId,
      notifyOn: eventSettings.notifyOnPollResults,
      eventVisibility: eventSettings.pollResultsVisibility,
      tribeVisibility: tribeSettings.pollResultsVisibility,
    })
    .from(poll)
    .innerJoin(event, eq(event.id, poll.eventId))
    .leftJoin(eventSettings, eq(eventSettings.eventId, event.id))
    .leftJoin(tribeSettings, eq(tribeSettings.tribeId, event.tribeId))
    .where(and(closedWindow, ne(event.status, "cancelled")));
  const closedOnPosts = await db
    .select({ id: poll.id, question: poll.question, createdBy: poll.createdBy, postId: post.id, tribeId: post.tribeId })
    .from(poll)
    .innerJoin(post, eq(post.id, poll.postId))
    .where(closedWindow);

  let sent = 0;
  for (const row of closed) {
    if (row.notifyOn === false) continue;
    const { options, voterIds } = await pollTally(row.id);
    const result = pollResultMessage(options, row.eventVisibility ?? row.tribeVisibility);
    sent += await notify(db, {
      type: "poll_closed",
      actorId: null,
      tribeId: row.tribeId,
      entityType: "poll",
      entityId: row.id,
      recipients: [
        row.createdBy,
        ...voterIds,
        ...(await eventHostIds(db, row.eventId)),
        ...(await eventAttendeeIds(db, row.eventId)),
      ],
      title: `Poll closed: ${row.question}`,
      message: result ?? "",
      link: `${appLink.event(row.tribeId, row.eventId)}/poll/${row.id}`,
      collapse: true,
      once: true,
    });
  }
  for (const row of closedOnPosts) {
    const { options, voterIds } = await pollTally(row.id);
    sent += await notify(db, {
      type: "poll_closed",
      actorId: null,
      tribeId: row.tribeId,
      entityType: "poll",
      entityId: row.id,
      recipients: [row.createdBy, ...voterIds],
      title: `Poll closed: ${row.question}`,
      message: pollResultMessage(options, "after_voting") ?? "",
      link: appLink.post(row.tribeId, row.postId),
      collapse: true,
      once: true,
    });
  }
  return { closed: closed.length + closedOnPosts.length, sent };
}
