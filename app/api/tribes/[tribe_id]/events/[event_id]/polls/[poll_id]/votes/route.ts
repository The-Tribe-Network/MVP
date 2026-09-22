import { NextRequest } from "next/server";

import { handleRemoveVote, handleVote } from "@/lib/services/poll-votes";

type Params = { params: Promise<{ tribe_id: string; event_id: string; poll_id: string }> };

// Thin aliases over the event-agnostic route (TRI-150) so web keeps its URLs. The poll must belong
// to this event; otherwise 404.

// POST /api/tribes/[tribe_id]/events/[event_id]/polls/[poll_id]/votes
export async function POST(request: NextRequest, { params }: Params) {
  const { tribe_id, event_id, poll_id } = await params;
  return handleVote(request, { tribeId: tribe_id, pollId: poll_id, eventId: event_id });
}

// DELETE /api/tribes/[tribe_id]/events/[event_id]/polls/[poll_id]/votes[?optionId=]
export async function DELETE(request: NextRequest, { params }: Params) {
  const { tribe_id, event_id, poll_id } = await params;
  return handleRemoveVote(request, { tribeId: tribe_id, pollId: poll_id, eventId: event_id });
}
