import { NextRequest } from "next/server";

import { handleRemoveVote, handleVote } from "@/lib/services/poll-votes";

type Params = { params: Promise<{ tribe_id: string; poll_id: string }> };

// POST /api/tribes/[tribe_id]/polls/[poll_id]/votes — event-agnostic (TRI-150): event polls and
// post polls alike; the poll's owner decides the tribe.
export async function POST(request: NextRequest, { params }: Params) {
  const { tribe_id, poll_id } = await params;
  return handleVote(request, { tribeId: tribe_id, pollId: poll_id });
}

// DELETE /api/tribes/[tribe_id]/polls/[poll_id]/votes[?optionId=]
export async function DELETE(request: NextRequest, { params }: Params) {
  const { tribe_id, poll_id } = await params;
  return handleRemoveVote(request, { tribeId: tribe_id, pollId: poll_id });
}
