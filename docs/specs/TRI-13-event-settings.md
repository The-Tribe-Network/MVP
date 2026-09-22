# TRI-13 · API 9 · Event settings, co-hosts, links, announce

Status: implemented on the branch, verified against Neon `Development`, uncommitted · 2026-09-22
Linear: https://linear.app/tribenetwork/issue/TRI-13
Branch: `anthonygayflor6/tri-13-api-9-event-settings-co-hosts-links-announce-reminder-job`
Sources: tribe-mobile `docs/DATA-MODEL-DELTA.md` §6, `docs/api/openapi.yaml` (`EventSettings`,
`EventSettingsBundle`, `EventCoHost`, `EventLink`, `getEventSettings`, `updateEventSettings`, `addCoHost`,
`removeCoHost`, `requestCoHostAccess`, `addEventLink`, `deleteEventLink`, `announceToAttendees`),
`contract/known-gaps.json` (TRI-13 entries).
Blocks: TRI-51 (EVT-07–11), TRI-190 (reminder job reads `event_settings`). Related: TRI-189 (announce delivery).

No schema change: `event_settings`, `event_co_host`, `event_link` already existed. The reminder job left this
issue for TRI-190 (owner's scope note on the ticket).

---

## 1. What landed

| Route | Who | Notes |
|---|---|---|
| `GET /tribes/{tid}/events/{eid}/settings` | any member | `EventSettingsBundle`; the `event_settings` row is created on first read from the tribe's defaults (`getOrCreateEventSettings`). `settings.linkedAlbum` is the `AlbumPreview` (id, name, coverUrl, photoCount). |
| `PATCH …/settings` | editors | partial `EventSettings`, `.strict()`; `reminderSchedule` must match `^(\d+[wdhm])(,\d+[wdhm])*$`; unknown keys 400. Returns the bundle. |
| `GET /co-hosts` · `POST /co-hosts {userId}` · `DELETE /co-hosts/{userId}` | any member · editors · editors, or the co-host themselves | POST: 201 `EventCoHost` (with `user` incl. username); 409 `ALREADY_CO_HOST` / `IS_CREATOR`; 400 when the user is not a tribe member. DELETE: 404 when not a co-host. |
| `POST /co-hosts/request` | non-editors | one `notification` row to the creator (`event_cohost_request`); 409 while an earlier one is unread, 409 for callers who can already edit. |
| `GET /links` · `POST /links` · `DELETE /links/{linkId}` | any member · editors · editors | `orderIndex` = current count; 400 on a bad url. |
| `POST /announce {message}` | editors | `{ recipients }`: one `notification` row (`event_update`, link `/tribes/{tid}/events/{eid}`) per going/maybe attendee, sender excluded. Push/e-mail delivery is TRI-189's `notify()`. |

Also, per DATA-MODEL-DELTA §6 "one function":

- **`canEditEvent()`** (`lib/services/event-settings.ts`): creator → yes; co-host → yes; else
  `event_settings.editPermission`: `creator_only` → no, `creator_and_admins` → `canEditEvents` override or
  owner/admin role, `all_members` → yes. `PUT /events/{eid}` now uses it (the inline role check is gone, so
  co-hosts can edit). `DELETE /events/{eid}` keeps its creator / `canDeleteEvents` / owner-admin rule.
- **`GET /events/{eid}`** now returns `isUserCoHost` and `canUserEdit` (closes the `Event.canUserEdit` gap).
- **`Poll.resultsVisibility`** comes from the event's `event_settings.pollResultsVisibility`
  (default `after_voting`; post polls answer the default) — closes the mobile EVT-03 gap.
- `guardEventRoute()` (`lib/services/event-routes.ts`) is the shared 401/403/404 + edit gate for the new routes.

Fixed on the way: `createPoll` and `votePoll` used `db.transaction` on the neon-http client, which throws
"No transactions support" (poll create was a 500 on every call). Both use `getDbTransaction()` now.
`lib/services/invitation.ts:289` has the same call and is untouched (not events).

## 2. Decisions

- Notifications are plain `notification` rows written directly; `lib/services/socket-emit.ts` is not used
  (it opens a socket at import time and nothing else imports it). TRI-189 replaces the writes with `notify()`.
- "Pending" for a co-host request = an unread `event_cohost_request` row for that event and requester; there
  is no request table. Reading the notification clears it.
- The lazily created settings row copies the tribe's event defaults (`showAttendeeList`, waitlist, polls,
  reminders, RSVP notifications); fields the tribe has no default for take the column defaults.
- Co-hosts must already be members of the tribe (400 otherwise). Removing a co-host does not touch their RSVP.
- Announce excludes the sender and not-going / no-reply members (PRD: "to all attendees").

## 3. Verification (2026-09-22)

- **Typecheck**: `npx next typegen && npx tsc --noEmit` — 9 errors before, 9 after, none in touched files.
- **Request matrix: 48 of 48** against `next dev` + Development as the College Friends owner (`home15`) and
  members (`home16`, `home17`) on a scratch event deleted afterwards
  (`tri13-verify.sh`, kept in the session scratchpad): detail `canUserEdit`/`isUserCoHost` for owner and
  member; lazy settings row with `1d,1h`; PATCH 403/200/400 (bad schedule, unknown key); `editPermission`
  `all_members` → member may edit, `creator_only` → may not; detail `guestAllowance` reads the same row;
  co-host add 403/201/409/400, co-host may PUT the event, self-remove 200, re-remove 404; request 200/409/409;
  links 403/201/400, in the bundle, delete 200/404; announce 403/200 with 2 recipients/400; poll
  `resultsVisibility` follows the setting; unknown event 404.
- Left on Development: the `notification` rows the matrix wrote for `home15`–`home17` (two announce runs,
  the co-host requests). Harmless; delete by `type in ('event_update','event_cohost_request')` if wanted.
- Not done: `next build`; a run from the mobile app (TRI-51 is built in another session).

## 4. On merge

In tribe-mobile `openapi.yaml`, drop `x-status: proposed` from `getEventSettings`, `updateEventSettings`,
`addCoHost`, `removeCoHost`, `requestCoHostAccess`, `addEventLink`, `deleteEventLink`, `announceToAttendees`,
`Event.canUserEdit`, `Event.isUserCoHost` and `Poll.resultsVisibility`; regenerate; remove the TRI-13
entries from `contract/known-gaps.json` except `duplicateEvent`, which is still not served (move its issue
reference to a new API ticket). No SQL to run on Production.
