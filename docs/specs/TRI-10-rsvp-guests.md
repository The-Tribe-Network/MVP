# TRI-10 · API 6 · RSVP guest count and note

Status: implemented on the branch, migrated on Neon `Development`, uncommitted (2026-09-22)
Linear: https://linear.app/tribenetwork/issue/TRI-10
Branch: `anthonygayflor6/tri-10-api-6-rsvp-guest-count-and-note`
Sources: tribe-mobile `docs/DATA-MODEL-DELTA.md` §1, `docs/api/openapi.yaml` (`rsvp`, `RsvpInput`, `EventAttendee`,
`Event.guestAllowance` / `waitlistEnabled`), SCREEN-BEHAVIOR §5 (EVT-18).
Unblocks: TRI-43 (EVT-18 RSVP sheet, built alongside), TRI-44 (EVT-17 "+1 guest"), TRI-49 (EVT-06).

---

## 1. Schema

`event_attendee` (`lib/database/schemas/event.ts`):

| change | detail |
|---|---|
| `status` | free `text` → `rsvp_status` enum (`going`, `maybe`, `not_going`), default `going` |
| `guest_count` | `integer NOT NULL DEFAULT 0` — +1s this member brings, only meaningful when going |
| `note` | `text NULL` — a note for the host, ≤ 200 chars, trimmed, empty → null |

Migration `lib/database/migrations/tri10-rsvp-guests.sql`: hand-written, one transaction, re-runnable.
Audit first (`SELECT status, COUNT(*) FROM event_attendee GROUP BY status`): Development held 36 rows, all
`going`. Any other value is backfilled to `going` before the in-place cast, which a re-run skips once the
column is already the enum. Applied to Development twice with identical results.

## 2. Service (`lib/services/event.ts`)

- `rsvpRulesFor(eventId)` reads `event_settings` (`guest_allowance`, `capacity_limit`, `enable_waitlist`,
  `rsvp_deadline`) with defaults `0 / null / true / null` — most events have **no settings row** (the web app
  creates it lazily; Development has none).
- `rsvpCountsFor(eventIds)`: one grouped query → `going` = people **plus their guests** (the contract's
  `attendeeCount`), `maybe` = people. Used by `getEventById` and `getTribeEvents`, which previously counted
  every row regardless of status.
- `getEventById` / `getTribeEvents` now return `myRsvp`, `attendeeCount`, `maybeCount` (+ on the detail
  `guestAllowance`, `waitlistEnabled`, `capacityLimit`, `rsvpDeadline`). `isUserAttending` stays for the web
  and now means `status === 'going'`.
- `addEventAttendee(eventId, userId, input)` takes `{ status, guestCount?, note? }` (or the bare status the
  web sends): guests are **clamped** to the allowance (never refused), zeroed unless going; when going and
  `capacityLimit` is set, seats taken by *everyone else* going (people + guests) + this RSVP's seats must fit,
  else `EventFullError` — so changing your own guests never blocks you. `waitlisted` is always `false` for
  now: waitlist semantics land with event settings (TRI-13).
- `getEventAttendees` includes `guestCount` and `note`.

## 3. Route

`POST /api/tribes/{tribe_id}/events/{event_id}/attendees` validates with `rsvpSchema` (`lib/validations/event.ts`):
`status` enum, `guestCount` 0–10 (default 0), `note` ≤ 200 trimmed. An empty body or one without `status`
still means `going` (the web's legacy call). `EventFullError` → **409** `{ error, code: 'EVENT_FULL', waitlisted }`.
`GET` and `DELETE` are unchanged.

## 4. Verification (2026-09-22)

- **Typecheck**: `npx next typegen && npx tsc --noEmit` — 11 errors before, 9 after (two pre-existing
  ones in touched files went away); none in files this change touches.
- **Migration**: run twice on Development; `status` is `rsvp_status` with default `'going'::rsvp_status`,
  `guest_count int4 default 0`, `note text`; 36 rows still `going`.
- **Request matrix: 26 of 26** against `next dev` + Development as the College Friends owner (`home15`),
  members (`home16`, `home17`, `home18`), on a scratch event deleted afterwards. Covered: defaults with no
  settings row; web-style `{ status }` and empty bodies; maybe does not take a seat; guests clamped to 0
  then to 2 after an `event_settings` row (allowance 2, capacity 4); attendee rows carry `guestCount` and the
  trimmed note; 409 `EVENT_FULL` at capacity for a newcomer while the seated member may change guests and
  the owner may re-post; validation 400s (status, negative guests, 201-char note); list rows agree with the
  detail; cancel drops `myRsvp` and the seats.

Noticed, not changed: `createEvent` RSVPs the creator as going, so a fresh event starts at `attendeeCount` 1.
Not done: `next build`; a run from the mobile app (TRI-97 / TRI-43 simulator check uses the mock).

## 5. On merge

In tribe-mobile `openapi.yaml`, drop `x-status: proposed` from `RsvpInput.guestCount` / `note`,
`EventAttendee.guestCount` / `note`, `Event.myRsvp` / `maybeCount` / `guestAllowance` / `waitlistEnabled` /
`capacityLimit` / `rsvpDeadline`, regenerate, and remove the TRI-10 entries from `contract/known-gaps.json`.
Run `tri10-rsvp-guests.sql` on Production (`ep-sweet-smoke-ah2qfclb`) at release.
