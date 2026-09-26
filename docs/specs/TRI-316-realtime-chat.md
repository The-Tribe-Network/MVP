# TRI-316 · Live chat through Ably (+ channel tokens)

Provider: **Ably** (owner, TRI-182, 2026-09-25). tribe-mobile ARCHITECTURE §12 / ADR-18. The app side is TRI-180.
TRI-181 (the dead socket stub) was already deleted with TRI-179 (MVP #54).

## Server (`lib/services/realtime.ts`, the only module that knows the provider)

- `publish(channel, name, data)`: Ably REST; never throws (logged; the app catches up on its next fetch). A no-op
  without `ABLY_API_KEY`. The notification service or tribe-api can take it over without touching callers.
- Channels: `timeline:{timelineId}` per chat timeline; `user:{userId}` per member (in the token, unused in the alpha).
- `publishChatEvent(type, timelineId, messageId, actorId)` after each chat write commits (in `after()`):
  `created` (send), `edited` (edit, and again when a link preview lands), `deleted`, `reaction` (add or remove).
- **Thin events**: name `message`, data `{ v: 1, type, timelineId, messageId, actorId, at }`, no content. A channel
  reaches everyone attached, including either side of a block, so the app refetches through the API, which applies
  TRI-238's filtering. Verified: a blocked pair gets the event, and `GET …/messages/:mid` answers 404.

## Routes

- `GET /api/realtime/token` → an Ably `TokenRequest` (clientId = user id, TTL 1 h). Capability: `subscribe` +
  `history` on every chat timeline of the member's tribes, `subscribe` on `user:{id}`. The Ably client calls it
  from `authCallback` with the bearer token; renewal picks up timelines created since. 401 without a session;
  503 `REALTIME_UNAVAILABLE` when the server has no key.
- `GET …/messages?after={id}` → the messages newer than that one, **oldest first**, paged with `limit` / `hasMore`
  (catching up after an event or a return to the foreground). `before` and `after` together → 400.
- `GET …/messages/{id}` → `{ message }` for one message (404 when hidden or missing).

Presence and typing: not in the alpha (owner, 2026-09-25).

## Cost check (feeds TRI-118)

Alpha assumption: ~50 testers, ~10 tribes, ~500 chat messages a day plus ~30 % edits/reactions → ~650 publishes a day.
Each counts once inbound plus once per attached subscriber (say 5 on average) → ~3,900 Ably messages a day, **~120 k a
month**, against the free tier's ~6 M (and 200 concurrent connections, which ~50 testers stay under). Verify the
current limits on ably.com/pricing before the closed beta.

## Verified (local, Development, 2026-09-26): 18/18

With the Ably JS SDK (`authCallback` → our route): token route 200 and 401 without a session; a member attaches to a
chat channel, a non-member (home11) is refused by Ably (40160); `created`, `reaction`, `edited`, link-preview `edited`
and `deleted` events arrive; `GET` one after an event; `after` cursor; `before`+`after` 400; a blocked pair still
gets the thin event but `GET` one is 404; events carry only ids. TRI-314 (37/37) and TRI-315 (41/41) matrices re-run
green. No migration. `tsc` baseline unchanged (9). Dependency: `ably` 2.29.0.
