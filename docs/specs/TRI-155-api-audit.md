# TRI-155 · Is the API shaped right for the finished app?

Audit of 2026-09-28. The app is built frame by frame from the finished mockups, so it stands in for them: every
screen's real requests were captured from a running app against a local tribe-v2 (Neon Development), payloads were
measured with `curl` as a seed user, and paging / write / error behaviour was read from the app's query layer. The
route-by-route inventory this builds on is `docs/API-SURFACE.md` (TRI-148).

**Summary.** The API is in reasonable shape for the alpha; nothing blocks testers. Three changes are worth making in
tribe-v2 before the standalone port (A1–A3), three are cheap tidy-ups (B1–B3), and the rest are deliberately deferred
to tribe-api or to real traffic data (C). **Owner, 2026-09-28: all of A and B accepted**; the Linear issues are listed
at the end.

## Method

- **Round trips**: the app's query cache (MMKV `tribe.cache`) was cleared on the iPhone 18 Pro simulator, then a cold
  start and a first visit to each screen by deep link, reading the API log between steps. Signed in as a tribe owner
  (home15) in College Friends.
- **Payloads**: `curl` with the same user's bearer, bytes and item counts.
- **Caveat**: Development data is small (60 users, 66 posts, 216 photos) and `next dev` compiles routes on first hit,
  so timings are not meaningful; sizes and call counts are.

## 1. Round trips

