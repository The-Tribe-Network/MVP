# TRI-7 · API 3 · Notifications feed: grouped by tribe, tribe filter, mark read, per-tribe mute

Status: implemented, migrated on Neon `Development` and `Production` (2026-09-24)
Linear: https://linear.app/tribenetwork/issue/TRI-7
Branch: `anthonygayflor6/tri-7-api-3-notifications-feed-grouped-by-tribe-tribe-filter-mark`
Sources: tribe-mobile `docs/api/openapi.yaml` (`listNotificationGroups`, `listNotifications`, `markAllNotificationsRead`,
`markNotificationRead`, `TribeMemberPreference.notificationsMuted`), NOTIF-01/03/04. Rows come from `notify()`
(TRI-179/183) and the emitters (MVP #55). Service `lib/services/notification-feed.ts`.

## Routes

| route | behaviour |
|---|---|
| `GET /api/me/notifications/groups?filter&perGroup` | One group per tribe the caller belongs to, newest activity first: `tribe`, newest `perGroup` items (default 3, max 10), `unreadCount`, `totalCount`, `latestAt`, `muted`. `personal`: rows with no tribe or from a tribe not joined (invites). Groups with nothing matching `filter` are omitted. Top-level `unreadCount` = the drawer badge. |
| `GET /api/me/notifications?filter&tribeId&cursor&limit` | Flat, newest first (`latest_at`, then id), keyset-paged; `limit` default 30, max 100; `nextCursor` null on the last page; a bad cursor is 400. With `tribeId`, `unreadCount` is that tribe's; without, the badge. |
| `POST /api/me/notifications/:id/read` | Idempotent; someone else's or a malformed id is 404. |
| `POST /api/me/notifications/read-all` `{ tribeId? }` | Everything, or one tribe's. Empty body allowed. |
| `GET/PATCH /api/tribes/:id/members/preferences` | Now also `notificationsMuted`. PATCH is partial (either field, booleans, 400 on nothing/bad) and creates the member's preference row when there is none. |

- **Filters:** `mentions` = `mention`, `reply`; `events` = `event_reminder`, `event_update`, `rsvp`, `new_event`,
  `poll_closed`, `event_cohost_request`; `invites` = `invite`; `all` = everything. Group `unreadCount`/`totalCount`
  follow the filter; the badge doesn't.
- **Badge** (`unreadCount` at the top of groups, and of the flat list without `tribeId`): unread rows outside muted
  tribes, whatever the filter.
- **Mute** (NOTIF-04): the tribe's rows still appear (group `muted: true`), but it's left out of the badge and its
  `TribeSummary.unreadCount` (drawer/tribe list) is 0. No push either, when push exists (TRI-12).
- **Item shape:** the contract's `Notification` (`id, type, title, message, link, isRead, actor, tribe, createdAt`)
  plus `actorCount`, `latestAt`, `entityType`, `entityId`. `latestAt` is the last time a collapsed row changed and is
  what the feed orders by; the app should show it. Mobile adds these fields and the types `event_cohost_request`,
  `new_post`, `new_event`, `poll_closed` to the contract in TRI-223.

## Schema

`tribe_member_preference.notifications_muted boolean not null default false`, and a unique key on
`tribe_member_id` (one preference row per membership, so PATCH upserts; only 5 of 37 memberships on Development had a
row). Migration `tri7-notifications-muted.sql` (re-runnable, dedupes first): run on Development (twice) and
Production (2026-09-24; Production had no preference rows yet).

## Verification (2026-09-24, local tribe-v2 + curl, home16 with 18 rows from the emitter checks)

1. Groups: College Friends, 3 items, unread 16, total 18; personal empty; badge 16.
2. `filter=events` → 12 total; `mentions` / `invites` → nothing for home16; `filter=nope` → 400.
3. Flat, `limit=4`: 5 pages, 18 items, no duplicates, order kept; a bad cursor → 400.
4. Mute → group `muted: true`, badge 0, TribeSummary `unreadCount` 16 → 0; GET prefs shows it; unmute restores.
5. Mark one read → tribe unread 16 → 15; again → 200; home17 on home16's row → 404; `nope` → 404.
6. Read-all for the tribe → 0; read-all with no body → 200.
7. home1 invites home16 to Alpha Pass Tribe → it lands in `personal` with `tribe://invite/…`; badge 1.
8. home1 `filter=mentions` → their "replied to your comment" row.
9. Preferences PATCH with `"yes"` or `{}` → 400.

`npx tsc --noEmit`: 9 errors, same as main.

## Not included

- Rows about a deleted post/event keep their link (a deleted event's own cancellation links to the tribe, TRI-191).
  The app should treat a 404 on open as "no longer available".
