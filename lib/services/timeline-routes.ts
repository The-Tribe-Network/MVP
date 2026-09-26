import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerUser } from "@/lib/services/auth";
import { TimelineError } from "@/lib/services/timeline";
import { ChatError } from "@/lib/services/chat";
import { validateApiRequest } from "@/lib/validations/post";

/**
 * The shared shell of the timeline and chat routes: 401 without a session, 400 on bad params or body, and a
 * TimelineError or ChatError as `{ error, code }` with its status.
 */
export async function timelineRoute(
  label: string,
  handler: (userId: string) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return await handler(user.id);
  } catch (error) {
    if (error instanceof TimelineError || error instanceof ChatError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error(`Error ${label}:`, error);
    return NextResponse.json({ error: `Failed ${label}` }, { status: 500 });
  }
}

/** Validate params or a body: the data, or the 400 response to return. */
export function parse<T>(schema: z.ZodSchema<T>, data: unknown): { ok: true; data: T } | { ok: false; response: NextResponse } {
  const result = validateApiRequest(schema, data);
  if (!result.success) {
    return { ok: false, response: NextResponse.json({ error: "Validation failed", details: result.error }, { status: 400 }) };
  }
  return { ok: true, data: result.data };
}

/** The JSON body, or undefined when it isn't JSON (the schema then rejects it). */
export async function jsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
