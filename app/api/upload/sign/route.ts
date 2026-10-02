import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { signUserUpload } from "@/lib/services/user-media-upload";
import { signUserUploadSchema } from "@/lib/validations/media-upload";
import { validateApiRequest } from "@/lib/validations/tribe";
import { reportServerError } from "@/lib/clients/sentry";

/**
 * POST /api/upload/sign
 * Cloudinary signed-upload params for an image that belongs to the caller, not a tribe (TRI-417): the
 * profile photo (`purpose: "avatar"`) or a tribe avatar picked before the tribe exists (`"tribe-avatar"`).
 * Body `{ purpose }`. Answers the tribe-scoped sign's `SignedUploadBatch` with one slot under
 * `users/<userId>/…`; POST `params` verbatim (plus `file`, `api_key`) to Cloudinary, then call
 * `/api/upload/confirm`. Signed in only (401); bad body 400.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const validation = validateApiRequest(signUserUploadSchema, body ?? {});
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    return NextResponse.json(signUserUpload(user.id, validation.data.purpose), { status: 200 });
  } catch (error) {
    console.error("Error signing user upload:", error);
    reportServerError(error, { route: "/api/upload/sign", method: "POST" });
    return NextResponse.json({ error: "Failed to sign upload" }, { status: 500 });
  }
}
