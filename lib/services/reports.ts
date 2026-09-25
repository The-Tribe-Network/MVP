import { and, count, eq, gt, isNull, min, sql } from "drizzle-orm";

import { db } from "@/lib/database/client";
import { user } from "@/lib/database/schemas/auth";
import { event } from "@/lib/database/schemas/event";
import { media } from "@/lib/database/schemas/media";
import { comment, post } from "@/lib/database/schemas/post";
import { report } from "@/lib/database/schemas/safety";
import { tribe, tribeMember } from "@/lib/database/schemas/tribe";
import type { CreateReportInput } from "@/lib/validations/reports";
import { canUserSeeMedia } from "./album";
import { excerpt } from "./notifications";
import { checkTribeMembership } from "./permissions";

/**
 * Reports (TRI-237; owner decision TRI-105: a report floor for the alpha). A member reports a post, comment,
 * photo or member of a tribe they belong to; the row is stored and the tribe owner and the platform owner are
 * emailed. No queue, dashboard or auto-hiding yet (TRI-19). See docs/specs/TRI-237-238-reports-and-blocking.md.
 */

/** At most this many new reports per reporter per rolling hour (a repeat of an open report doesn't count). */
export const REPORT_RATE_LIMIT = { max: 10, windowMs: 60 * 60 * 1000 } as const;

export type ReportDto = {
  id: string;
  tribeId: string;
  targetType: (typeof report.$inferSelect)["targetType"];
  targetId: string;
  reason: (typeof report.$inferSelect)["reason"];
  note: string | null;
  status: (typeof report.$inferSelect)["status"];
  createdAt: Date;
};

const reportColumns = {
  id: report.id,
  tribeId: report.tribeId,
  targetType: report.targetType,
  targetId: report.targetId,
  reason: report.reason,
  note: report.note,
  status: report.status,
  createdAt: report.createdAt,
};

/** Who is behind the target and what it says, for the self-report check and the email. */
type ResolvedTarget = { authorId: string; authorName: string; excerpt: string | null };

/**
 * The target, only if it exists **in this tribe** (a comment through its post or event; a photo the reporter may
 * see, TRI-273; a user who is a live member). Anything else is null (404), so a report cannot probe other tribes.
 */
async function resolveTarget(input: CreateReportInput, reporterId: string): Promise<ResolvedTarget | null> {
  const { tribeId, targetType, targetId } = input;
  switch (targetType) {
    case "post": {
      const [row] = await db
        .select({ authorId: post.authorId, authorName: user.name, content: post.content })
        .from(post)
        .innerJoin(user, eq(post.authorId, user.id))
        .where(and(eq(post.id, targetId), eq(post.tribeId, tribeId)))
        .limit(1);
      return row ? { authorId: row.authorId, authorName: row.authorName, excerpt: excerpt(row.content, 280) || null } : null;
    }
    case "comment": {
      const [row] = await db
        .select({ authorId: comment.authorId, authorName: user.name, content: comment.content })
        .from(comment)
        .innerJoin(user, eq(comment.authorId, user.id))
        .leftJoin(post, eq(comment.postId, post.id))
        .leftJoin(event, eq(comment.eventId, event.id))
        .where(and(eq(comment.id, targetId), sql`coalesce(${post.tribeId}, ${event.tribeId}) = ${tribeId}::uuid`))
        .limit(1);
      return row ? { authorId: row.authorId, authorName: row.authorName, excerpt: excerpt(row.content, 280) || null } : null;
    }
    case "media": {
      const [row] = await db
        .select({ authorId: media.uploadedBy, authorName: user.name, fileUrl: media.fileUrl })
        .from(media)
        .innerJoin(user, eq(media.uploadedBy, user.id))
        .where(and(eq(media.id, targetId), eq(media.tribeId, tribeId)))
        .limit(1);
      if (!row || !(await canUserSeeMedia(targetId, tribeId, reporterId))) return null;
      return { authorId: row.authorId, authorName: row.authorName, excerpt: row.fileUrl };
    }
    case "user": {
      const [row] = await db
        .select({ id: user.id, name: user.name })
        .from(tribeMember)
        .innerJoin(user, eq(tribeMember.userId, user.id))
        .where(and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, targetId), isNull(user.deletedAt)))
        .limit(1);
      return row ? { authorId: row.id, authorName: row.name, excerpt: null } : null;
    }
  }
}

export type CreateReportResult =
  | { ok: true; created: boolean; report: ReportDto; target: ResolvedTarget }
  | { ok: false; code: "NOT_A_MEMBER" | "TARGET_NOT_FOUND" | "CANNOT_REPORT_SELF" }
  | { ok: false; code: "RATE_LIMITED"; retryAfterSeconds: number };

async function openReportOf(reporterId: string, input: CreateReportInput) {
  const [row] = await db
    .select(reportColumns)
    .from(report)
    .where(
      and(
        eq(report.reporterId, reporterId),
        eq(report.targetType, input.targetType),
        eq(report.targetId, input.targetId),
        eq(report.status, "open")
      )
    )
    .limit(1);
  return row ?? null;
}

