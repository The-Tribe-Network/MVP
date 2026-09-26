import { NextRequest, NextResponse } from "next/server";
import { selectTimeline } from "@/lib/services/timeline";
import { jsonBody, parse, timelineRoute } from "@/lib/services/timeline-routes";
import { selectTimelineSchema } from "@/lib/validations/timeline";
import { tribeIdParamSchema } from "@/lib/validations/post";

// PUT /api/tribes/:tribe_id/timelines/selected: remember the member's timeline; null = Global (TRI-314)
export async function PUT(request: NextRequest, ctx: RouteContext<"/api/tribes/[tribe_id]/timelines/selected">) {
  return timelineRoute("selecting a timeline", async (userId) => {
    const params = parse(tribeIdParamSchema, await ctx.params);
    if (!params.ok) return params.response;
    const body = parse(selectTimelineSchema, await jsonBody(request));
    if (!body.ok) return body.response;
    const selectedTimelineId = await selectTimeline(params.data.tribe_id, userId, body.data.timelineId);
    return NextResponse.json({ selectedTimelineId });
  });
}
