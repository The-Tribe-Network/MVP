import { after, NextRequest, NextResponse } from "next/server";
import { deleteMessage, editMessage, refreshLinkPreview } from "@/lib/services/chat";
import { jsonBody, parse, timelineRoute } from "@/lib/services/timeline-routes";
import { chatMessageParamsSchema, editMessageSchema } from "@/lib/validations/chat";

type Ctx = RouteContext<"/api/tribes/[tribe_id]/timelines/[timeline_id]/messages/[message_id]">;

// PATCH …/messages/:message_id: edit your own message's text (TRI-315)
export async function PATCH(request: NextRequest, ctx: Ctx) {
  return timelineRoute("editing a message", async (userId) => {
    const params = parse(chatMessageParamsSchema, await ctx.params);
    if (!params.ok) return params.response;
    const body = parse(editMessageSchema, await jsonBody(request));
    if (!body.ok) return body.response;
    const { tribe_id, timeline_id, message_id } = params.data;
    const message = await editMessage(tribe_id, timeline_id, message_id, userId, body.data);
    after(() => refreshLinkPreview(message.id));
    return NextResponse.json({ message });
  });
}

// DELETE …/messages/:message_id: yours, or any with canDeleteAnyPost; leaves a "Message deleted" placeholder
export async function DELETE(_request: NextRequest, ctx: Ctx) {
  return timelineRoute("deleting a message", async (userId) => {
    const params = parse(chatMessageParamsSchema, await ctx.params);
    if (!params.ok) return params.response;
    const { tribe_id, timeline_id, message_id } = params.data;
    await deleteMessage(tribe_id, timeline_id, message_id, userId);
    return NextResponse.json({ success: true });
  });
}
