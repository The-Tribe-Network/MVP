import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { createDraft, listDrafts, NotAMemberError } from "@/lib/services/draft";
import {
  createDraftSchema,
  listDraftsQuerySchema,
  validateApiRequest,
} from "@/lib/validations/draft";

/**
 * GET /api/me/drafts?tribeId&kind
 * The caller's saved drafts, newest first (mobile contract `listDrafts`, TRI-168)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = request.nextUrl.searchParams;
    const validation = validateApiRequest(listDraftsQuerySchema, {
      tribeId: params.get("tribeId") ?? undefined,
      kind: params.get("kind") ?? undefined,
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error },
        { status: 400 }
      );
    }

    const drafts = await listDrafts(user.id, validation.data);
    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error listing drafts:", error);
    return NextResponse.json({ error: "Failed to list drafts" }, { status: 500 });
  }
}

/**
 * POST /api/me/drafts
 * Save a new draft for a tribe the caller belongs to (`createDraft`)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const validation = validateApiRequest(createDraftSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const created = await createDraft(user.id, validation.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof NotAMemberError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error creating draft:", error);
    return NextResponse.json({ error: "Failed to create draft" }, { status: 500 });
  }
}
