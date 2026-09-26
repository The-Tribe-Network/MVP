import { after, NextRequest, NextResponse } from "next/server";
import { deleteMessage, editMessage, getMessage, refreshLinkPreview } from "@/lib/services/chat";
import { publishChatEvent } from "@/lib/services/realtime";
import { jsonBody, parse, timelineRoute } from "@/lib/services/timeline-routes";
import { chatMessageParamsSchema, editMessageSchema } from "@/lib/validations/chat";

type Ctx = RouteContext<"/api/tribes/[tribe_id]/timelines/[timeline_id]/messages/[message_id]">;

// GET …/messages/:message_id: one message, after a live event (TRI-316)
export async function GET(_request: NextRequest, ctx: Ctx) {
  return timelineRoute("fetching a message", async (userId) => {
    const params = parse(chatMessageParamsSchema, await ctx.params);
    if (!params.ok) return params.response;
    const { tribe_id, timeline_id, message_id } = params.data;
    return NextResponse.json({ message: await getMessage(tribe_id, timeline_id, message_id, userId) });
  });
}

// PATCH …/messages/:message_id: edit your own message's text (TRI-315)
export async function PATCH(request: NextRequest, ctx: Ctx) {
  return timelineRoute("editing a message", async (userId) => {
    const params = parse(chatMessageParamsSchema, await ctx.params);
    if (!params.ok) return params.response;
    const body = parse(editMessageSchema, await jsonBody(request));
    if (!body.ok) return body.response;
    const { tribe_id, timeline_id, message_id } = params.data;
    const message = await editMessage(tribe_id, timeline_id, message_id, userId, body.data);
    after(async () => {
      await publishChatEvent("edited", message.timelineId, message.id, userId);
      if (await refreshLinkPreview(message.id)) {
        await publishChatEvent("edited", message.timelineId, message.id, userId);
      }
    });
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
    after(() => publishChatEvent("deleted", timeline_id, message_id, userId));
    return NextResponse.json({ success: true });
  });
}
