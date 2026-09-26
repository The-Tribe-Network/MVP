# TRI-314 · Timeline routes + `canCreateTimelines`

PRD §5.13 (tribe-mobile). Builds on TRI-313 (schema). Chat messages are TRI-315.

## Routes (all need a session → 401; non-members → 403 `NOT_A_MEMBER`)

| Route | Who | Returns |
|---|---|---|
| `GET /tribes/:id/timelines` | member | `{ timelines: TimelineForMember[], selectedTimelineId }`, in switcher order |
| `POST /tribes/:id/timelines` `{ name, type: posts\|chat, emoji?, postPermission? }` | `canCreateTimelines` | 201 `{ timeline }`, placed last |
| `PATCH /tribes/:id/timelines/:tid` `{ name?, emoji?, postPermission? }` | `canEditTribeSettings`, or its creator while they have `canCreateTimelines` | `{ timeline }`. Global can be renamed; `type` never changes |
| `DELETE /tribes/:id/timelines/:tid` | same as PATCH | `{ success }`. **Deletes every post in it** (with comments, likes, photos) — owner 2026-09-25, so a future private timeline never leaks into Global. Global → 400 `GLOBAL_TIMELINE` |
| `PUT /tribes/:id/timelines/order` `{ timelineIds }` | `canEditTribeSettings` | `{ timelines }`. Must list every timeline once → else 400 `INVALID_ORDER` |
| `PUT /tribes/:id/timelines/selected` `{ timelineId \| null }` | member | `{ selectedTimelineId }` (null = Global, resolved) |
| `POST /tribes/:id/timelines/:tid/read` | member | `{ lastReadAt }` |

Unknown timeline or another tribe's → 404 `NOT_FOUND`; not permitted → 403 `FORBIDDEN`; bad body → 400.

`TimelineForMember` = the timeline row + `unreadCount` (posts by others since the member last called `/read` on it,
or since they joined; blocked pairs excluded; chat counts come with TRI-315) + `canPost` (posts: `canPost`; chat:
`canSendMessages`; and the timeline's `postPermission`: `admins` = owner + admins).

A selection whose timeline was deleted falls back to Global (FK set null).

## Posts

- `GET /tribes/:id/posts?timelineId=` — one posts timeline's feed; **Global when omitted**. A chat or unknown
  timeline → 404 `INVALID_TIMELINE`. Other feeds (catch-up, member profile, announcement) stay tribe-wide.
- `POST /tribes/:id/posts` takes `timelineId` (Global when omitted). A chat or unknown timeline → 400
  `INVALID_TIMELINE`; an admins-only timeline for a moderator or member → 403. `canPost` still applies.

## Permission

`canCreateTimelines` in `SYSTEM_ROLE_DEFAULTS` (owner, admin true; moderator, member false), in
`tribe_role_permission` / `tribe_member_permission` (nullable = default) and both validators, so it shows up in
`effectivePermissions`, the Roles matrix and per-member overrides. The alpha is all-free: no cap on timelines.

## Migration

`tri314-timeline-routes.sql` (additive: two `can_create_timelines` columns, `timeline_read`). Development and
Production 2026-09-25.

## Verified (local, Development, 2026-09-25): 44/44

As home15 (owner), home17 (admin), home16 (member) in College Friends: list; member create 403; blank name 400;
owner creates an admins-only posts timeline, admin a chat; `canPost` per timeline (true / false / true); member post to
admins-only 403, post to chat 400; admin posts there; that feed has it, Global's doesn't; chat feed 404; unread 1 for
the member, 0 for the author, 0 after `/read`; select + restore; reorder 403 / partial 400 / ok / list follows; admin
renames Global and back; member edit 403; empty patch 400; delete Global 400; member delete 403; owner delete → its
post 404, selection falls back to Global; `effectivePermissions.canCreateTimelines` false (member) / true (admin);
select null = Global; non-member 403. Override: owner grants home16 `canCreateTimelines` → home16 creates and renames
its own; reset → rename 403, create 403. All test rows removed. `tsc` baseline unchanged (9).
