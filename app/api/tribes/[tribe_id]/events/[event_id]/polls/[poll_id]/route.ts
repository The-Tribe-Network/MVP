import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { deletePoll } from "@/lib/services/poll";
import { getMemberWithPermissions } from "@/lib/services/permissions";
import { db } from "@/lib/database/client";
import { poll } from "@/lib/database/schemas/poll";
import { eq } from "drizzle-orm";

// DELETE /api/tribes/[tribe_id]/events/[event_id]/polls/[poll_id]
export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ tribe_id: string; event_id: string; poll_id: string }>;
  }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, poll_id } = await params;

    // Get poll to check ownership
    const [existingPoll] = await db
      .select()
      .from(poll)
      .where(eq(poll.id, poll_id))
      .limit(1);

    if (!existingPoll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const memberData = await getMemberWithPermissions(tribe_id, user.id);
    if (!memberData) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    // Can delete if: creator OR owner/admin
    const canDelete =
      existingPoll.createdBy === user.id ||
      ["owner", "admin"].includes(memberData.member.role);

    if (!canDelete) {
      return NextResponse.json(
        { error: "No permission to delete poll" },
        { status: 403 }
      );
    }

    await deletePoll(poll_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting poll:", error);
    return NextResponse.json(
      { error: "Failed to delete poll" },
      { status: 500 }
    );
  }
}
