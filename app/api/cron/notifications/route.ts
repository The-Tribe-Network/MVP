import { NextRequest, NextResponse } from "next/server";

import { runEventReminders, runPollResults } from "@/lib/services/scheduled-notifications";

// GET /api/cron/notifications — Vercel Cron, every 15 min (vercel.json; TRI-184). Inserts event reminders
// (TRI-190) and poll results (TRI-219) through notify(); safe to run twice.
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
    const reminders = await runEventReminders(now);
    const pollResults = await runPollResults(now);
    return NextResponse.json({ now: now.toISOString(), reminders, pollResults });
  } catch (error) {
    console.error("Scheduled notifications failed:", error);
    return NextResponse.json({ error: "Scheduled notifications failed" }, { status: 500 });
  }
}
