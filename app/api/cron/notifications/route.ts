import { NextRequest, NextResponse } from "next/server";

import { sendDueEventChangeEmails } from "@/lib/services/event-change-emails";
import { purgeRetiredMedia } from "@/lib/services/media";
import { reportServerError } from "@/lib/clients/sentry";

// GET /api/cron/notifications — Vercel Cron, every 15 min (vercel.json; TRI-184). Sends due event-change emails
// (TRI-349) and destroys deleted photos whose 30 days are up (TRI-120); safe to run twice.
// Event reminders (TRI-190), poll results (TRI-219) and the daily digests (TRI-347) moved to tribe-api's worker
// (notifications.eventReminders / pollResults / digest, LOCAL_SCHEDULES); its jobs share `email_log` and notify()'s
// once-keys with these, so they never double up. To move them back, restore them here (TRI-485).
// Vercel sends `Authorization: Bearer $CRON_SECRET`. In development the secret is optional and `?now=<ISO>` fakes
// the clock, to check the windows without waiting.
export async function GET(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const secret = process.env.CRON_SECRET;
  if (!isDev || secret) {
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const nowParam = isDev ? request.nextUrl.searchParams.get("now") : null;
  const now = nowParam ? new Date(nowParam) : new Date();
  if (Number.isNaN(now.getTime())) return NextResponse.json({ error: "Invalid now" }, { status: 400 });

  try {
    const eventChangeEmails = await sendDueEventChangeEmails(now);
    const mediaPurged = await purgeRetiredMedia(now);
    return NextResponse.json({ now: now.toISOString(), eventChangeEmails, mediaPurged });
  } catch (error) {
    console.error("Scheduled notifications failed:", error);
    reportServerError(error, { route: "/api/cron/notifications", method: "GET" });
    return NextResponse.json({ error: "Scheduled notifications failed" }, { status: 500 });
  }
}
