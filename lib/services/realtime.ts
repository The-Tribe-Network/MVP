import Ably from "ably";
import { db } from "@/lib/database/client";
import { timeline } from "@/lib/database/schemas/timeline";
import { tribeMember } from "@/lib/database/schemas/tribe";
import { and, eq } from "drizzle-orm";

/**
 * Live delivery through Ably (TRI-316; provider picked in TRI-182, ARCHITECTURE §12 / ADR-18). The only module
 * that knows the provider: callers use `publish*()` and the token route, so the notification service or tribe-api
 * can take this over without touching them.
 *
 * Events are **thin** (ids only). A channel reaches everyone subscribed, including either side of a block, so the
 * app fetches the message through the API, which applies block filtering (TRI-238) — nothing leaks live.
 * Without `ABLY_API_KEY` publishing is a no-op (local dev without the key, tests).
 */

const TOKEN_TTL_MS = 60 * 60 * 1000;

let rest: Ably.Rest | null | undefined;
function client(): Ably.Rest | null {
  if (rest === undefined) {
    const key = process.env.ABLY_API_KEY;
    rest = key ? new Ably.Rest({ key }) : null;
    if (!key) console.warn("[realtime] ABLY_API_KEY is not set; live events are not published");
  }
  return rest;
}

/** One channel per chat timeline, and one per member (for events about them; unused in the alpha). */
export const timelineChannel = (timelineId: string) => `timeline:${timelineId}`;
export const userChannel = (userId: string) => `user:${userId}`;

export type ChatEventType = "created" | "edited" | "deleted" | "reaction";

/** What a chat timeline channel carries: event name `message`, this payload. `v` versions the shape. */
export type ChatEvent = { v: 1; type: ChatEventType; timelineId: string; messageId: string; actorId: string; at: string };

/** Publish on a channel. Never throws: a failed publish is logged and the app catches up on its next fetch. */
export async function publish(channel: string, name: string, data: unknown): Promise<void> {
  const ably = client();
  if (!ably) return;
  try {
    await ably.channels.get(channel).publish(name, data);
  } catch (error) {
    console.error(`[realtime] publish to ${channel} failed:`, error instanceof Error ? error.message : error);
  }
}

/** After a chat write commits: tell the timeline's subscribers which message changed. */
export function publishChatEvent(type: ChatEventType, timelineId: string, messageId: string, actorId: string) {
  const event: ChatEvent = { v: 1, type, timelineId, messageId, actorId, at: new Date().toISOString() };
  return publish(timelineChannel(timelineId), "message", event);
}

/**
 * A signed Ably token request for the member (clientId = user id): subscribe on every chat timeline of every tribe
 * they belong to, plus their own user channel. Short-lived; the Ably client renews it through the same route,
 * which also picks up timelines created since. Null when Ably isn't configured.
 */
export async function createRealtimeTokenRequest(userId: string): Promise<Ably.TokenRequest | null> {
  const ably = client();
  if (!ably) return null;

  const chats = await db
    .select({ id: timeline.id })
    .from(timeline)
    .innerJoin(tribeMember, and(eq(tribeMember.tribeId, timeline.tribeId), eq(tribeMember.userId, userId)))
    .where(eq(timeline.type, "chat"));

  const capability: Record<string, string[]> = { [userChannel(userId)]: ["subscribe"] };
  for (const chat of chats) {
    capability[timelineChannel(chat.id)] = ["subscribe", "history"];
  }

  return ably.auth.createTokenRequest({ clientId: userId, capability: JSON.stringify(capability), ttl: TOKEN_TTL_MS });
}
