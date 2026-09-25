# TRI-179 + TRI-183 + TRI-181 · Notification record and `notify()`

Status: implemented on the branch, migrated on Neon `Development`, uncommitted (2026-09-24)
Linear: https://linear.app/tribenetwork/issue/TRI-179, https://linear.app/tribenetwork/issue/TRI-183,
https://linear.app/tribenetwork/issue/TRI-181
Branch: `anthonygayflor6/tri-179-api-notification-record-tribeid-groupingdedupe-key-per`
Sources: tribe-mobile ADR-17, `docs/ARCHITECTURE.md` §12, `docs/DATA-MODEL-DELTA.md` §3, TRI-7 (the read side).
Unblocks: the emitters (TRI-186–193, 219), TRI-7 feed routes, TRI-12 push worker (Closed Beta).

## 1. Decisions

- **One entry point.** `notify(executor, event)` in `lib/services/notifications.ts`, called inside the transaction
  of the write that caused it (a transactional outbox, not a broker). A caller whose only write is the notification
  may pass `db` (one statement). No transport, no sending.
- **Two preference levels (owner, 2026-09-24).** A category turned off *in general* gets no row: `notify()` skips
  that recipient once TRI-8 stores the setting. A category with only *push* off keeps its row, and the push worker
  suppresses the push. Tribe mutes (TRI-7) keep rows too (no push, no badge). No preferences exist in the alpha, so
  every recipient gets a row until TRI-8.
- **Per-channel delivery state is its own table**, `notification_delivery` (one row per notification × channel).
  The push worker (TRI-12) creates a row when it claims a notification for a channel, so nothing piles up while
  push is out of the alpha. In-app read state is `notification.read_at`.
- **Collapse is opt-in per emit** (`collapse: true` keys on type + entity, a string narrows it, e.g. per requester).
  A partial unique index on `(user_id, dedupe_key)` over unread rows makes collapse one `INSERT … ON CONFLICT DO
  UPDATE`: the row takes the latest actor/title/message/link, `actor_count` grows and `latest_at` moves. Once the
  row is read, the next event starts a new row. `actor_count` counts events from a different actor than the last
  one — approximate (A, B, A counts 3), good enough for "and N others".
- The actor is always dropped from recipients; recipients are de-duplicated.
- `is_read` leaves the drizzle schema now; the column is dropped after the deploy (§3) because the code before this
  change still writes it.
- **TRI-181:** `lib/services/socket-emit.ts`, its client twin `lib/hooks/use-socket.ts` (no callers either) and the
  `socket.io-client` dependency are gone. No `SOCKET_*` env var was referenced anywhere else.

## 2. Schema

`notification` (added): `actor_id` → user set null · `actor_count` int default 1 · `tribe_id` → tribe cascade, null
for account-level · `entity_type` text · `entity_id` uuid (no FK: polymorphic) · `dedupe_key` text · `read_at` ·
`latest_at` (feed order). Indexes: `idx_notification_user_tribe_latest (user_id, tribe_id, latest_at desc)` (feed,
groups), `idx_notification_user_unread (user_id) where read_at is null` (badges),
`uq_notification_unread_dedupe (user_id, dedupe_key) where read_at is null and dedupe_key is not null`.

`notification_delivery`: `notification_id` → cascade · `channel` (`push` | `email`) · `status` (`pending` | `sent` |
`failed` | `suppressed`) · `attempts` · `last_error` · `sent_at` · timestamps; unique `(notification_id, channel)`,
index `(channel, status)`.

Types (`ENTITY_TYPES` in the service; the column stays text): the mobile contract's `Notification.type` plus
`event_cohost_request`. Each type names the entity types it may point at, so an emit point can't send a malformed
payload. New types (poll results, TRI-219) are added there with their emitter.

Recipient helpers: `tribeMemberIds`, `eventHostIds` (creator + co-hosts), `eventAttendeeIds` (going + maybe by
default). `findUnreadNotification` answers "already pending" (co-host requests).

## 3. Migrations

1. `tri179-notification-record.sql` — additive, re-runnable; backfills `read_at`, `latest_at`, and `tribe_id` /
   event entity from `/tribes/<id>/events/<id>` links (only where the tribe/event still exists). **Run before the
   deploy** (drizzle's `insert … returning` lists every schema column). Applied to Development twice: 6 rows got
   their tribe; their events had been deleted in the M2 pass, so the entity stays null.
2. `tri179b-drop-is-read.sql` — drops `is_read`. **Run after the deploy is live**, on each database.

Production: not migrated yet (0 notification rows there).

## 4. Existing emit points moved onto `notify()`

- EVT-09 announce (`announceToAttendees`): same type (`event_update`) and recipients; now records actor, tribe
  and entity. It becomes `announcement` with TRI-189.
- Co-host request (`requestCoHostAccess`): the "already pending" check is the unread row with key
  `event_cohost_request:event:<eventId>:<requesterId>` instead of matching the message text.

## 5. Verification (2026-09-24, Development)

- `npx tsc --noEmit`: 9 errors, same as main, none in touched files.
- A scratch script over a real `getDbTransaction()` transaction (rolled back): actor excluded and duplicate
  recipients written once; tribe/entity/actor/dedupe key set; a second actor collapses into the unread row
  (`actor_count` 2, latest message); a read row is not collapsed into; a non-collapsing type inserts each time;
  pending co-host request found by its narrow key, another requester's key separate; a notify with only the actor
  writes nothing; **the rollback leaves no rows**. 11/11.
- Local tribe-v2 + curl: co-host request 200 then 409; announce 200 `{recipients: 1}`; both rows carry actor,
  tribe, entity (and the request its key).

## 6. Open for later steps

- Rows about a deleted entity stay (no FK on `entity_id`); TRI-7's feed must tolerate a link that 404s, or
  deletes clean up their notifications. Decide with TRI-7.
- `subject` for the NOTIF-01 bold split (TRI-7 comment) is not added; the client rule stands.
