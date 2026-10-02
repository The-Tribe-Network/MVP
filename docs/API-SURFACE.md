# API surface

The living inventory of tribe-v2's API (TRI-148): what exists, how it is guarded, what it writes and talks to, and what
a port to the standalone API (tribe-api, Closed Beta) has to preserve. **Every route is here, web-only ones
included**: D3 (2026-09-21) is a full cutover, so tribe-v2 ends up UI-only and every handler gets ported.

- The **tables at the end are generated**: run `node scripts/api-surface.mjs` after adding or changing a route or
  service (`--check` fails when they are stale). Everything else is written by hand; update it in the same PR.
- The mobile contract is `tribe-mobile/contract/openapi.yaml` (+ `docs/api/API.md`); its `x-status` markers say what
  is served. This file is about the server side.

Last full pass: 2026-09-28 (117 route files, 42 services).

## How requests are served

- **Next.js route handlers** on Vercel (Node runtime, region `iad1`), `app/apiroute.ts`, plus three public HTML
  pages (`app/i`, `app/join`, `app/open`, TRI-340) and the Better-Auth catch-all `app/api/auth/[...all]`.
- **Auth**: Better-Auth sessions, as a cookie (web) or `Authorization: Bearer` (mobile, `bearer()` + `expo()` plugins).
  Handlers call `getServerUser()` and answer 401 without a user. Business rules also live in Better-Auth's hooks
  (`lib/clients/auth.ts`): the 13+ birthday gate and the taken-email 422 on sign-up, change-email checks, the 502
  `EMAIL_NOT_SENT` when a code can't be sent, security / welcome emails, tombstone and deactivation handling on session
  create, and the alpha gate (TRI-370: with `ALPHA_GATE_ENABLED=true`, session create answers 403
  `ALPHA_ACCESS_PENDING` unless `alpha_access` has the email approved). **A port must carry these hooks**, not only the routes.
- **Checks**: tribe membership (`checkTribeMembership`), the member's effective permissions
  (`getMemberWithPermissions` → `checkPermission(tribe, user, 'canX')`, three layers: role matrix, per-member
  overrides, section levels; TRI-17), event editability (`eventEditability`), media visibility
  (`getVisibleMediaInTribe`, album privacy, blocks). Blocks (TRI-238) filter reads through `excludeBlocked()` in
  queries, not in handlers.
- **Id validation**: `proxy.ts` answers 400 for malformed ids on **event routes only** (TRI-335); other routes check
  uuids themselves or let an unknown id fall through to 404.
- **Database**: Neon Postgres through Drizzle. `db` is the HTTP driver (one statement per request, no transactions);
  multi-statement writes use `getDbTransaction()` (a cached WebSocket `Pool`). Schema is `db:push`-managed; data and
  shape migrations are hand-written SQL in `lib/database/migrations/`, run on Development and Production by hand.

## Transactions

Every `getDbTransaction().transaction(...)` (the list a pooled-client change must keep). Almost all are the
**outbox rule** of ADR-17: a write and the `notify()` rows it causes commit together, so a notification never exists
for a write that rolled back (and vice versa).

