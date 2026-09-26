import { NextRequest, NextResponse } from "next/server";
import { addReaction, removeReaction } from "@/lib/services/chat";
import { jsonBody, parse, timelineRoute } from "@/lib/services/timeline-routes";
import { chatMessageParamsSchema, reactionSchema } from "@/lib/validations/chat";

type Ctx = RouteContext<"/api/tribes/[tribe_id]/timelines/[timeline_id]/messages/[message_id]/reactions">;

// POST …/reactions { emoji }: react (idempotent); returns the message's reactions (TRI-315)
export async function POST(request: NextRequest, ctx: Ctx) {
  return timelineRoute("reacting to a message", async (userId) => {
    const params = parse(chatMessageParamsSchema, await ctx.params);
    if (!params.ok) return params.response;
    const body = parse(reactionSchema, await jsonBody(request));
    if (!body.ok) return body.response;
    const { tribe_id, timeline_id, message_id } = params.data;
    const reactions = await addReaction(tribe_id, timeline_id, message_id, userId, body.data.emoji);
    return NextResponse.json({ reactions });
  });
}

// DELETE …/reactions?emoji=: take your reaction back (idempotent)
export async function DELETE(request: NextRequest, ctx: Ctx) {
  return timelineRoute("removing a reaction", async (userId) => {
    const params = parse(chatMessageParamsSchema, await ctx.params);
    if (!params.ok) return params.response;
    const query = parse(reactionSchema, { emoji: request.nextUrl.searchParams.get("emoji") ?? undefined });
    if (!query.ok) return query.response;
    const { tribe_id, timeline_id, message_id } = params.data;
    const reactions = await removeReaction(tribe_id, timeline_id, message_id, userId, query.data.emoji);
    return NextResponse.json({ reactions });
  });
}
