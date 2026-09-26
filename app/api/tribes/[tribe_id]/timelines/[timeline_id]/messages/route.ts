import { after, NextRequest, NextResponse } from "next/server";
import { listMessages, refreshLinkPreview, sendMessage } from "@/lib/services/chat";
import { publishChatEvent } from "@/lib/services/realtime";
import { jsonBody, parse, timelineRoute } from "@/lib/services/timeline-routes";
import { listMessagesQuerySchema, sendMessageSchema } from "@/lib/validations/chat";
import { tribeTimelineParamsSchema } from "@/lib/validations/timeline";

type Ctx = RouteContext<"/api/tribes/[tribe_id]/timelines/[timeline_id]/messages">;

// GET …/messages?before=&after=&limit=: history newest first; `after` = catch-up, oldest first (TRI-315/316)
export async function GET(request: NextRequest, ctx: Ctx) {
  return timelineRoute("fetching messages", async (userId) => {
    const params = parse(tribeTimelineParamsSchema, await ctx.params);
    if (!params.ok) return params.response;
    const search = request.nextUrl.searchParams;
    const query = parse(listMessagesQuerySchema, {
      before: search.get("before") ?? undefined,
      after: search.get("after") ?? undefined,
      limit: search.get("limit") ?? undefined,
    });
    if (!query.ok) return query.response;
    return NextResponse.json(await listMessages(params.data.tribe_id, params.data.timeline_id, userId, query.data));
  });
}

// POST …/messages: send (text, photos, reply, mentions); the link preview is unfurled after the response
export async function POST(request: NextRequest, ctx: Ctx) {
  return timelineRoute("sending a message", async (userId) => {
    const params = parse(tribeTimelineParamsSchema, await ctx.params);
    if (!params.ok) return params.response;
    const body = parse(sendMessageSchema, await jsonBody(request));
    if (!body.ok) return body.response;
    const message = await sendMessage(params.data.tribe_id, params.data.timeline_id, userId, body.data);
    after(async () => {
      await publishChatEvent("created", message.timelineId, message.id, userId);
      // A preview found later is an edit as far as subscribers are concerned
      if (await refreshLinkPreview(message.id)) {
        await publishChatEvent("edited", message.timelineId, message.id, userId);
      }
    });
    return NextResponse.json({ message }, { status: 201 });
  });
}