| Service | What commits together |
| --- | --- |
| `post.ts` (3) | `createPost` + its notifications; `togglePostLike` + the author's notification (TRI-193); `togglePostPin` |
| `comment.ts` (3) | `createComment` / `createEventComment` + their notifications (TRI-186); `toggleCommentLike` + notification |
| `event.ts` (4) | `updateEvent` + `event_update` notification + the TRI-349 email outbox row; `deleteEvent` + cancellation notice + outbox; `addEventAttendee` / `removeEventAttendee` (RSVP upsert + hosts' notification, TRI-188) |
| `poll.ts` (2) | `createPoll` with its options; `votePoll` (was a 500 on neon-http, TRI-13) |
| `invitation.ts` (3) | `createTribeInvitations` + in-app rows (TRI-187); `resendTribeInvitation`; `acceptInvitation` (membership + status + notification) |
| `invite-link.ts` (1) | `joinByInviteCode`, re-checking the code inside the transaction so a rotation can't admit an old code |
| `chat.ts` (2) | `sendMessage` + mention / reply notifications (TRI-317); `deleteMessage` with its photos |
| `timeline.ts` (2) | `deleteTimeline` with chat photos and cascades; `reorderTimelines` |
| `account.ts` (2) | `deleteAccount` (sessions, links, memberships, media → purge queue, scrub; TRI-16); `deactivateAccount` + revoke sessions |
| `media.ts` (1) | `deleteMedia`: the photo's row + its file queued in `media_purge` (TRI-120) |
| `media-upload.ts` (1) | `insertVerified` (confirm a signed upload): media row + album / post links |
| `user-media-upload.ts` (1) | `confirmUserUpload` (TRI-417): the avatar / tribe-avatar media row + `user.image` for a profile photo |
| `tribe.ts` (1) | `markCatchUpDone` (per-tribe `last_catch_up_at` for one or all tribes) |
| `profile.ts` (1) | `updateProfileWithSocialLinks` (profile + the social link rows) |

## Hot and expensive queries

Not yet measured under real load (the alpha isn't live; the Development seed is ~60 users, 66 posts, 216 photos).
These are the ones to watch, with the indexes added for them:

- **Tribe list** `GET /tribes` → `getMyTribeSummaries` (tribe.ts): member counts, unread counts since
  `last_catch_up_at`, role, last activity, per tribe (TRI-159).
- **Feed** `GET /tribes/:id/posts`: posts with media, poll, event card, `topComment`, likers, the tribe announcement
  (TRI-9, TRI-149); per-row enrichment is batched, not N+1. `idx_comment_post_id`.
- **Agenda / calendar / event cards** `getAgendaItems` + `rsvpCountsFor` (event.ts): going = people + guests.
  `idx_event_tribe_start`.
- **Catch up** `GET /me/catch-up`: offset cursor (base64 offset; shifts by one when an item is read; the app refetches
  from the first page). `catch_up_read`.
- **Notifications** `GET /me/notifications/groups`: grouped by tribe, collapsed rows. `idx_notification_user_unread`,
  `idx_notification_user_tribe_latest`.
- **Photos** `GET /tribes/:id/media` with filters and totals (TRI-207). `idx_media_tribe_created`.
- **Members** `GET /tribes/:id/members/list` with effective permissions and block filtering.

## After the response, and on a schedule

- **`after()`** (runs after the response on Vercel; failures are only logged): Ably publishes for chat send / edit /
  delete / reactions (TRI-316), report emails (TRI-237), the event-cancellation email (TRI-349).
- **Cron** `GET /api/cron/notifications`, every 15 min (`vercel.json`; needs Vercel Pro), one route, sequential:
  event reminders (TRI-190) + the day-before reminder email (TRI-350), poll results (TRI-219), due event-change emails
  (TRI-349), daily digests (TRI-347), purge of deleted photos older than 30 days (TRI-120). Each step is idempotent
  (`once` rows, `email_log`, claimed outbox rows), so a repeated tick sends nothing twice.
- **Inline but would be better queued**: invite / accepted / declined emails (awaited in the request), code emails
  (awaited on purpose: a failure must reach the user), Cloudinary blurhash on confirm.

## External services

| Service | Used for | Where |
| --- | --- | --- |
| Neon | Postgres (HTTP + WebSocket drivers) | everything |
| Cloudinary | signed direct upload (tribe-scoped + user-scoped, TRI-417), confirm + blurhash, asset destroy (now via the 30-day purge), notification webhook URL | `media-upload.ts`, `user-media-upload.ts`, `media.ts` |
| Resend | every email (`lib/email/`: codes, invites, reports, account notices, event changes, reminders, digest) | `sendEmail()` |
| Ably | live chat: REST publish + token requests scoped to the member's chat timelines | `realtime.ts`, `GET /realtime/token` |
| Google, Discord | OAuth sign-in (Google paused for the alpha, TRI-236) | Better-Auth |
| Link previews | outbound fetch of pasted URLs (private hosts refused) | `link-preview.ts` |
| Vercel Cron | the 15-min scheduler | `vercel.json` |
| Sentry | error reporting, server only (off without `SENTRY_DSN`): uncaught errors via `onRequestError`, caught 5xx via `reportServerError()` | `instrumentation.ts`, `lib/clients/sentry.ts` |
| Expo push | not yet (M6, TRI-12) | — |

## Web server code that bypasses HTTP

These call `@/lib/services` directly from server components, so no route-based inventory sees them. Each needs a
replacement endpoint (or an existing one) before the web cutover; this list is that task list.

| File | Needs |
| --- | --- |
| `app/(protected)/layout.tsx` | `requireAuth` (session gate) |
| `app/(protected)/tribe/[tribe_id]/layout.tsx` | `getServerUser`, `checkTribeMembership` (→ `GET /tribes/:id/members/me`) |
| `app/(protected)/dashboard/page.tsx` | `getServerUser` |
| `app/(protected)/welcome/page.tsx` | `requireAuth`, `isProfileComplete` (→ `GET /user/profile`) |
| `app/(protected)/tribe/[tribe_id]/media/album/new/page.tsx` | `getServerUser`, `getTribeById`, `getMemberWithPermissions` (→ `GET /tribes/:id`, `/members/me`) |
| `app/(auth)/layout.tsx` | `redirectIfAuthenticated` |
| `app-pages/auth/user-profile.tsx` | `getServerUser`, `logout` |

The session helpers (`getServerUser`, `requireAuth`, `redirectIfAuthenticated`, `logout`) become a session read from
the auth service; the rest map to the routes named.

Web needs that mobile doesn't: the waitlist and survey routes, the marketing pages under `app/(public)`, link-based
password reset (currently sends nothing, TRI-343).

## Contract status (mobile)

`tribe-mobile/contract/openapi.yaml`: 154 operations / fields `existing`, **6 `proposed`, 1 `changed`**, each deferred
by an issue: notification preferences GET / PATCH (TRI-8, M6), push devices POST / DELETE (TRI-12, M6), event list
`from` / `to` / past sort (`changed`, TRI-311), duplicate event (TRI-19), `Post.tribe` on the tribe feed (TRI-155).
`contract/known-gaps.json` lists the two the app already consumes (`Post.tribe`, `duplicateEvent`).

## Rough edges (fix in tribe-v2 first where cheap, or at the port)

- **Response shapes are inconsistent**: errors are `{ error }` in older routes and `{ code, message }` in newer ones;
  some creates return the entity, some `{ entity }`; event update is `PUT` with the whole event (partial bodies 400).
  The `/api/v1` boundary is the chance to settle one shape.
- **Module-scope side effects**: `lib/email/client.ts` throws at import without `RESEND_API_KEY` (reports import it
  lazily to dodge that); `lib/database/client.ts` calls `dotenv` and builds the client at import (it broke Preview
  builds without `DATABASE_URL`).
- **Vercel shaped**: the 4.5 MB request body cap is why uploads are signed and direct to Cloudinary (TRI-160); the one
  cron route doing everything sequentially is a Vercel Cron cost choice, not a design (a queue in tribe-api).
- **Offset paging** on catch-up and several lists (TRI-155 decides where cursors are needed).
- **Id validation** is centralized only for event routes (`proxy.ts`).
- `lib/services/album.ts.backup` is a stray copy; delete it.
- `tsc --noEmit` has a 9-error baseline (TRI-164 drives it to zero).

## Traffic reality

To fill in once the alpha is live: hot routes, p95 per route, upload sizes. Vercel runtime logs aren't available on the
current plan through the API; PostHog has client-side events only (`app_env = production`).

## Tables

<!-- GENERATED:START (node scripts/api-surface.mjs) -->

### Routes (122 handler files)

Auth: `session` = `getServerUser()` (cookie or bearer), `Better-Auth` = its catch-all, `cron secret` = `Authorization: Bearer $CRON_SECRET`, `signed token` = HMAC in the URL, `Cloudinary signature` = the webhook's `X-Cld-Signature`, `public` = none. Session also covers routes whose handler lives in a service that signs the caller in (`guardEventRoute`, `timelineRoute`, `poll-votes`). `after()` is the route's own; External is the route plus the services it imports directly. What writes, opens transactions or calls `notify()` is per service, in the second table.

| Route | Methods | Auth | Checks | Services | `after()` | External |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/activities` | GET | session | — | `activity`, `auth`, `tribe` |  |  |
| `/api/auth/*all` | GET POST | Better-Auth | — | — |  |  |
| `/api/cron/notifications` | GET | cron secret | — | `digest-emails`, `event-change-emails`, `media`, `scheduled-notifications` |  | Cloudinary, Resend |
| `/api/email/unsubscribe` | GET POST | signed token | — | `email-preferences` |  | Resend |
| `/api/invitations` | GET | session | — | `auth`, `invitation` |  | Resend |
| `/api/invitations/:invitation_id/accept` | POST | session | — | `auth`, `invitation` |  | Resend |
| `/api/invitations/:invitation_id/reject` | POST | session | — | `auth`, `invitation` |  | Resend |
| `/api/locations/search` | GET | public | — | — |  | Nominatim (OSM) |
| `/api/me/account` | DELETE | session | — | `account`, `auth` |  | Resend |
| `/api/me/account/deactivate` | POST | session | — | `account`, `auth` |  | Resend |
| `/api/me/agenda` | GET | session | — | `agenda`, `auth` |  |  |
| `/api/me/blocks` | GET | session | — | `auth`, `blocks` |  |  |
| `/api/me/blocks/:user_id` | DELETE POST | session | — | `auth`, `blocks` |  |  |
| `/api/me/catch-up` | GET | session | — | `agenda`, `auth` |  |  |
| `/api/me/catch-up/done` | POST | session | — | `auth`, `tribe` |  |  |
| `/api/me/catch-up/read` | POST | session | — | `auth`, `tribe` |  |  |
| `/api/me/drafts` | GET POST | session | — | `auth`, `draft` |  |  |
| `/api/me/drafts/:draft_id` | DELETE PATCH | session | — | `auth`, `draft` |  |  |
| `/api/me/notifications` | GET | session | — | `auth`, `notification-feed` |  |  |
| `/api/me/notifications/:notification_id/read` | POST | session | — | `auth`, `notification-feed` |  |  |
| `/api/me/notifications/groups` | GET | session | — | `auth`, `notification-feed` |  |  |
| `/api/me/notifications/read-all` | POST | session | — | `auth`, `notification-feed` |  |  |
| `/api/me/privacy` | GET PATCH | session | — | `auth`, `profile` |  |  |
| `/api/media/:media_id` | DELETE | session | — | `auth`, `media` |  | Cloudinary |
| `/api/realtime/token` | GET | session | — | `auth`, `realtime` |  | Ably |
| `/api/reports` | POST | session | — | `auth`, `reports` | yes | Resend |
| `/api/survey` | POST | public | — | — |  |  |
| `/api/tribes` | GET POST | session | — | `auth`, `tribe` |  |  |
| `/api/tribes/:tribe_id` | DELETE GET PATCH | session | `getMemberWithPermissions` | `auth`, `invitation`, `member-permissions`, `permissions`, `tribe`, `tribe-settings` |  | Resend |
| `/api/tribes/:tribe_id/activities` | GET | session | `checkTribeMembership` | `activity`, `auth`, `permissions` |  |  |
| `/api/tribes/:tribe_id/albums` | GET POST | session | `checkTribeMembership` | `album`, `auth`, `permissions` |  |  |
| `/api/tribes/:tribe_id/albums/:album_id` | DELETE GET PUT | session | `checkTribeMembership` | `album`, `auth`, `permissions` |  |  |
| `/api/tribes/:tribe_id/albums/:album_id/media` | DELETE POST | session | `canUserSeeAlbum`, `checkTribeMembership` | `album`, `auth`, `permissions` |  |  |
| `/api/tribes/:tribe_id/events` | GET POST | session | `checkPermission`, `getMemberWithPermissions` | `auth`, `event`, `permissions`, `role-permissions` |  | Resend |
| `/api/tribes/:tribe_id/events/:event_id` | DELETE GET PUT | session | `checkPermission`, `eventEditability`, `getMemberWithPermissions` | `auth`, `event`, `event-settings`, `permissions`, `role-permissions` |  | Resend |
| `/api/tribes/:tribe_id/events/:event_id/announce` | POST | session | `guardEventRoute` | `event-routes`, `event-settings` |  |  |
| `/api/tribes/:tribe_id/events/:event_id/attendees` | DELETE GET POST | session | `getMemberWithPermissions` | `auth`, `event`, `permissions` |  | Resend |
| `/api/tribes/:tribe_id/events/:event_id/attendees/bulk-remove` | POST | session | `getMemberWithPermissions` | `auth`, `event`, `permissions` |  | Resend |
| `/api/tribes/:tribe_id/events/:event_id/co-hosts` | GET POST | session | `getMemberWithPermissions`, `guardEventRoute` | `event-routes`, `event-settings`, `permissions` |  |  |
| `/api/tribes/:tribe_id/events/:event_id/co-hosts/:user_id` | DELETE | session | `guardEventRoute` | `event-routes`, `event-settings` |  |  |
| `/api/tribes/:tribe_id/events/:event_id/co-hosts/request` | POST | session | `guardEventRoute` | `event-routes`, `event-settings` |  |  |
| `/api/tribes/:tribe_id/events/:event_id/comments` | GET POST | session | `getMemberWithPermissions` | `auth`, `comment`, `event`, `permissions` |  | Resend |
| `/api/tribes/:tribe_id/events/:event_id/comments/:comment_id` | DELETE PATCH | session | `checkTribeMembership` | `auth`, `comment`, `event`, `permissions` |  | Resend |
| `/api/tribes/:tribe_id/events/:event_id/comments/:comment_id/like` | DELETE POST PUT | session | `checkTribeMembership` | `auth`, `comment`, `event`, `permissions` |  | Resend |
| `/api/tribes/:tribe_id/events/:event_id/links` | GET POST | session | `guardEventRoute` | `event-routes`, `event-settings` |  |  |
| `/api/tribes/:tribe_id/events/:event_id/links/:link_id` | DELETE | session | `guardEventRoute` | `event-routes`, `event-settings` |  |  |
| `/api/tribes/:tribe_id/events/:event_id/polls` | GET POST | session | `canCreateEventPoll`, `getMemberWithPermissions` | `auth`, `event`, `event-settings`, `permissions`, `poll` |  | Resend |
| `/api/tribes/:tribe_id/events/:event_id/polls/:poll_id` | DELETE | session | `getMemberWithPermissions` | `auth`, `permissions`, `poll` |  |  |
| `/api/tribes/:tribe_id/events/:event_id/polls/:poll_id/votes` | DELETE POST | session | — | `poll-votes` |  |  |
| `/api/tribes/:tribe_id/events/:event_id/settings` | GET PATCH | session | `guardEventRoute` | `event-routes`, `event-settings` |  |  |
| `/api/tribes/:tribe_id/featured-media` | DELETE GET PUT | session | `checkTribeMembership` | `auth`, `permissions`, `tribe` |  |  |
| `/api/tribes/:tribe_id/invitations` | GET POST | session | `checkPermission`, `checkTribeMembership` | `auth`, `invitation`, `permissions`, `role-permissions`, `tribe` |  | Resend |
| `/api/tribes/:tribe_id/invitations/:invitation_id` | DELETE PATCH | session | `checkPermission`, `checkTribeMembership` | `auth`, `invitation`, `permissions`, `role-permissions` |  | Resend |
| `/api/tribes/:tribe_id/invite-link` | GET PATCH POST | session | `checkPermission` | `auth`, `invite-link`, `role-permissions` |  |  |
| `/api/tribes/:tribe_id/media` | GET POST | session | `checkTribeMembership` | `album`, `auth`, `keyset-cursor`, `media`, `multipart-limits`, `permissions` |  | Cloudinary |
| `/api/tribes/:tribe_id/media/:media_id` | DELETE PATCH | session | `checkTribeMembership`, `getMediaInTribe` | `album`, `auth`, `media`, `permissions` |  | Cloudinary |
| `/api/tribes/:tribe_id/media/:media_id/like` | DELETE GET POST | session | `checkTribeMembership`, `getVisibleMediaInTribe` | `auth`, `media`, `permissions` |  | Cloudinary |
| `/api/tribes/:tribe_id/media/batch` | POST | session | `checkTribeMembership` | `album`, `auth`, `media`, `multipart-limits`, `permissions` |  | Cloudinary |
| `/api/tribes/:tribe_id/media/confirm` | POST | session | `checkTribeMembership` | `album`, `auth`, `media-upload`, `permissions` |  | Cloudinary |
| `/api/tribes/:tribe_id/media/public` | GET | session | `checkTribeMembership` | `album`, `auth`, `media`, `permissions` |  | Cloudinary |
| `/api/tribes/:tribe_id/media/sign` | POST | session | `checkTribeMembership` | `album`, `auth`, `media-upload`, `permissions` |  | Cloudinary |
| `/api/tribes/:tribe_id/members` | DELETE | session | `checkTribeMembership` | `auth`, `permissions`, `tribe` |  |  |
| `/api/tribes/:tribe_id/members/:member_id` | DELETE | session | — | `auth`, `members` |  |  |
| `/api/tribes/:tribe_id/members/:member_id/permissions` | DELETE GET PUT | session | `checkPermission` | `auth`, `member-permissions`, `role-permissions` |  |  |
| `/api/tribes/:tribe_id/members/:member_id/role` | PATCH | session | — | `auth`, `members` |  |  |
| `/api/tribes/:tribe_id/members/admins` | GET | session | `checkTribeMembership` | `auth`, `permissions`, `tribe` |  |  |
| `/api/tribes/:tribe_id/members/list` | GET | session | — | `auth`, `members` |  |  |
| `/api/tribes/:tribe_id/members/me` | GET | session | `getMemberWithPermissions` | `auth`, `member-permissions`, `permissions` |  |  |
| `/api/tribes/:tribe_id/members/membership` | GET | session | `checkTribeMembership` | `auth`, `permissions` |  |  |
| `/api/tribes/:tribe_id/members/permissions` | GET | session | `checkTribeMembership` | `auth`, `member-permissions`, `permissions` |  |  |
| `/api/tribes/:tribe_id/members/preferences` | GET PATCH | session | — | `auth` |  |  |
| `/api/tribes/:tribe_id/polls/:poll_id/votes` | DELETE POST | session | — | `poll-votes` |  |  |
| `/api/tribes/:tribe_id/posts` | GET POST | session | `checkTribeMembership` | `album`, `auth`, `keyset-cursor`, `permissions`, `post`, `timeline` |  |  |
| `/api/tribes/:tribe_id/posts/:post_id` | DELETE GET PATCH | session | — | `auth`, `post` |  |  |
| `/api/tribes/:tribe_id/posts/:post_id/comments` | GET POST | session | — | `auth`, `comment`, `post` |  |  |
| `/api/tribes/:tribe_id/posts/:post_id/comments/:comment_id` | DELETE PATCH | session | `checkTribeMembership` | `auth`, `comment`, `permissions`, `post` |  |  |
| `/api/tribes/:tribe_id/posts/:post_id/comments/:comment_id/like` | DELETE POST PUT | session | `checkTribeMembership` | `auth`, `comment`, `permissions`, `post` |  |  |
| `/api/tribes/:tribe_id/posts/:post_id/like` | DELETE POST PUT | session | — | `auth`, `post` |  |  |
| `/api/tribes/:tribe_id/posts/:post_id/pin` | POST | session | — | `auth`, `post` |  |  |
| `/api/tribes/:tribe_id/roles` | GET | session | `checkPermission` | `auth`, `role-permissions` |  |  |
| `/api/tribes/:tribe_id/roles/:role` | PATCH | session | `checkPermission` | `auth`, `role-permissions` |  |  |
| `/api/tribes/:tribe_id/settings` | GET PATCH | session | `checkPermission`, `getMemberWithPermissions` | `auth`, `permissions`, `role-permissions`, `tribe-settings` |  |  |
| `/api/tribes/:tribe_id/settings/events` | GET PATCH | session | `checkPermission`, `getMemberWithPermissions` | `auth`, `permissions`, `role-permissions`, `tribe-settings` |  |  |
| `/api/tribes/:tribe_id/settings/media` | GET PATCH | session | `checkPermission`, `getMemberWithPermissions` | `auth`, `permissions`, `role-permissions`, `tribe-settings` |  |  |
| `/api/tribes/:tribe_id/settings/timeline` | GET PATCH | session | `checkPermission`, `getMemberWithPermissions` | `auth`, `permissions`, `role-permissions`, `tribe-settings` |  |  |
| `/api/tribes/:tribe_id/timelines` | GET POST | session | `timelineRoute` | `timeline`, `timeline-routes` |  |  |
| `/api/tribes/:tribe_id/timelines/:timeline_id` | DELETE PATCH | session | `timelineRoute` | `timeline`, `timeline-routes` |  |  |
| `/api/tribes/:tribe_id/timelines/:timeline_id/messages` | GET POST | session | `timelineRoute` | `chat`, `realtime`, `timeline-routes` | yes | Ably |
| `/api/tribes/:tribe_id/timelines/:timeline_id/messages/:message_id` | DELETE GET PATCH | session | `timelineRoute` | `chat`, `realtime`, `timeline-routes` | yes | Ably |
| `/api/tribes/:tribe_id/timelines/:timeline_id/messages/:message_id/reactions` | DELETE POST | session | `timelineRoute` | `chat`, `realtime`, `timeline-routes` | yes | Ably |
| `/api/tribes/:tribe_id/timelines/:timeline_id/mute` | PUT | session | `timelineRoute` | `timeline`, `timeline-routes` |  |  |
| `/api/tribes/:tribe_id/timelines/:timeline_id/read` | POST | session | `timelineRoute` | `timeline`, `timeline-routes` |  |  |
| `/api/tribes/:tribe_id/timelines/order` | PUT | session | `timelineRoute` | `timeline`, `timeline-routes` |  |  |
| `/api/tribes/:tribe_id/timelines/selected` | PUT | session | `timelineRoute` | `timeline`, `timeline-routes` |  |  |
| `/api/tribes/:tribe_id/transfer-ownership` | POST | session | — | `auth`, `tribe` |  |  |
| `/api/tribes/join/:code` | POST | session | — | `auth`, `invite-link` |  |  |
| `/api/upload/album-cover` | POST | session | `canUserUploadMedia` | `auth`, `media`, `permissions` |  | Cloudinary |
| `/api/upload/avatar` | POST | session | — | `auth`, `media` |  | Cloudinary |
| `/api/upload/confirm` | POST | session | — | `auth`, `media-upload`, `user-media-upload` |  | Cloudinary |
| `/api/upload/event-cover` | POST | session | `canUserUploadMedia` | `auth`, `media`, `permissions` |  | Cloudinary |
| `/api/upload/post-image` | POST | session | `canUserUploadMedia` | `auth`, `media`, `permissions` |  | Cloudinary |
| `/api/upload/sign` | POST | session | — | `auth`, `user-media-upload` |  | Cloudinary |
| `/api/upload/tribe-avatar` | POST | session | — | `auth`, `media` |  | Cloudinary |
| `/api/upload/tribe-banner` | POST | session | — | `auth`, `media` |  | Cloudinary |
| `/api/user/profile` | GET PATCH | session | — | `auth`, `profile`, `user` |  |  |
| `/api/user/profile/complete` | GET POST | session | — | `auth`, `user` |  |  |
| `/api/user/security/password` | POST | session | — | `auth`, `security` |  |  |
| `/api/user/security/sessions` | DELETE GET | session | — | `auth`, `security` |  |  |
| `/api/user/tour` | GET POST | session | — | `auth`, `user` |  |  |
| `/api/user/username/check` | GET | session | — | `auth`, `user` |  |  |
| `/api/users/:user_id/events` | GET | session | — | `auth`, `profile` |  |  |
| `/api/users/:user_id/media` | GET | session | — | `auth`, `profile` |  |  |
| `/api/users/:user_id/posts` | GET | session | — | `auth`, `profile` |  |  |
| `/api/users/:user_id/profile` | GET | session | — | `auth`, `profile` |  |  |
| `/api/waitlist` | POST | public | — | `email` |  | Resend |
| `/api/webhooks/cloudinary` | POST | Cloudinary signature | — | `media-upload` |  | Cloudinary |
| `/guidelines` | GET | public | — | — |  |  |
| `/i/:invitation_id` | GET | public | — | `notifications` |  |  |
| `/join/:code` | GET | public | — | `invite-link` |  |  |
| `/open/*path` | GET | public | — | — |  |  |
| `/privacy` | GET | public | — | — |  |  |
| `/terms` | GET | public | — | — |  |  |

### Services (45)

| Service | Writes | Transactions | `notify()` | `after()` | External | Uses |
| --- | --- | --- | --- | --- | --- | --- |
| `lib/services/account.ts` | yes | 2 |  |  | Resend | `media` |
| `lib/services/activity.ts` | yes |  |  |  |  | `blocks` |
| `lib/services/agenda.ts` |  |  |  |  |  | `blocks`, `event`, `post`, `tribe` |
| `lib/services/album.ts` | yes |  |  |  |  | `blocks`, `permissions`, `role-permissions` |
| `lib/services/alpha-access.ts` | yes |  |  |  | Resend | — |
| `lib/services/auth.ts` |  |  |  |  |  | `user` |
| `lib/services/blocks.ts` | yes |  |  |  |  | — |
| `lib/services/chat.ts` | yes | 2 | yes |  |  | `blocks`, `link-preview`, `member-permissions`, `notifications`, `permissions`, `timeline` |
| `lib/services/comment.ts` | yes | 3 | yes |  |  | `blocks`, `event`, `notifications`, `post`, `role-permissions` |
| `lib/services/digest-emails.ts` | yes |  |  |  | Resend | `blocks`, `email-preferences`, `notifications` |
| `lib/services/draft.ts` | yes |  |  |  |  | — |
| `lib/services/email-preferences.ts` | yes |  |  |  | Resend | `blocks` |
| `lib/services/email.ts` |  |  |  |  | Resend | — |
| `lib/services/event-change-emails.ts` | yes |  |  | yes | Resend | `email-preferences`, `notifications` |
| `lib/services/event-reminder-emails.ts` | yes |  |  |  | Resend | `email-preferences`, `notifications` |
| `lib/services/event-routes.ts` |  |  |  |  |  | `auth`, `event-settings`, `permissions` |
| `lib/services/event-settings.ts` | yes |  | yes |  |  | `album`, `notifications`, `permissions`, `role-permissions` |
| `lib/services/event.ts` | yes | 4 | yes |  | Resend | `activity`, `blocks`, `event-change-emails`, `notifications` |
| `lib/services/invitation.ts` | yes | 3 | yes |  | Resend | `notifications` |
| `lib/services/invite-link.ts` | yes | 1 |  |  |  | `tribe` |
| `lib/services/keyset-cursor.ts` |  |  |  |  |  | — |
| `lib/services/link-preview.ts` |  |  |  |  | HTTP fetch | — |
| `lib/services/media-upload.ts` | yes | 1 |  |  | Cloudinary | `album`, `permissions`, `tribe-settings` |
| `lib/services/media.ts` | yes | 1 |  |  | Cloudinary | `album`, `blocks`, `keyset-cursor`, `permissions` |
| `lib/services/member-permissions.ts` | yes |  |  |  |  | `permissions`, `role-permissions` |
| `lib/services/members.ts` | yes |  |  |  |  | `blocks`, `draft`, `permissions`, `role-permissions` |
| `lib/services/multipart-limits.ts` |  |  |  |  |  | `tribe-settings` |
| `lib/services/notification-feed.ts` | yes |  |  |  |  | `blocks` |
| `lib/services/notifications.ts` | yes |  | yes |  |  | — |
| `lib/services/permissions.ts` |  |  |  |  |  | — |
| `lib/services/poll-votes.ts` |  |  |  |  |  | `auth`, `permissions`, `poll` |
| `lib/services/poll.ts` | yes | 2 |  |  |  | `blocks` |
| `lib/services/post.ts` | yes | 3 | yes |  |  | `album`, `blocks`, `event`, `keyset-cursor`, `notifications`, `permissions`, `poll`, `role-permissions`, `timeline`, `tribe-settings` |
| `lib/services/profile.ts` | yes | 1 |  |  |  | `album`, `blocks`, `event`, `media`, `post`, `user` |
| `lib/services/realtime.ts` |  |  |  |  | Ably | — |
| `lib/services/reports.ts` | yes |  |  |  | Resend | `album`, `blocks`, `notifications`, `permissions` |
| `lib/services/role-permissions.ts` | yes |  |  |  |  | `tribe-settings` |
| `lib/services/scheduled-notifications.ts` |  |  | yes |  | Resend | `event-reminder-emails`, `notifications` |
| `lib/services/security.ts` | yes |  |  |  |  | `auth` |
| `lib/services/timeline-routes.ts` |  |  |  |  |  | `auth`, `chat`, `timeline` |
| `lib/services/timeline.ts` | yes | 2 |  |  |  | `blocks`, `member-permissions`, `permissions` |
| `lib/services/tribe-settings.ts` | yes |  |  |  |  | — |
| `lib/services/tribe.ts` | yes | 1 |  |  |  | `draft`, `event`, `notification-feed`, `permissions`, `post`, `role-permissions`, `timeline` |
| `lib/services/user-media-upload.ts` | yes | 1 |  |  | Cloudinary | `media`, `media-upload` |
| `lib/services/user.ts` | yes |  |  |  |  | — |

<!-- GENERATED:END -->