/**
 * POST /reports. Order of checks: membership (403) → target in the tribe (404) → not yourself (400) → an open
 * report by the same reporter on the same target is returned as is (idempotent, `created: false`, no email, no
 * rate-limit charge) → rate limit (429) → insert.
 */
export async function createReport(reporterId: string, input: CreateReportInput): Promise<CreateReportResult> {
  if (!(await checkTribeMembership(input.tribeId, reporterId))) return { ok: false, code: "NOT_A_MEMBER" };

  const target = await resolveTarget(input, reporterId);
  if (!target) return { ok: false, code: "TARGET_NOT_FOUND" };
  if (target.authorId === reporterId) return { ok: false, code: "CANNOT_REPORT_SELF" };

  const existing = await openReportOf(reporterId, input);
  if (existing) return { ok: true, created: false, report: existing, target };

  const windowStart = new Date(Date.now() - REPORT_RATE_LIMIT.windowMs);
  const [recent] = await db
    .select({ n: count(), oldest: min(report.createdAt) })
    .from(report)
    .where(and(eq(report.reporterId, reporterId), gt(report.createdAt, windowStart)));
  if (Number(recent?.n ?? 0) >= REPORT_RATE_LIMIT.max) {
    const freesAt = (recent?.oldest?.getTime() ?? Date.now()) + REPORT_RATE_LIMIT.windowMs;
    return { ok: false, code: "RATE_LIMITED", retryAfterSeconds: Math.max(1, Math.ceil((freesAt - Date.now()) / 1000)) };
  }

  const [inserted] = await db
    .insert(report)
    .values({
      reporterId,
      tribeId: input.tribeId,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      note: input.note,
    })
    // A concurrent duplicate loses to report_open_reporter_target_unique and gets the winner's row
    .onConflictDoNothing()
    .returning(reportColumns);
  if (inserted) return { ok: true, created: true, report: inserted, target };

  const winner = await openReportOf(reporterId, input);
  if (!winner) throw new Error("Report insert conflicted but no open report was found");
  return { ok: true, created: false, report: winner, target };
}

/**
 * Emails a new report to the tribe owner and to PLATFORM_OWNER_EMAIL (unset → skipped and logged). Runs after the
 * response (`after()` in the route) and never throws: a failed email never fails or undoes the report. The tribe
 * owner is skipped when the report is about them or their content (the platform owner still hears); one message
 * per recipient, so neither sees the other's address.
 */
export async function sendReportEmails(reporterId: string, created: ReportDto, target: ResolvedTarget): Promise<void> {
  const tag = `[reports] report=${created.id}`;
  try {
    const [[tribeRow], [reporter], [owner]] = await Promise.all([
      db.select({ name: tribe.name }).from(tribe).where(eq(tribe.id, created.tribeId)).limit(1),
      db.select({ name: user.name }).from(user).where(eq(user.id, reporterId)).limit(1),
      db
        .select({ id: user.id, email: user.email })
        .from(tribeMember)
        .innerJoin(user, eq(tribeMember.userId, user.id))
        .where(and(eq(tribeMember.tribeId, created.tribeId), eq(tribeMember.role, "owner")))
        .limit(1),
    ]);

    const recipients: { role: "tribe_owner" | "platform_owner"; email: string }[] = [];
    if (!owner) console.warn(`${tag} tribe has no owner; tribe owner not emailed`);
    else if (owner.id === target.authorId) console.info(`${tag} report is about the tribe owner; tribe owner not emailed`);
    else recipients.push({ role: "tribe_owner", email: owner.email });

    const platformOwner = process.env.PLATFORM_OWNER_EMAIL?.trim();
    if (!platformOwner) console.warn(`${tag} PLATFORM_OWNER_EMAIL is not set; platform owner not emailed`);
    else if (!recipients.some((r) => r.email.toLowerCase() === platformOwner.toLowerCase())) {
      recipients.push({ role: "platform_owner", email: platformOwner });
    }
    if (recipients.length === 0) return;

    // Imported here so a missing RESEND_API_KEY (the client throws at import) cannot break report creation
    const { sendContentReportEmail } = await import("@/lib/email/templates/content-report/send-content-report-email");
    const data = {
      reportId: created.id,
      tribeId: created.tribeId,
      tribeName: tribeRow?.name ?? "a tribe",
      reporterName: reporter?.name ?? "A member",
      targetType: created.targetType,
      targetId: created.targetId,
      targetAuthorName: target.authorName,
      targetExcerpt: target.excerpt,
      reason: created.reason,
      note: created.note,
      createdAt: created.createdAt,
    };
    await Promise.all(
      recipients.map(async (recipient) => {
        try {
          const sent = await sendContentReportEmail({ ...data, to: [recipient.email] });
          console.info(`${tag} email sent to ${recipient.role} (resend id ${sent?.id ?? "?"})`);
        } catch (error) {
          console.error(`${tag} email to ${recipient.role} failed:`, error instanceof Error ? error.message : error);
        }
      })
    );
  } catch (error) {
    console.error(`${tag} emails not sent:`, error);
  }
}
