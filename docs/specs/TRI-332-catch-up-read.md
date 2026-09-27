# TRI-332 · Catch up: opening an item marks it read

Owner, 2026-09-26 (device session): opening an item in HOME-03 Catch up should mark it read, server-side, so it
syncs across devices and the per-tribe unread counts go down as items are opened.

## Shape

- `catch_up_read (user_id, tribe_id, item_id, read_at)`, unique `(user_id, item_id)`. `item_id` is the CatchUpItem id
  as `GET /me/catch-up` returns it: `post:<uuid>`, `poll:<uuid>`, `event_rsvps:<eventId>`, `member_joined:<uuid>`.
- `POST /api/me/catch-up/read { itemId, tribeId }`: 200 `{ success }`, upserting `read_at = now()`. 400 for a bad id,
  403 when the caller isn't in the tribe, 401 signed out.
- `GET /me/catch-up` hides an item when `read_at >= item.createdAt`. An `event_rsvps` item's `createdAt` is its newest
  RSVP, so a new RSVP after the read brings it back. A `poll` item's `createdAt` is when it closes (future), so any read
  hides it.
- `getUnreadPostCounts` (catch-up `tribes[].unreadCount` and `GET /tribes`) skips posts with a `post:<id>` read row.
- `POST /me/catch-up/done` deletes the caller's reads up to the new watermark (all tribes, or the one tribe).

## Migration

`lib/database/migrations/tri332-catch-up-read.sql`, additive. **Run it on every database before deploying**: the code
reads the table in `GET /tribes`. Development: run 2026-09-26. Production: after the owner's OK.

## Verified (local, Neon Development, 2026-09-26)

| Check | Result |
|---|---|
| Mark a `post:` and an `event_rsvps:` item read | 200; both gone from catch-up (33 → 31) |
| Mark the same item again | 200 (idempotent) |
| Bad `itemId` / not a member / no session | 400 / 403 / 401 |
| home16 posts → Emma's count 1 → mark read | count 0, item gone |
| A new RSVP (home17 cancels, RSVPs again) after Emma's read | the event is back |
| Updated RSVP (existing row) | stays hidden: catch-up keys RSVPs on `created_at`, unchanged behaviour |
| Done | Emma's read rows deleted |
