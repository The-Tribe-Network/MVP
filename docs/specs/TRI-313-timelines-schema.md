# TRI-313 · Timelines schema

PRD §5.13 (tribe-mobile), DATA-MODEL-DELTA §9b. Routes are TRI-314; chat messages TRI-315.

## Schema

- `timeline` (`lib/database/schemas/timeline.ts`): `tribe_id`, `name`, `emoji?`, `type` (`timeline_type`: `posts` | `chat`),
  `is_global`, `post_permission` (`timeline_post_permission`: `everyone` | `admins` = owner + admins), `position`,
  `created_by?`, timestamps. Partial unique index `uq_timeline_global_per_tribe`: one Global per tribe. Private timelines
  (TRI-325, paid) will add a `visibility` column and a member join table; nothing here blocks that.
- `post.timeline_id` NOT NULL → `timeline.id` **ON DELETE CASCADE**: deleting a timeline deletes its posts (owner,
  2026-09-25, reversing "move to Global": a future private timeline's posts must never leak into Global). Index `idx_post_timeline_pinned_created`.
- `tribe_member_preference.selected_timeline_id` → `timeline.id` ON DELETE SET NULL (null = Global).

## Code

- `lib/services/timeline.ts`: `createGlobalTimeline(tx, tribeId, createdBy)`, `getGlobalTimelineId(tribeId)`.
- `createTribe` creates Global in its transaction; `createPost` puts every post in Global until TRI-314 takes a
  `timelineId`. Seeds do the same. The post payload now carries `timelineId`.

## Migrations

1. `tri313-timelines.sql`: additive, run **before** deploying: enums, table, Global per tribe, nullable
   `post.timeline_id` + backfill, preference column.
2. `tri313b-post-timeline-not-null.sql`: run **after** the deploy: re-backfill anything the old code wrote, then
   `SET NOT NULL`, and recreate the FK with the cascade (Development and Production ran an earlier part 1 without it).

| Database | Part 1 | Part 2 |
|---|---|---|
| Development (`ep-divine-term-ahpw8jvi`) | 2026-09-25 (run twice, re-runnable): 8 tribes → 8 Globals, 60/60 posts moved | 2026-09-25 |
| Production (`ep-sweet-smoke-ah2qfclb`) | 2026-09-25 (0 tribes, 0 posts); cascade FK swapped in the same day | **after the deploy** (`SET NOT NULL`) |

## Verified (local, Development, 2026-09-25)

Signed in as home15: `POST /tribes` → the new tribe has a Global timeline created by the owner; `POST /tribes/:id/posts`
in the new tribe and in College Friends → `timelineId` = that tribe's Global; `GET …/posts` returns `timelineId`;
`DELETE /tribes/:id` still cascades (tribe, timeline, post gone). Test rows removed. `tsc` baseline unchanged (9, same files).

The unused `message` / `message_read` tables are empty on Development and Production; TRI-315 drops them.
