import { after, NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { createReport, sendReportEmails } from "@/lib/services/reports";
import { createReportSchema } from "@/lib/validations/reports";

/**
 * POST /api/reports (TRI-237)
 * Report a post, comment, photo or member of a tribe the caller belongs to. Body
 * `{ tribeId, targetType: post|comment|media|user, targetId, reason, note? }`.
 *
 * 201 `{ report, created: true }` — stored; the tribe owner and PLATFORM_OWNER_EMAIL are emailed after the response.
 * 200 `{ report, created: false }` — the caller already has an open report on this target (idempotent; no email).
 * 400 `VALIDATION_FAILED` | `CANNOT_REPORT_SELF` · 401 · 403 `NOT_A_MEMBER` · 404 `TARGET_NOT_FOUND` (unknown, or not in
 * that tribe; a `user` target must be a member of it) · 429 `RATE_LIMITED` (10 new reports / hour; `Retry-After`).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = createReportSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_FAILED", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await createReport(user.id, parsed.data);
    if (!result.ok) {
      switch (result.code) {
        case "NOT_A_MEMBER":
          return NextResponse.json({ error: "You are not a member of this tribe", code: result.code }, { status: 403 });
        case "TARGET_NOT_FOUND":
          return NextResponse.json({ error: "Nothing to report was found in this tribe", code: result.code }, { status: 404 });
        case "CANNOT_REPORT_SELF":
          return NextResponse.json({ error: "You can't report yourself or your own content", code: result.code }, { status: 400 });
        case "RATE_LIMITED":
          return NextResponse.json(
            { error: "Too many reports. Try again later.", code: result.code, retryAfterSeconds: result.retryAfterSeconds },
            { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
          );
      }
    }

    if (result.created) {
      // After the response: an email failure (or slowness) never affects the stored report
      const { report, target } = result;
      after(() => sendReportEmails(user.id, report, target));
    }

    return NextResponse.json({ report: result.report, created: result.created }, { status: result.created ? 201 : 200 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