| Screen (first visit, empty cache) | Requests | Which |
| --- | --- | --- |
| Cold start → TRIBE-01 (tribe home) | **10** | `GET /user/profile`, `/tribes`, `/tribes/:id`, `/tribes/:id/members/me`, `/tribes/:id/settings`, `/tribes/:id/timelines`, `/tribes/:id/events?status=upcoming`, `/tribes/:id/media?limit=4`, `/me/notifications/groups`, `/realtime/token` |
| HOME-01 (from earlier sessions' logs) | ~6 | `/me/agenda`, `/me/catch-up`, `/invitations`, `/tribes`, `/me/notifications/groups`, `/user/profile` |
| Chat timeline | 3 | messages, `members/list` (mentions), `PUT timelines/selected` |
| POST-01 post | 2 | post, comments |
| EVT-02 event | 3 | event, comments, polls |
| MEDIA-02 album | 1 | album |
| NOTIF-01 | 1 (+1 bug) | notification groups, plus `GET /tribes/undefined/timelines` → 400 (§6) |
| PROF-02 profile | 2 | profile, posts |

Requests on a screen go out in parallel, so the latency cost is the slowest one, not the sum. The real cost of many
calls is elsewhere: each is a separate serverless invocation with its own session lookup and database connection.
The tribe home's six tribe-scoped calls are the one place worth folding (A1).

## 2. Payloads

| Endpoint | Items | Bytes | Per item |
| --- | --- | --- | --- |
| `GET /tribes/:id/posts` (feed page) | 20 | 21.6 KB | ~1.2 KB |
| `GET /tribes/:id/media?limit=60` | 60 (of 169) | 49.4 KB | ~870 B |
| `GET /users/:id/posts?limit=20` | 20 | 13.4 KB | ~670 B |
| `GET /tribes/:id/events?status=upcoming` | — | 4.0 KB | |
| chat messages `?limit=30` | 30 | 5.0 KB | ~165 B |
| `GET /tribes/:id/members/list` | 50 page | 3.6 KB | |
| `GET /tribes` | — | 1.2 KB | |
| `GET /tribes/:id/settings` | — | 63 B | |

Everything is small. Budget, to check once real tribes exist: **p95 ≤ 100 KB per list page**, measured from Vercel /
PostHog once the alpha runs. Over-fetching seen, all minor: posts carry both the legacy `image` and `media`; photo
items carry `fileSize`, `mimeType`, `duration`, `addedAt` and `postId`, which the grid doesn't render.

## 3. Paging

| List | Paging | Holds up when items are added? |
| --- | --- | --- |
| Chat messages | cursor (message id) | yes |
| Notifications, agenda | `nextCursor` | yes |
| Catch up | base64 offset (`nextCursor`) | partly: reading an item shifts it (known; the app refetches from page 1) |
| **Tribe feed** (`/tribes/:id/posts`) | offset = items loaded; bare array, no `hasMore` | **no**: a new post shifts every page, so the next page repeats or skips one; the app always spends one extra empty request at the end |
| **Photos** (`/tribes/:id/media`) | offset + `hasMore` | **no**, same shift when photos are added |
| Members, profile posts / media / events, blocks | page number / offset | acceptable: they change rarely |
| Comments (post, event) | not paged | fine at alpha sizes; a very long thread loads whole |

## 4. Writes and retries

- The app never retries a mutation by itself (`mutations: { retry: 0 }`); queries retry twice on network / 5xx only.
- **Post and comment likes are toggles**: one `POST` flips the like. A person who taps again after a request that
  timed out but succeeded flips it back. Photo likes are already idempotent (`POST` like / `DELETE` unlike, TRI-208),
  so the API is inconsistent.
- **Creates** (post, comment, chat message; an RSVP is an upsert and fine) have no idempotency key: a re-send after a
  timeout can duplicate. Chat is the likeliest place (people resend on a bad connection).

## 5. Errors, empty states, offline

- Every state the designs show has a server answer that produces it (404 → "gone" states, 403 → no-permission states,
  410 for expired invites / codes, 409 for a full event). Error bodies are inconsistent (`{ error }` vs
  `{ code, message }`); the app copes, and the port should settle one shape (inventory, rough edges).
- The app persists the query cache for 24 h and refetches on reconnect; the server supports no conditional requests
  (`ETag` / `If-None-Match`). Not worth it before real traffic.

## 6. Bug found

`GET /api/tribes/undefined/timelines` (400) when NOTIF-01 opens over a tribe: `timelinesOptions(tribeId)` in
tribe-mobile has no `enabled` guard, and the tribe tab layout calls it with an undefined id while the app-level
notifications route is on screen. A wasted request; fixed in tribe-mobile (B3).

## Changes (accepted 2026-09-28)

### A. In tribe-v2 before the port

| # | Change | Why | Size |
| --- | --- | --- | --- |
| A1 | **Fold the tribe home into one call**: `GET /tribes/:id` also returns `settings` (3 booleans) and `me` (membership + effective permissions). Events, photos and timelines stay separate (each has its own cache and refresh) | TRIBE-01 goes 6 → 4 tribe calls on a cold open, and every tribe screen that needs permissions stops waiting on `/members/me` | S–M (+ contract, + the app reads them from the tribe query) |
| A2 | **Cursor paging for the feed and photos**: `(createdAt, id)` cursor, `{ items, nextCursor }`, like notifications | the only lists where new items arrive while people scroll | M (server + app, contract change) |
| A3 | **Idempotent likes**: `PUT` like / `DELETE` unlike for posts and comments (keep the toggle for the web until it's cut over) | a retry or double tap can't undo a like; matches photos | S |

### B. Tidy-ups

| # | Change | Size |
| --- | --- | --- |
| B1 | Drop `image` from post payloads (legacy; `media` replaced it) once nothing reads it | XS |
| B2 | Trim photo list items to what the grid renders (id, urls, blurhash, dimensions, uploader, counts) | S |
| B3 | Guard `timelinesOptions` in tribe-mobile and fix the caller (the §6 bug) | XS |

### C. Deferred, decided

| Topic | Decision |
| --- | --- |
| A composite `GET /me/home` for HOME-01 | Not now: its calls are parallel and separately cached; revisit with real p95s |
| Idempotency keys on creates (`Idempotency-Key` header) | tribe-api; chat first. Low risk in the alpha (no auto-retry) |
| Conditional requests (`ETag`) | tribe-api, if traffic shows repeat downloads of unchanged lists |
| Paging comments | when a real thread gets long enough to matter |
| One error shape | at the `/api/v1` boundary in tribe-api |
| Payload budget | p95 ≤ 100 KB per page, checked once the alpha has traffic |

## Linear

| Change | Issue |
| --- | --- |
| A1 tribe detail carries `settings` + `me` | TRI-359 |
| A2 cursor paging for the feed and photos | TRI-360 |
| A3 idempotent post / comment likes | TRI-361 |
| B1 + B2 tidy post and photo payloads | TRI-362 |
| B3 the `/tribes/undefined/timelines` bug (tribe-mobile) | TRI-358 |
