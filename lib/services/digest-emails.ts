import { and, desc, eq, gt, inArray, isNull, like, max, or, sql } from "drizzle-orm";

import { db } from "@/lib/database/client";
import { notification, tribe, tribeMember, tribeMemberPreference, user } from "@/lib/database/schemas";
import { emailLog } from "@/lib/database/schemas/email";
import { appName, sendEmail } from "@/lib/email/client";
import { renderEmail, type EmailBlock } from "@/lib/email/layout";
import { escapeHtml } from "@/lib/email/templates/content-report/escape";
import { validZone } from "@/lib/email/time";
import { excludeBlocked } from "@/lib/services/blocks";
import { emailRecipients } from "@/lib/services/email-preferences";
import { excerpt } from "@/lib/services/notifications";

/**
 * The daily digest of unread notifications (TRI-347; owner, 2026-09-27: digest only, no per-notification mail until
 * push). Run by the cron route every 15 minutes: a user gets it once per local day, in the 9 am hour of their
 * timezone (`user.timezone`, else US Eastern for this US-first alpha).
 *
 * Only when there's something new: unread rows that changed since the last digest (else the last 24 h). Someone who
 * opened the app and read them gets nothing; rows from muted tribes and from anyone blocked either way are left
 * out. Once per local day through `email_log` (`digest:<YYYY-MM-DD>`), which is also where "since the last digest"
 * comes from. The `digest` opt-out and the shared skip rules apply.
 */

export const DIGEST_HOUR = 9;
const FALLBACK_ZONE = "America/New_York";
const MAX_ROWS = 8;
const DAY_MS = 24 * 60 * 60_000;
const NOTIFICATIONS_LINK = "tribe://notifications";

export async function runDailyDigests(now = new Date()): Promise<{ candidates: number; sent: number }> {
  // Anyone with an unread row that changed in the last two days (a digest looks back one day at most)
  const candidates = await db
    .selectDistinct({ userId: notification.userId })
    .from(notification)
    .where(and(isNull(notification.readAt), gt(notification.latestAt, new Date(now.getTime() - 2 * DAY_MS))));
  if (candidates.length === 0) return { candidates: 0, sent: 0 };

  const recipients = await emailRecipients(
    candidates.map((c) => c.userId),
    { category: "digest" }
  );
  let sent = 0;
  for (const recipient of recipients) {
    const zone = validZone(recipient.timezone) ?? FALLBACK_ZONE;
    if (localHour(now, zone) !== DIGEST_HOUR) continue;
    try {
      if (await sendDigest(recipient, zone, now)) sent += 1;
    } catch (error) {
      console.error("[digest] failed:", error instanceof Error ? error.message : error);
    }
  }
  return { candidates: candidates.length, sent };
}

type Recipient = Awaited<ReturnType<typeof emailRecipients>>[number];

