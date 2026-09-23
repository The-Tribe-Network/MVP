import { NextRequest, NextResponse } from "next/server";
import { MULTIPART_BODY_LIMIT_BYTES, MAX_UPLOAD_BYTES_HARD_CAP } from "@/lib/utils/image";
import { getTribeSettings } from "./tribe-settings";

/**
 * Size limits for the multipart upload routes (TRI-11).
 *
 * Vercel drops any request body over 4.5 MB with 413 FUNCTION_PAYLOAD_TOO_LARGE before the handler
 * runs. Mirroring that here gives `next dev` the same behaviour and gives the app a code it can act
 * on: switch to the signed direct-upload flow (POST /media/sign + /media/confirm, TRI-160).
 */
export function rejectOversizedBody(request: NextRequest): NextResponse | null {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MULTIPART_BODY_LIMIT_BYTES) {
    return NextResponse.json(
      {
        error: `Request body exceeds the ${MULTIPART_BODY_LIMIT_BYTES}-byte multipart limit; use POST /media/sign and /media/confirm for large files`,
        code: "PAYLOAD_TOO_LARGE",
        limitBytes: MULTIPART_BODY_LIMIT_BYTES,
      },
      { status: 413 },
    );
  }
  return null;
}

/** Per-file limit for the multipart routes: the tribe's maxMediaFileSize, capped by the platform body limit. */
export async function multipartFileLimit(tribeId: string): Promise<number> {
  const settings = await getTribeSettings(tribeId);
  return Math.min(settings.maxMediaFileSize * 1024 * 1024, MAX_UPLOAD_BYTES_HARD_CAP, MULTIPART_BODY_LIMIT_BYTES);
}
