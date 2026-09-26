import { NextRequest, NextResponse } from "next/server";
import { createTimeline, listTimelines } from "@/lib/services/timeline";
import { jsonBody, parse, timelineRoute } from "@/lib/services/timeline-routes";
import { createTimelineSchema } from "@/lib/validations/timeline";
import { tribeIdParamSchema } from "@/lib/validations/post";

// GET /api/tribes/:tribe_id/timelines: the switcher list, unread counts and the member's selection (TRI-314)
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/tribes/[tribe_id]/timelines">) {
  return timelineRoute("fetching timelines", async (userId) => {
    const params = parse(tribeIdParamSchema, await ctx.params);
    if (!params.ok) return params.response;
    return NextResponse.json(await listTimelines(params.data.tribe_id, userId));
  });
}

// POST /api/tribes/:tribe_id/timelines: create a posts or chat timeline (canCreateTimelines)
export async function POST(request: NextRequest, ctx: RouteContext<"/api/tribes/[tribe_id]/timelines">) {
  return timelineRoute("creating a timeline", async (userId) => {
    const params = parse(tribeIdParamSchema, await ctx.params);
    if (!params.ok) return params.response;
    const body = parse(createTimelineSchema, await jsonBody(request));
    if (!body.ok) return body.response;
    const timeline = await createTimeline(params.data.tribe_id, userId, body.data);
    return NextResponse.json({ timeline }, { status: 201 });
  });
}
