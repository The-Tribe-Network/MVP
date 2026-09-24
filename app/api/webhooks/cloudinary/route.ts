import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/clients/cloudinary";
import { confirmFromUploadNotification } from "@/lib/services/media-upload";

/** Notifications older than this are refused (Cloudinary's own default window is 2 hours). */
const SIGNATURE_VALID_FOR_SECONDS = 2 * 60 * 60;

/**
 * POST /api/webhooks/cloudinary
 * Cloudinary upload notifications for signed slots issued with `notification_url` (TRI-275): confirms
 * the upload server-side as the uploader named in the signed `context`, with the same idempotent confirm
 * the app uses, so a photo uploaded while the app was backgrounded still lands in the tribe.
 *
 * - 401 `{ error: "Invalid signature" }`: missing or bad `X-Cld-Timestamp` / `X-Cld-Signature`, or
 *   older than 2 hours. Verified over the raw body with the Cloudinary SDK.
 * - 200 `{ ok: true }`: handled, or deliberately ignored (other notification types, foreign folders,
 *   no context, rights or asset checks failing). No details are returned; the reason is logged.
 * - 500: an unexpected failure (database, Admin API), so Cloudinary retries.
 */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const timestamp = Number(request.headers.get("x-cld-timestamp"));
  const signature = request.headers.get("x-cld-signature") ?? "";

  const valid =
    Number.isFinite(timestamp) &&
    timestamp > 0 &&
    signature !== "" &&
    // Also refuse timestamps from the future beyond a little clock skew.
    timestamp <= Math.floor(Date.now() / 1000) + 300 &&
    cloudinary.utils.verifyNotificationSignature(raw, timestamp, signature, SIGNATURE_VALID_FOR_SECONDS);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    const outcome = await confirmFromUploadNotification(payload as Record<string, unknown>);
    if (outcome.status === "ignored") {
      console.info(`cloudinary webhook: ignored ${String((payload as { public_id?: unknown }).public_id ?? "")}: ${outcome.reason}`);
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("cloudinary webhook: confirm failed", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
