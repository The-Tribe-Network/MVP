import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/database/client";
import { event } from "@/lib/database/schemas/event";
import { poll } from "@/lib/database/schemas/poll";
import { post } from "@/lib/database/schemas/post";
import { pollVoteSchema } from "@/lib/validations/poll";

import { getServerUser } from "./auth";
import { getMemberWithPermissions } from "./permissions";
import { removeVote, votePoll } from "./poll";

// TRI-150: one vote code path for event polls and post polls. The poll's owner (its event's tribe or
// its post's tribe) decides who may vote; the tribe in the URL must be that tribe, and the event
// alias must name the poll's own event. Anything else answers 404 so ids cannot be probed.

type PollOwner = { tribeId: string; eventId: string | null; postId: string | null };

export async function resolvePollOwner(pollId: string): Promise<PollOwner | null> {
  const [row] = await db
    .select({
      eventId: poll.eventId,
      postId: poll.postId,
      eventTribeId: event.tribeId,
      postTribeId: post.tribeId,
    })
    .from(poll)
    .leftJoin(event, eq(poll.eventId, event.id))
    .leftJoin(post, eq(poll.postId, post.id))
    .where(eq(poll.id, pollId))
    .limit(1);
  if (!row) return null;
  const tribeId = row.eventTribeId ?? row.postTribeId;
  if (!tribeId) return null;
  return { tribeId, eventId: row.eventId, postId: row.postId };
}

type Scope = { tribeId: string; pollId: string; eventId?: string };

async function guard(scope: Scope) {
  const user = await getServerUser();
  if (!user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const member = await getMemberWithPermissions(scope.tribeId, user.id);
  if (!member) return { response: NextResponse.json({ error: "Not a member" }, { status: 403 }) };

  const owner = await resolvePollOwner(scope.pollId);
  const mismatch =
    !owner ||
    owner.tribeId !== scope.tribeId ||
    (scope.eventId !== undefined && owner.eventId !== scope.eventId);
  if (mismatch) return { response: NextResponse.json({ error: "Poll not found" }, { status: 404 }) };

  return { user };
}

/** POST …/votes { optionIds } → { success } */
export async function handleVote(request: NextRequest, scope: Scope) {
  try {
    const guarded = await guard(scope);
    if ("response" in guarded) return guarded.response;

    const validation = pollVoteSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await votePoll(scope.pollId, guarded.user.id, validation.data.optionIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error voting on poll:", error);
    return NextResponse.json({ error: "Failed to vote on poll" }, { status: 500 });
  }
}

/** DELETE …/votes[?optionId=] → { success } */
export async function handleRemoveVote(request: NextRequest, scope: Scope) {
  try {
    const guarded = await guard(scope);
    if ("response" in guarded) return guarded.response;

    const optionId = request.nextUrl.searchParams.get("optionId");
    await removeVote(scope.pollId, guarded.user.id, optionId || undefined);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing vote:", error);
    return NextResponse.json({ error: "Failed to remove vote" }, { status: 500 });
  }
}
