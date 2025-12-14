import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { votePoll, removeVote } from "@/lib/services/poll";
import { getMemberWithPermissions } from "@/lib/services/permissions";
import { pollVoteSchema } from "@/lib/validations/poll";

// POST /api/tribes/[tribe_id]/events/[event_id]/polls/[poll_id]/votes
export async function POST(
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

    const memberData = await getMemberWithPermissions(tribe_id, user.id);
    if (!memberData) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    const body = await request.json();
    const validation = pollVoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    await votePoll(poll_id, user.id, validation.data.optionIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error voting on poll:", error);
    return NextResponse.json(
      { error: "Failed to vote on poll" },
      { status: 500 }
    );
  }
}

// DELETE /api/tribes/[tribe_id]/events/[event_id]/polls/[poll_id]/votes
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

    const { poll_id } = await params;

    const searchParams = request.nextUrl.searchParams;
    const optionId = searchParams.get("optionId");

    await removeVote(poll_id, user.id, optionId || undefined);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing vote:", error);
    return NextResponse.json(
      { error: "Failed to remove vote" },
      { status: 500 }
    );
  }
}
