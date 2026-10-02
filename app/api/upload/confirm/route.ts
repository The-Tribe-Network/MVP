import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { MediaUploadError } from "@/lib/services/media-upload";
import { confirmUserUpload } from "@/lib/services/user-media-upload";
import { confirmUserUploadSchema } from "@/lib/validations/media-upload";
import { validateApiRequest } from "@/lib/validations/tribe";
import { reportServerError } from "@/lib/clients/sentry";

/**
 * POST /api/upload/confirm
 * Finish a user-scoped signed upload (TRI-417). Body `{ purpose, asset: { publicId, url, width, height,
 * bytes, format } }`. Verifies the asset like the tribe-scoped confirm, then does what the multipart route
 * for that purpose does: `avatar` creates the media row and sets `user.image` (`/upload/avatar`);
 * `tribe-avatar` creates the media row whose `id` goes to `POST /tribes` as `avatar` (`/upload/tribe-avatar`).
 * Answers their shape `{ id, url, width, height, fileSize, mimeType }`: 201 created, 200 when this user
 * already confirmed the asset (idempotent, nothing re-applied). 413 FILE_TOO_LARGE, other asset errors 400
 * `{ error, code }`.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const validation = validateApiRequest(confirmUserUploadSchema, body ?? {});
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { purpose, asset } = validation.data;
    const result = await confirmUserUpload(user.id, purpose, asset);
    return NextResponse.json(result.upload, { status: result.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof MediaUploadError) {
      const status = error.code === "FORBIDDEN" ? 403 : error.code === "FILE_TOO_LARGE" ? 413 : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    console.error("Error confirming user upload:", error);
    reportServerError(error, { route: "/api/upload/confirm", method: "POST" });
    return NextResponse.json({ error: "Failed to confirm upload" }, { status: 500 });
  }
}
