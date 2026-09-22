import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { deleteDraft, updateDraft } from "@/lib/services/draft";
import {
  draftIdParamSchema,
  updateDraftSchema,
  validateApiRequest,
} from "@/lib/validations/draft";

// Only the caller's own drafts resolve, so an unknown id and someone else's id both read as 404.
const notFound = () => NextResponse.json({ error: "Draft not found" }, { status: 404 });

/**
 * PATCH /api/me/drafts/[draft_id]
 * Replace the payload; returns the draft with its new `updatedAt` (`updateDraft`)
 */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/me/drafts/[draft_id]">
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = validateApiRequest(draftIdParamSchema, await ctx.params);
    if (!params.success) return notFound();

    const body = await request.json().catch(() => null);
    const validation = validateApiRequest(updateDraftSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const updated = await updateDraft(user.id, params.data.draft_id, validation.data.payload);
    if (!updated) return notFound();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating draft:", error);
    return NextResponse.json({ error: "Failed to update draft" }, { status: 500 });
  }
}

/**
 * DELETE /api/me/drafts/[draft_id]
 * Called when the draft is posted or discarded (`deleteDraft`)
 */
export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/me/drafts/[draft_id]">
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = validateApiRequest(draftIdParamSchema, await ctx.params);
    if (!params.success) return notFound();

    const deleted = await deleteDraft(user.id, params.data.draft_id);
    if (!deleted) return notFound();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 });
  }
}
