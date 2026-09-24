import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { checkTribeMembership } from "@/lib/services/permissions";
import { MediaUploadError, confirmMediaUploads } from "@/lib/services/media-upload";
import { InvalidAlbumError } from "@/lib/services/album";
import { confirmMediaUploadSchema } from "@/lib/validations/media-upload";
import { validateApiRequest } from "@/lib/validations/tribe";

/**
 * POST /api/tribes/[tribe_id]/media/confirm
 * Create `media` rows for assets the app uploaded straight to Cloudinary (TRI-160, `confirmMediaUpload`).
 * All-or-nothing: the first bad asset fails the whole request and nothing is inserted.
 * Idempotent per uploader (TRI-275): assets this user already confirmed here come back as they are;
 * 201 when anything was created, 200 when every asset was already confirmed. Same `{ media }` shape.
 */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/tribes/[tribe_id]/media/confirm">) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    if (!(await checkTribeMembership(tribe_id, user.id))) {
      return NextResponse.json({ error: "You are not a member of this tribe" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const validation = validateApiRequest(confirmMediaUploadSchema, body ?? {});
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { assets, albumId, addToAlbum } = validation.data;
    const result = await confirmMediaUploads(tribe_id, user.id, assets, albumId, addToAlbum ?? true);
    return NextResponse.json({ media: result.media }, { status: result.createdCount > 0 ? 201 : 200 });
  } catch (error) {
    if (error instanceof InvalidAlbumError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    if (error instanceof MediaUploadError) {
      const status =
        error.code === "FORBIDDEN" || error.code === "ALBUM_FORBIDDEN" ? 403 : error.code === "FILE_TOO_LARGE" ? 413 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code, ...(error.index !== undefined ? { index: error.index } : {}) },
        { status },
      );
    }
    console.error("Error confirming media upload:", error);
    return NextResponse.json({ error: "Failed to confirm media upload" }, { status: 500 });
  }
}
