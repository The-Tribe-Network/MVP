import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { checkTribeMembership } from "@/lib/services/permissions";
import { MediaUploadError, signMediaUploads } from "@/lib/services/media-upload";
import { signMediaUploadSchema } from "@/lib/validations/media-upload";
import { validateApiRequest } from "@/lib/validations/tribe";

/**
 * POST /api/tribes/[tribe_id]/media/sign
 * Cloudinary signed-upload params for direct upload from the app (TRI-160, `signMediaUpload`).
 */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/tribes/[tribe_id]/media/sign">) {
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
    const validation = validateApiRequest(signMediaUploadSchema, body ?? {});
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const batch = await signMediaUploads(tribe_id, user.id, validation.data.count, validation.data.purpose ?? "media");
    return NextResponse.json(batch, { status: 200 });
  } catch (error) {
    if (error instanceof MediaUploadError && error.code === "FORBIDDEN") {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 403 });
    }
    console.error("Error signing media upload:", error);
    return NextResponse.json({ error: "Failed to sign media upload" }, { status: 500 });
  }
}
