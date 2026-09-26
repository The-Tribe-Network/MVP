import { NextRequest, NextResponse } from "next/server";
import { deleteTimeline, updateTimeline } from "@/lib/services/timeline";
import { jsonBody, parse, timelineRoute } from "@/lib/services/timeline-routes";
import { tribeTimelineParamsSchema, updateTimelineSchema } from "@/lib/validations/timeline";

type Ctx = RouteContext<"/api/tribes/[tribe_id]/timelines/[timeline_id]">;

// PATCH /api/tribes/:tribe_id/timelines/:timeline_id: rename, emoji, who can post (TRI-314)
export async function PATCH(request: NextRequest, ctx: Ctx) {
  return timelineRoute("updating a timeline", async (userId) => {
    const params = parse(tribeTimelineParamsSchema, await ctx.params);
    if (!params.ok) return params.response;
    const body = parse(updateTimelineSchema, await jsonBody(request));
    if (!body.ok) return body.response;
    const timeline = await updateTimeline(params.data.tribe_id, params.data.timeline_id, userId, body.data);
    return NextResponse.json({ timeline });
  });
}

// DELETE /api/tribes/:tribe_id/timelines/:timeline_id: deletes the timeline and all its posts; never Global
export async function DELETE(_request: NextRequest, ctx: Ctx) {
  return timelineRoute("deleting a timeline", async (userId) => {
    const params = parse(tribeTimelineParamsSchema, await ctx.params);
    if (!params.ok) return params.response;
    await deleteTimeline(params.data.tribe_id, params.data.timeline_id, userId);
    return NextResponse.json({ success: true });
  });
}
