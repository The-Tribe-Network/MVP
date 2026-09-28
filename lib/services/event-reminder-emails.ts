import { and, eq } from "drizzle-orm";

import { db } from "@/lib/database/client";
import { eventAttendee, tribe, user } from "@/lib/database/schemas";
import { emailLog } from "@/lib/database/schemas/email";
import { appName, sendEmail } from "@/lib/email/client";
import { renderEmail } from "@/lib/email/layout";
import { escapeHtml } from "@/lib/email/templates/content-report/escape";
import { formatWhen, validZone } from "@/lib/email/time";
import { openInAppUrl } from "@/lib/landing/urls";
import { emailRecipients } from "@/lib/services/email-preferences";
import { appLink } from "@/lib/services/notifications";

/**
 * The day-before reminder by email, until push reminders arrive in M6 (TRI-350). Run by the same cron tick as the
 * in-app reminders (`runEventReminders`), for events whose one-day mark is due and whose reminders are on.
 *
 * Only people going (not maybe) who said so before the one-day mark: someone who RSVP'd in the last 24 hours
 * already knows. One email per event per person, ever (`email_log`), so a rescheduled event isn't reminded twice.
 * The `eventUpdates` opt-out and the shared skip rules apply.
 */

export const DAY_BEFORE_MINUTES = 24 * 60;

type ReminderEvent = {
  id: string;
  tribeId: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  createdBy: string;
};

export async function sendDayBeforeReminderEmails(row: ReminderEvent): Promise<number> {
  const dayMark = new Date(row.startDate.getTime() - DAY_BEFORE_MINUTES * 60_000);
  const going = await db
    .select({ userId: eventAttendee.userId, updatedAt: eventAttendee.updatedAt })
    .from(eventAttendee)
    .where(and(eq(eventAttendee.eventId, row.id), eq(eventAttendee.status, "going")));
  const remind = going.filter((a) => a.updatedAt <= dayMark).map((a) => a.userId);
  if (remind.length === 0) return 0;

  // The host isn't an "actor" here: a reminder has none, so nobody is dropped for a block
  const recipients = await emailRecipients(remind, { category: "eventUpdates" });
  if (recipients.length === 0) return 0;

  const [tribeRow] = await db.select({ name: tribe.name }).from(tribe).where(eq(tribe.id, row.tribeId));
  const [host] = await db.select({ timezone: user.timezone }).from(user).where(eq(user.id, row.createdBy));
  const tribeName = tribeRow?.name ?? "your tribe";
  const goingLine = going.length === 1 ? "1 person is going." : `${going.length} people are going.`;
  const key = `event-reminder:${row.id}`;

  let sent = 0;
  for (const recipient of recipients) {
    // Claim first: only the run whose insert went in sends
    const claimed = await db
      .insert(emailLog)
      .values({ userId: recipient.id, key })
      .onConflictDoNothing()
      .returning({ userId: emailLog.userId });
    if (claimed.length === 0) continue;

    const timeZone = validZone(recipient.timezone) ?? validZone(host?.timezone) ?? "UTC";
    const when = formatWhen(row.startDate, row.endDate, timeZone);
    const unsubscribe = { userId: recipient.id, category: "eventUpdates" as const };
    const rendered = renderEmail({
      heading: `${row.title} is tomorrow`,
      preheader: [when, row.location].filter(Boolean).join(" · "),
      blocks: [
        `A reminder from ${tribeName}: ${row.title} is coming up.`,
        {
          html: `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:#09090b"><strong>When:</strong> ${escapeHtml(when)}${row.location ? `<br><strong>Where:</strong> ${escapeHtml(row.location)}` : ""}</p>`,
          text: `When: ${when}${row.location ? `\nWhere: ${row.location}` : ""}`,
        },
        goingLine,
      ],
      button: { label: `Open in ${appName}`, url: openInAppUrl(appLink.event(row.tribeId, row.id)) },
      reason: `You're getting this because you're going to ${row.title} in ${tribeName}.`,
      unsubscribe,
    });
    try {
      await sendEmail({ to: recipient.email, subject: `Tomorrow: ${row.title}`, ...rendered, unsubscribe });
      sent += 1;
    } catch {
      // sendEmail logged it; the claim stays, so it isn't retried (at most once)
    }
  }
  return sent;
}

