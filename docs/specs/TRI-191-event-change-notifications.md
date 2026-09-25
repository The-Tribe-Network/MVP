# TRI-191 · Emit: event cancelled, rescheduled or changed, to attendees

Status: in review as MVP #55 (2026-09-24); verified on Neon `Development`
Linear: https://linear.app/tribenetwork/issue/TRI-191
Branch: `anthonygayflor6/tri-191-emit-event-cancelled-rescheduled-or-changed-to-attendees`
Builds on: `notify()` (TRI-183, `docs/specs/TRI-179-notification-record.md`). No migration.

## Behaviour

`updateEvent` and `deleteEvent` (`lib/services/event.ts`) now run in a `getDbTransaction()` transaction: the event row
is read `FOR UPDATE`, written, and the notification goes in with it.

| change | message (title = event title) | collapse key | link |
|---|---|---|---|
| status → `cancelled` | "was cancelled" | `…:cancelled` | the event |
| `startDate` / `endDate` changed | "has a new time" | `…:rescheduled` | the event |
| `location` changed | "has a new location" | `…:changed` | the event |
| event deleted | "was cancelled" | `…:cancelled` | the tribe (`/tribes/<id>`) |
| title / description / cover only | nothing | | |

- One notice per edit: cancel wins over a new time, a new time over a new place (`eventChangeNotice`).
- Recipients: going + maybe attendees, the creator and co-hosts; the host making the change is dropped by `notify()`.
  Not-going RSVPs hear nothing.
- Nothing is sent for an event that is already cancelled or already over (delete of a past event, edits after a
  cancel).
- Repeat edits of one kind collapse into the unread row; the three kinds never merge with each other.
- Type is `event_update` for all of them (the contract's enum); the message carries the kind. No time in the text:
  the server doesn't know the reader's time zone, and the row opens the event, which shows the new time.
- Preferences (owner, 2026-09-24): cancel follows the `events` settings like the rest. There are none in the alpha.

Deviation from the issue: a deleted event links to the tribe, not its Events tab, because the app's link resolver
has no Events-tab path. Link format (`/tribes/…` here vs `tribe://tribe/…` in the app) is settled by TRI-7/TRI-223.

## Verification (2026-09-24, Development, local tribe-v2 + curl as `home17`, the creator)

Throwaway events "TRI-191 Edit Check" / "TRI-191 Delete Check" (home16 going, home15 maybe, home1 not going,
home17 going) and a past "TRI-191 Past Check":

1. PUT with the values from GET (unchanged round trip) → no row.
2. Title only → no row.
3. Two location edits → one "has a new location" row each for home15 and home16.
4. New start → a separate "has a new time" row.
5. Cancel → a separate "was cancelled" row.
6. Edit after cancel (title, location) → no row.
7. DELETE the second event → "was cancelled" rows linking to the tribe.
8. DELETE the past event → no row.

home1 (not going) and home17 (actor) got nothing in any step. `npx tsc --noEmit`: 9 errors, same as main.
