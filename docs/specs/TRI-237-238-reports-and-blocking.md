# TRI-237 / TRI-238 · API · Reports and user blocking

Status: in review; migrated on Neon **Development and Production** · 2026-09-25 (Production owner-approved)
Linear: https://linear.app/tribenetwork/issue/TRI-237 · https://linear.app/tribenetwork/issue/TRI-238
Branch: `anthonygayflor6/tri-237-238-reports-and-blocking` (targets `main`; TRI-16 landed as MVP #60, TRI-15 as MVP #58)
Decision: owner, TRI-105 (2026-09-23) — a report floor and blocking filtered everywhere, both built for the alpha.
Sources: tribe-mobile `docs/DATA-MODEL-DELTA.md` §9 (reserved `content_report` status values), `docs/PRD.md` R9.5
(profile overflow: report), `docs/SCREEN-BEHAVIOR.md` PROF-02 (⋯ → Report), USET-06 (blocked list).
Powers: TRI-79 (report sheet) and TRI-74 (block / blocked list) on mobile.

The mobile contract has no report or block operations yet; this spec proposes them (§8). The mobile design
has no drawn report reasons, so the reason set below is ours.

---

## 1. Scope

In:
- `report` table, `POST /reports`; email to the tribe owner and the platform owner on each new report.
- `user_block` table, `POST` / `DELETE /me/blocks/{userId}`, `GET /me/blocks`.
- Block filtering, both directions, on every read that returns user content (§5), through one helper.
- Account deletion (TRI-16) removes the user's blocks; their reports stay.

Out:
- Report queue, dashboard, resolution, auto-hiding (TRI-19). `status` stays `open`.
- Hiding content from third parties. A block is between two people only.
- Direct messages (none exist).

## 2. Schema and migration

`lib/database/schemas/safety.ts` (exported from `schemas/index.ts`), enums in `schemas/enums.ts`:

```ts
report_target_type: 'post' | 'comment' | 'media' | 'user'
report_reason:      'spam' | 'harassment' | 'hate' | 'sexual_content' | 'violence' | 'self_harm' | 'other'
report_status:      'open' | 'dismissed' | 'removed'      // DATA-MODEL-DELTA §9; only 'open' is written today

report(id, reporter_id → user cascade, tribe_id → tribe cascade, target_type, target_id uuid (no FK),
       reason, note text null, status default 'open', resolved_by → user set null, resolved_at, created_at)
  unique (reporter_id, target_type, target_id) WHERE status = 'open'   -- report_open_reporter_target_unique
  index (reporter_id, created_at)                                       -- rate limit
  index (tribe_id, created_at)                                          -- TRI-19 queue

user_block(id, blocker_id → user cascade, blocked_id → user cascade, created_at,
           CHECK blocker_id <> blocked_id)
  unique (blocker_id, blocked_id)          -- also the forward anti-join probe and "whom did I block"
  index (blocked_id, blocker_id)           -- the reverse probe ("who blocked me")
```

`target_id` is polymorphic, so it has no FK: a report outlives the content it names, as evidence.

`lib/database/migrations/tri237-238-reports-blocks.sql`: hand-written, re-runnable (guarded `CREATE TYPE`,
`CREATE TABLE IF NOT EXISTS`, guarded constraints, `CREATE INDEX IF NOT EXISTS`), one transaction, purely additive,
no backfill.

```
node lib/database/migrations/run-sql.mjs lib/database/migrations/tri237-238-reports-blocks.sql --endpoint ep-divine-term-ahpw8jvi
```

Applied to **Development** (`ep-divine-term-ahpw8jvi`) twice (second run a no-op) and to **Production** on
2026-09-25 (owner-approved; run through the Neon MCP, tables, constraints and indexes verified). Every feed, comment,
media, member and notification read anti-joins `user_block`, so the table had to exist before this code deploys; it
does on both, so the PR is safe to merge.

## 3. Reports (TRI-237)

### 3.1 `POST /api/reports`

Body (`lib/validations/reports.ts`):

```json
{ "tribeId": "uuid", "targetType": "post|comment|media|user", "targetId": "uuid",
  "reason": "spam|harassment|hate|sexual_content|violence|self_harm|other", "note": "optional, ≤ 1000 chars" }
```

`note` is trimmed; empty or whitespace becomes `null`. Unknown keys are ignored.

Response `Report`: `{ id, tribeId, targetType, targetId, reason, note, status: "open", createdAt }`.

| Case (checked in this order) | Response |
|---|---|
| no session | 401 |
| body not JSON, missing/unknown field value, malformed uuid, note > 1000 | 400 `{ code: "VALIDATION_FAILED", details }` |
| caller is not a member of `tribeId` (including an unknown tribe) | 403 `{ code: "NOT_A_MEMBER" }` |
| target doesn't exist **in that tribe** | 404 `{ code: "TARGET_NOT_FOUND" }` |
| target is the caller, or the caller's own post / comment / photo | 400 `{ code: "CANNOT_REPORT_SELF" }` |
| caller already has an **open** report on this target | 200 `{ report, created: false }` — the existing row, unchanged (idempotent; no email, not rate-charged) |
| 10 new reports by the caller in the last rolling hour | 429 `{ code: "RATE_LIMITED", retryAfterSeconds }` + `Retry-After` header |
| new | 201 `{ report, created: true }` |

"In that tribe": a post with `post.tribe_id = tribeId`; a comment whose post **or event** is in the tribe; a photo
with `media.tribe_id = tribeId` that the caller may see (TRI-273 album rules, so a hidden-album photo is 404 as if
missing); a `user` who is a live (not deleted) member of the tribe. Anything else is 404, so the route can't probe
other tribes. Reporting ignores blocks: a member can report someone they blocked (or who blocked them).

Rate limit: a count over `idx_report_reporter_created` (no rate limiter exists in tribe-v2). A concurrent duplicate
loses to the partial unique index and is answered with the winner's row (200).

### 3.2 Email

After the response (`after()` from `next/server`), `sendReportEmails` (`lib/services/reports.ts`) sends one message
per recipient through the existing Resend client (`lib/email/templates/content-report/`, same pattern as the
invitation emails). Member-written text is HTML-escaped. It never throws: every outcome is one log line
`[reports] report=<id> …`.

- **Tribe owner** (`tribe_member.role = 'owner'`), except when the report is about the owner or the owner's content
  (logged `report is about the tribe owner; tribe owner not emailed`).
- **Platform owner**: `PLATFORM_OWNER_EMAIL` env var (`anthonygayflor6@gmail.com`, owner decision 2026-09-25). Unset → skipped and logged (`PLATFORM_OWNER_EMAIL is not set`).
  Skipped if it is the same address as the tribe owner's.
- Content: tribe, reason, note, reporter name, author/member name, a 280-char excerpt (post/comment) or the photo URL,
  ids and timestamp; "Nothing has been hidden or removed automatically".
- The email module is imported lazily, so a missing `RESEND_API_KEY` (the client throws at import) can't break
  report creation either.

## 4. Blocking (TRI-238)

### 4.1 Routes

| Route | Response |
|---|---|
| `POST /api/me/blocks/{userId}` | 201 `{ block, created: true }`; already blocked → 200 `{ block, created: false }` (idempotent) |
| `DELETE /api/me/blocks/{userId}` | 200 `{ success: true, removed: boolean }` (idempotent; `removed: false` when there was no block) |
| `GET /api/me/blocks?limit=&offset=` | 200 `{ blocks: Block[], total, hasMore }`, newest first; `limit` 1–100 (default 50) |

`Block`: `{ user: { id, name, displayName, username, image }, createdAt }` (no email).

Errors: 401 without a session; 400 `INVALID_USER_ID` (malformed id), 400 `CANNOT_BLOCK_SELF` (POST and DELETE),
404 `USER_NOT_FOUND` (POST only: unknown or deleted account), 400 `INVALID_QUERY` (GET paging). Any live user can
be blocked; no shared tribe is required. The list shows only the caller's own blocks (a block is one row, but
filters both ways).