async function sendDigest(recipient: Recipient, zone: string, now: Date): Promise<boolean> {
  const [last] = await db
    .select({ at: max(emailLog.sentAt) })
    .from(emailLog)
    .where(and(eq(emailLog.userId, recipient.id), like(emailLog.key, "digest:%")));
  const since = last?.at && last.at.getTime() > now.getTime() - DAY_MS ? last.at : new Date(now.getTime() - DAY_MS);

  const rows = await db
    .select({
      title: notification.title,
      message: notification.message,
      actorId: notification.actorId,
      actorCount: notification.actorCount,
      tribeId: notification.tribeId,
      tribeName: tribe.name,
    })
    .from(notification)
    .leftJoin(tribe, eq(tribe.id, notification.tribeId))
    .where(
      and(
        eq(notification.userId, recipient.id),
        isNull(notification.readAt),
        gt(notification.latestAt, since),
        // A muted tribe (NOTIF-04) stays out of the digest
        or(
          isNull(notification.tribeId),
          sql`not exists (select 1 from ${tribeMemberPreference} tmp join ${tribeMember} tm on tm.id = tmp.tribe_member_id
            where tmp.user_id = ${recipient.id} and tm.tribe_id = ${notification.tribeId} and tmp.notifications_muted)`
        ),
        // Nothing from someone blocked either way, even if the row predates the block (TRI-238)
        excludeBlocked(recipient.id, notification.actorId)
      )
    )
    .orderBy(desc(notification.latestAt));
  if (rows.length === 0) return false;

  // Claim today's digest; a second tick in the same hour finds it taken
  const claimed = await db
    .insert(emailLog)
    .values({ userId: recipient.id, key: `digest:${localDate(now, zone)}` })
    .onConflictDoNothing()
    .returning({ userId: emailLog.userId });
  if (claimed.length === 0) return false;

  const shown = rows.slice(0, MAX_ROWS);
  const actorIds = [...new Set(shown.map((r) => r.actorId).filter((id): id is string => Boolean(id)))];
  const actors = actorIds.length
    ? await db.select({ id: user.id, name: user.name, displayName: user.displayName }).from(user).where(inArray(user.id, actorIds))
    : [];
  const actorName = new Map(actors.map((a) => [a.id, a.displayName || a.name]));

  // Group by tribe, in the order each tribe's newest row appears
  const groups = new Map<string, { name: string; lines: { text: string; detail: string }[] }>();
  for (const row of shown) {
    const key = row.tribeId ?? "account";
    const group = groups.get(key) ?? { name: row.tribeName ?? "Your account", lines: [] };
    const name = row.actorId ? actorName.get(row.actorId) : undefined;
    const others = row.actorCount - 1;
    const lead = name ? (others > 0 ? `${name} and ${others} ${others === 1 ? "other" : "others"} ` : `${name} `) : "";
    group.lines.push({ text: `${lead}${row.title}`, detail: row.message });
    groups.set(key, group);
  }

  const blocks: EmailBlock[] = [...groups.values()].map((group) => ({
    html:
      `<p style="margin:16px 0 8px;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#67676f">${escapeHtml(group.name)}</p>` +
      group.lines
        .map(
          (line) =>
            `<p style="margin:0 0 10px;font-size:16px;line-height:22px;color:#09090b">${escapeHtml(line.text)}${
              line.detail ? `<br><span style="font-size:14px;color:#67676f">${escapeHtml(excerpt(line.detail, 90))}</span>` : ""
            }</p>`
        )
        .join(""),
    text: [group.name.toUpperCase(), ...group.lines.map((l) => `- ${l.text}${l.detail ? ` (${excerpt(l.detail, 90)})` : ""}`)].join("\n"),
  }));
  const more = rows.length - shown.length;
  if (more > 0) blocks.push(`And ${more} more in the app.`);

  const count = rows.length;
  const tribeNames = [...new Set(rows.map((r) => r.tribeName).filter(Boolean))] as string[];
  const where = tribeNames.length === 1 ? ` in ${tribeNames[0]}` : tribeNames.length > 1 ? ` across ${tribeNames.length} tribes` : "";
  const unsubscribe = { userId: recipient.id, category: "digest" as const };
  const { html, text } = renderEmail({
    heading: "What you missed",
    preheader: `${count} new ${count === 1 ? "notification" : "notifications"}${where}`,
    blocks,
    button: { label: "Open notifications", url: NOTIFICATIONS_LINK },
    reason: `You're getting this daily summary because you have unread notifications on ${appName}. It only comes when something's new.`,
    unsubscribe,
  });
  await sendEmail({
    to: recipient.email,
    subject: `${count} new on ${appName}${where}`,
    html,
    text,
    unsubscribe,
  });
  return true;
}

function localHour(now: Date, zone: string): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", hourCycle: "h23" }).format(now));
}

/** YYYY-MM-DD in `zone` */
function localDate(now: Date, zone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