### 4.2 Rules

- **Both directions**: once A blocks B, neither sees the other's content (§5). If both block each other, both rows
  must go before content returns.
- **Membership untouched**: both stay members with their roles; third parties see everything as before.
- **Notifications**: existing rows between the pair are **kept but hidden** (feed filter on the row's actor), so
  unblocking brings them back. `notify()` writes no new row when the actor and the recipient are a blocked pair.
- **Direct fetches** of the other's post (detail, its comments, commenting on it, liking it) → **404**, as for a
  missing post (not 403: nothing reveals the block). Same for liking their photo (`/media/{id}/like`) and their
  profile routes.
- **Comments** by the other inside a third party's post or an event are hidden, and so are replies under a hidden
  comment (they answer something the viewer can't see).
- **Counts are server counts** and include the other: `likeCount`, `commentCount`, `goingCount`, album
  `photoCount` / `contributorCount` in lists, poll vote counts, tribe `memberCount`, unread post counts. Only the
  album *detail* `photoCount` shrinks (it is the length of the filtered list). The members list `total` and the media
  list `total` are filtered (they page the filtered rows).
- **Events hosted by the other stay visible** (an event belongs to the tribe): title, host, detail, RSVP. Their
  comments and attendee rows are hidden. Same for albums they created and polls they created.
- **Admins list** (`/members/admins`) and event co-hosts are not filtered: members should always know who runs the
  tribe or an event.
- **Moderation is not blocked**: pinning / unpinning (`/posts/{id}/pin`) ignores blocks. Deleting a post or comment as
  a moderator never went through the read filter.
- **Writes a blocked user can still make**: replying to the other's comment by id (the reply is then invisible to
  both of them, and nobody is notified); RSVPing to the other's event. Neither reaches the other.

### 4.3 Account deletion (TRI-16)

`deleteAccount` now also removes `user_block` rows in both directions, in the same transaction. Reports the user
filed are **kept as evidence**: the `user` row stays as a tombstone, so `reporter_id` names "Deleted user". Reports
*about* them keep `target_id`.

## 5. Filtering map

One helper, `excludeBlocked(viewerId, userIdColumn)` in `lib/services/blocks.ts`: a SQL condition with two
`NOT EXISTS` probes (`blocker_id = viewer AND blocked_id = col`, and the reverse), each an index lookup
(`user_block_blocker_blocked_unique`, `idx_user_block_blocked_blocker`). Postgres plans it as two hash anti-joins
(checked with `EXPLAIN` on the tribe feed). `undefined` without a viewer, so `and(...)` drops it. Point checks use
`isBlockedPair(a, b)`.

| Route | Service | Filter |
|---|---|---|
| `GET /tribes/{id}/posts` (feed) | `getTribePosts` | `post.author_id`; plus top comment (`comment.author_id`) and likers (`post_like.user_id`) |
| `GET /tribes/{id}` (announcement) | `getTribeAnnouncement` | `post.author_id` |
| `GET /tribes/{id}/posts/{postId}` | `getPostByIdWithMetadata` + `verifyPostAccessAndMembership` | 404 for a blocked pair |
| `GET/POST …/posts/{postId}/comments`, `POST …/like` | `verifyPostAccessAndMembership` | 404 for a blocked pair |
| `GET …/posts/{postId}/comments` | `getPostComments` | `comment.author_id` + orphaned replies dropped |
| `GET …/events/{eventId}/comments` | `getEventComments` | `comment.author_id` + orphaned replies dropped |
| `GET /tribes/{id}/media` (gallery, All photos, `uploadedBy`) and `total` | `getMediaByTribe` / `countMediaByTribe` (`mediaListConditions`) | `media.uploaded_by` (whenever `viewerAccess` is set) |
| `GET /tribes/{id}/media/public` | `getMediaByTribe` | same |
| `GET/POST/DELETE /tribes/{id}/media/{mediaId}/like` | `getVisibleMediaInTribe` | 404 for a blocked pair |
| `GET /tribes/{id}/albums/{albumId}` | `getAlbumById` | photos by `media.uploaded_by`; contributors, fallback cover, `photoCount` follow |
| `GET /tribes/{id}/albums` | `getTopContributors` | contributors by `media.uploaded_by` |
| `GET /tribes/{id}/members/list` (and `search`) | `getAllTribeMembers` | `tribe_member.user_id` (list and `total`) |
| `GET …/events/{eventId}/attendees` | `getEventAttendees` | `event_attendee.user_id` |
| `GET …/events/{eventId}`, event cards (feed, agenda, catch-up) | `getAgendaItems` | `attendeePreview` by `event_attendee.user_id` |
| Poll results (post/event polls) | `loadPollsWithDetails` | named voters by `poll_vote.user_id` |
| `GET /users/{id}/profile`, `/posts`, `/events`, `/media` | `getMemberProfile`, `profileVisible` | 404 for a blocked pair (both directions) |
| `GET /me/notifications`, `/me/notifications/groups`, unread counts / badge | `ownRows` in `notification-feed.ts` | `notification.actor_id` |
| (write side) every notification | `notify()` | recipients in a blocked pair with the actor are dropped |
| `GET /me/catch-up` | `getCatchUp` | posts `post.author_id` (and `getPostsByIds`), RSVP rows, member-joined rows |
| `GET /tribes/{id}/activities`, `GET /activities` (web) | `getTribeActivities`, `getUserTribesActivities` | `activity.user_id` |

Not filtered (by design): `/members/admins`, event co-hosts, event host/creator fields, album creator, counts (§4.2),
`GET /me/agenda` (events only, which stay visible).

## 6. Code

| File | Change |
|---|---|
| `lib/database/migrations/tri237-238-reports-blocks.sql` | new migration (§2) |
| `lib/database/schemas/enums.ts`, `safety.ts`, `index.ts` | three enums, `report`, `userBlock` |
| `lib/services/blocks.ts` | new: `excludeBlocked`, `isBlockedPair`, `blockUser`, `unblockUser`, `listBlocks` |
| `lib/services/reports.ts` | new: `createReport`, `sendReportEmails`, `REPORT_RATE_LIMIT` |
| `lib/validations/reports.ts` | new: `createReportSchema`, `listBlocksQuerySchema` |
| `lib/email/templates/content-report/*` | new email (html, text, send, escape) |
| `app/api/reports/route.ts`, `app/api/me/blocks/route.ts`, `app/api/me/blocks/[user_id]/route.ts` | new routes |
| `lib/services/post.ts`, `comment.ts`, `media.ts`, `album.ts`, `members.ts`, `event.ts`, `poll.ts`, `profile.ts`, `notification-feed.ts`, `agenda.ts`, `activity.ts` | the filters in §5 |
| `lib/services/notifications.ts` | `notify()` drops blocked-pair recipients |
| `lib/services/account.ts` | delete removes blocks both ways; reports kept |
| `app/api/tribes/[tribe_id]/events/[event_id]/attendees/route.ts`, `…/activities/route.ts`, `app/api/activities/route.ts` | pass the viewer |
| `app/api/tribes/[tribe_id]/posts/[post_id]/pin/route.ts` | `ignoreBlocks` (moderation) |

`npx tsc --noEmit`: the same 9 baseline errors, file by file (line numbers moved in `lib/services/activity.ts`,
`album.ts`, `media.ts` because of the added lines; same errors). `npx next typegen` run.

Env: `PLATFORM_OWNER_EMAIL=anthonygayflor6@gmail.com` (new, optional; the owner sets it on Vercel Production and Preview). The existing
`RESEND_API_KEY` / `RESEND_FROM_EMAIL` must be a verified sending domain for the email to reach anyone but the Resend
account owner (see §7).

## 7. Verification (2026-09-25, `next dev` + Neon Development)

Scripted end-to-end run (`tri237-238-e2e.sh`): **275 / 275 passed.** Pair: home16 (Lisa Park, member) and home17
(Chris Taylor, admin, host of event "x") in College Friends; throwaway posts / comments / likes; all deleted after.

- **Baseline, blocked, restored**: the same 40-odd checks per direction run three times (no block → visible; A blocks
  B → hidden **both ways**; both unblock → visible): tribe feed (their post; nothing by them), feed likers, top
  comment, post detail 404, their post's comments 404, liking their post 404, their comment on my post, their comment
  on a third party's post, a third party's reply under their comment, event comments, gallery `uploadedBy` total,
  All photos, `/media/public`, photo like 404, album photos + contributors, album list contributors, members list,
  member search, event attendees, event detail still 200 with `attendeePreview` filtered, `/users/{id}/profile|posts|
  events|media` 404, notifications flat / per tribe / groups, catch-up, tribe activities. `likeCount` unchanged.
- **Blocks API**: 401s; self 400 `CANNOT_BLOCK_SELF` (POST and DELETE); malformed 400; unknown 404; 201 then 200
  `created: false`; list shape (no email), B's list empty; both-ways block needs both unblocks; DELETE `removed`
  true then false. Membership rows unchanged; a third party sees both.
- **notify()**: B replying to A's comment while blocked writes no reply notification; the two pre-block comment
  notifications are still in the table (hidden, restored on unblock).
- **Reports**: 401; 400 (bad JSON, missing/unknown reason, unknown target type, bad uuid, 1001-char note, own post,
  self); 403 non-member and unknown tribe; 404 unknown post, another tribe's post / comment / photo, non-member user,
  unknown user; 201 for post (while blocked; note trimmed, stored raw, escaped in the email), post comment, event
  comment, photo, member, the owner; repeat → 200 same id; rate limit: 10 in the hour, then 429 with `Retry-After`
  and `retryAfterSeconds` ≤ 3600; a repeat of an open report at the limit is still 200; another reporter unaffected.
- **Email**: logged per report after the response. Tribe owner attempted; on Development Resend refused it
  (`validation_error: You can only send testing emails to your own email address …` — the dev `RESEND_FROM_EMAIL` is
  the unverified sandbox sender), logged, report unaffected. `PLATFORM_OWNER_EMAIL` unset → skipped and logged. A
  report about the owner → owner not emailed (logged). The idempotent repeat sent nothing.
- **Account deletion**: a throwaway member blocks A, is blocked by A, reports B's post, deletes the account → no
  `user_block` rows left for them, the report kept with the tombstone as reporter, A's blocked list empty.
- **Regressions**: `tri15-e2e.sh` 55 / 55, `tri16-e2e.sh` 76 / 76.

Left on Development: one tombstone `tri238-del-<run>@tribe-seed.test` (plus the TRI-16 script's own three). No
blocks, no reports, no throwaway posts or comments.

## 8. Mobile contract on merge

In tribe-mobile `docs/api/openapi.yaml` (and `contract/openapi.yaml`), all as `x-status: existing` once merged, then
regenerate the client and re-run `contract:gaps`:

| Where | Change |
|---|---|
| `POST /reports` (`createReport`) | new op. Body `CreateReportInput`; `201`/`200` `{ report: Report, created: boolean }`; `400` (`VALIDATION_FAILED`, `CANNOT_REPORT_SELF`), `401`, `403` (`NOT_A_MEMBER`), `404` (`TARGET_NOT_FOUND`), `429` (`RATE_LIMITED`, `retryAfterSeconds`, `Retry-After` header) |
| `CreateReportInput` | new schema: `tribeId` uuid, `targetType` `ReportTargetType`, `targetId` uuid, `reason` `ReportReason`, `note` `[string, 'null']` maxLength 1000; required the first four |
| `Report` | new schema: `id`, `tribeId`, `targetType`, `targetId`, `reason`, `note` nullable, `status` `enum [open, dismissed, removed]`, `createdAt` |
| `ReportTargetType`, `ReportReason` | new enums: `[post, comment, media, user]`; `[spam, harassment, hate, sexual_content, violence, self_harm, other]` |
| `POST /me/blocks/{userId}` (`blockUser`) | new op: `201`/`200` `{ block: Block, created: boolean }`; `400` (`INVALID_USER_ID`, `CANNOT_BLOCK_SELF`), `401`, `404` (`USER_NOT_FOUND`) |
| `DELETE /me/blocks/{userId}` (`unblockUser`) | new op: `200` `{ success: true, removed: boolean }`; `400`, `401` |
| `GET /me/blocks` (`listBlocks`) | new op: `limit` (1–100, default 50), `offset`; `200` `{ blocks: Block[], total, hasMore }`; `400`, `401` |
| `Block` | new schema: `{ user: BlockedUser, createdAt }`; `BlockedUser` = `{ id, name, displayName: [string,'null'], username: [string,'null'], image: [string,'null'] }` |
| `getMemberProfile` / `getMemberPosts` / member events / member media | note: 404 also for a blocked pair (either direction) |
| `getPost`, post comments, `likePost`, media like | note: 404 when the author / uploader and the caller are a blocked pair |
| Feed, comments, media lists, albums, members list, attendees, notifications, catch-up | description note: a blocked pair's rows are omitted; counts (`likeCount`, `commentCount`, `goingCount`, list `photoCount`/`contributorCount`) still include them |

## 9. Owner decisions (2026-09-25)

- **Production migration**: approved and applied. `tri237-238-reports-blocks.sql` ran on Production through the Neon
  MCP; the `report` and `user_block` tables, their constraints and indexes were verified.
- **`PLATFORM_OWNER_EMAIL`**: `anthonygayflor6@gmail.com`; the owner sets it on Vercel.
- **Resend sending domain**: still to confirm. Development sends from the sandbox sender, which only delivers to the
  Resend account owner; Production's `RESEND_FROM_EMAIL` must be on a verified domain, or report emails reach no one.
- **Reason set** (`spam, harassment, hate, sexual_content, violence, self_harm, other`): kept. Renaming later is an
  enum migration.
- **Counts unfiltered; tribe-owned events, albums and polls stay visible** (§4.2): kept.
