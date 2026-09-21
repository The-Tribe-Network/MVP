# TRI-9 · API 5 · Post payload: isPinned, eventId, pollId, multi-photo join

Status: implemented on the branch, migrated on Neon `Development`, uncommitted (2026-09-21) · 2026-09-21
Linear: https://linear.app/tribenetwork/issue/TRI-9
Branch: `anthonygayflor6/tri-9-api-5-post-payload-ispinned-eventid-pollid-multi-photo-join`
Sources: tribe-mobile `docs/DATA-MODEL-DELTA.md` §2 (schema), `docs/api/openapi.yaml` (`Post`, `CreatePostInput`,
`listPosts`, `createPost`, `togglePin`), `docs/PROGRESS.md` §4.12 (post polls).
Blocks: TRI-31 (feed), TRI-33 (create post). Related: TRI-32 (post detail).

The mobile contract is the source of truth for field names and shapes. This spec says how tribe-v2 gets there
and records what the contract check found.

---

## 1. Contract check (mobile client vs today's server)

Mobile is already built to the proposed contract and degrades against today's server (`derivePostKind`,
`postImages` in `src/api/posts.ts`). Nothing in mobile has to change for TRI-9 to land. Findings:

| # | Finding | Where | Resolution |
|---|---|---|---|
| 1 | Create sends `mediaId` (first photo) always, plus `mediaIds[]` only when there are 2+ photos. | mobile `create-post-screen.tsx:193-203` | Server treats `mediaIds` as canonical; `mediaId` is a legacy alias for `[mediaId]`. If both arrive, `mediaIds` wins (`mediaId` is always `mediaIds[0]`). |
| 2 | Composer allows photo-only / album-only posts (`content: ''`), but `createPostSchema` and the contract require `content.min(1)`. | mobile `create-post-screen.tsx:134`, server `lib/validations/post.ts` | D1: allow `''` when `mediaIds`, `linkedAlbumId`, `eventId` or `pollId` is present; update openapi `minLength`. |
| 3 | `createPost` attaches any `mediaId` without checking who uploaded it or which tribe it belongs to. | server `lib/services/post.ts:84-106` | Fix here (§4.1): every media row must have `tribeId` = this tribe, `uploadedBy` = caller, `postId IS NULL`. |
| 4 | `POST /posts` returns `PostWithAuthor` with no `likeCount`, `commentCount`, `isLiked`, which the contract marks required. | server `posts/route.ts:98-108` | Return `getPostByIdWithMetadata(newPost.id, user.id)`. |
| 5 | `contentType` filtering happens in JS after `limit * 3` with the caller's `offset`, so filtered pages skip and repeat rows. | server `lib/services/post.ts:215-265` | The `kind` column moves the filter into SQL (§4.2). |
| 6 | `createPost` runs post insert, media update and album insert as separate statements. | server `lib/services/post.ts:73-106` | Wrap in `db.transaction`. |
| 7 | Post polls cannot be voted on: `poll.eventId` is `NOT NULL` and the only vote route is event-scoped. | server `lib/database/schemas/poll.ts`, mobile PROGRESS §4.12 | Schema half is in this ticket (§3). Vote route is a follow-up (D2). |
| 8 | Mobile never sends `eventId`, `pollId` or `isPinned` from the composer yet. | mobile `create-post-screen.tsx` | No blocker; the fields are for later composer work and for seeds. |
| 9 | Mobile keeps pinned posts first when it inserts a created post into the cache. | mobile `src/query/posts.ts:243-244` | Server order for `sort=new` must be `is_pinned DESC, created_at DESC` (§4.2). |

---

## 2. Scope

In:
- Migration 3 of DATA-MODEL-DELTA §10: `post` columns, `post_kind` enum, `post_media`, `poll.post_id`, backfills, feed index.
- `createPost` accepts `mediaIds[]`, `eventId`, `pollId`, `isPinned`; sets `kind`.
- `getTribePosts` and `getPostByIdWithMetadata` return `kind`, `isPinned`, `media[]`, `event`, `poll`; `contentType=events|polls`.
- `POST /api/tribes/{tribe_id}/posts/{post_id}/pin` (`togglePin`).

Out (own tickets; the contract marks them proposed separately):
- `topComment`, `likers`, `tribe` on `Post`.
- `TribeWithCounts.announcement` for the TRIBE-01 banner.
- Inline `poll` on create, video upload path, `ImageRef.blurhash`.

---

## 3. Schema

As written in DATA-MODEL-DELTA §2; repeated here only where it needs a note.

`lib/database/schemas/enums.ts`
```ts
export const postKind = pgEnum("post_kind", ["text","photo","photos","event","poll","album","video","announcement"]);
```

`lib/database/schemas/post.ts` – add to `post`
```ts
isPinned: boolean("is_pinned").notNull().default(false),
pinnedAt: timestamp("pinned_at"),
pinnedBy: uuid("pinned_by").references(() => user.id, { onDelete: "set null" }),
eventId: uuid("event_id").references(() => event.id, { onDelete: "set null" }),
pollId: uuid("poll_id").references((): any => poll.id, { onDelete: "set null" }),
kind: postKind("kind").notNull().default("text"),
// indexes
feedIdx: index("idx_post_tribe_pinned_created").on(t.tribeId, t.isPinned.desc(), t.createdAt.desc()),
```
`post.ts` ↔ `poll.ts` becomes a circular import (`post.pollId` → `poll`, `poll.postId` → `post`). Use the
`(): any =>` reference form already used by `comment.parentCommentId`.

`post_media` junction: `id`, `post_id` (cascade), `media_id` (cascade), `display_order`, `unique(post_id, media_id)`,
`idx_post_media_post_id`. Add `postMediaRelations` and `post.media: many(postMedia)` in `relations.ts`.

`lib/database/schemas/poll.ts`
```ts
eventId: uuid("event_id").references(() => event.id, { onDelete: "cascade" }),   // drop .notNull()
postId:  uuid("post_id").references((): any => post.id, { onDelete: "cascade" }),
```
Raw SQL in the migration: `CHECK ((event_id IS NOT NULL) <> (post_id IS NOT NULL))`.
Every existing reader of `poll.eventId` (`lib/services/poll.ts`, event poll routes) must be checked for the
new `string | null` type.

Migration (`lib/database/migrations/tri9-post-payload.sql`, hand-written; see D3):
1. Additive DDL above.
2. `INSERT INTO post_media (post_id, media_id, display_order) SELECT post_id, id, 0 FROM media WHERE post_id IS NOT NULL ON CONFLICT DO NOTHING;`
   Keep `media.post_id`; web still reads it.
3. `UPDATE post SET kind = 'album' WHERE linked_album_id IS NOT NULL;`
   `UPDATE post SET kind = 'photo' WHERE id IN (SELECT post_id FROM post_media);` (runs second, so photo wins, matching `derivePostKind`).
4. Feed index.

Note: the backfills cannot run through `drizzle-kit push`. See D3 for how this migration is applied.

---

## 4. Service and routes

### 4.1 `createPost`

Change the signature to an options object (seven positional args today):
```ts
createPost(tribeId, userId, input: CreatePostInput): Promise<PostWithMetadata>
```

`createPostSchema` additions:
```ts
mediaIds: z.array(uuid).max(10).optional(),          // deduped, order preserved
eventId: uuid.optional().nullable(),
pollId: uuid.optional().nullable(),
isPinned: z.boolean().optional(),
```
with `superRefine`: at most one of `eventId` / `pollId` / `linkedAlbumId`; content rule per D1.

The default `db` client is the Neon HTTP driver, which has no interactive transactions; writes go through
`getDbTransaction()` (WebSocket pool), as `createTribe` does. Checks run before the transaction, writes inside it:
1. `canUserPost`, else 403.
2. `ids = dedupe(mediaIds ?? (mediaId ? [mediaId] : []))`. Load the rows; reject 400 `INVALID_MEDIA` unless every
   row has `tribeId === tribeId`, `uploadedBy === userId`, `postId === null`, `fileType === 'image'`.
3. `eventId`: event exists in this tribe, else 400 `INVALID_EVENT`.
4. `pollId`: poll exists and its event belongs to this tribe, else 400 `INVALID_POLL` (D4: share an event poll only).
5. `isPinned: true`: requires `canUserModeratePosts` and `tribe_settings.enablePinnedPosts`, else 403.
   Sets `pinnedAt = now()`, `pinnedBy = userId`.
6. `kind`, first match wins (same order as mobile `derivePostKind`):
   `isPinned → announcement`, `eventId → event`, `pollId → poll`, `ids.length > 1 → photos`,
   `ids.length === 1 → photo`, `linkedAlbumId → album`, else `text`.
7. Insert post; insert `post_media` rows with `displayOrder = index`; set `media.postId` on every row (web compat).
8. `addToAlbum`: insert one `albumMedia` row per media id (today only the single `mediaId`).

After commit: post activity (unchanged, non-blocking), then return `getPostByIdWithMetadata`.

### 4.2 `getTribePosts` / `getPostByIdWithMetadata`

Response adds, per contract:
- `kind`, `isPinned`
- `media: ImageRef[]` from `post_media` ordered by `display_order`; `image` stays as `media[0] ?? null`
- `event: AgendaItem | null`: reuse the mapper behind the agenda/events list so `myRsvp` and counts match
- `poll: Poll | null` with options, counts and the caller's votes: extract the per-poll shaping out of
  `getEventPolls` into a shared `shapePolls(pollIds, userId)`

Batch each relation with one `inArray` query over the page's ids, as the function already does for media and
albums. No per-post queries.

Filtering moves to SQL on `kind`:

| `contentType` | `WHERE` |
|---|---|
| `all` | none |
| `text` | `kind = 'text'` |
| `media` | `kind IN ('photo','photos','video')` (album shares stay out, as before) |
| `announcements` | `is_pinned = true` |
| `events` | `kind = 'event'` |
| `polls` | `kind = 'poll'` |

Drop the `limit * 3` over-fetch. `announcements` is a no-op today (treated as `all`), so this is its first real behavior.

Order: `sort=new` → `is_pinned DESC, created_at DESC`. `hot` / `top` unchanged (no pin boost).

Validate `limit` (1–50), `offset` (≥ 0), `sort` and `contentType` with zod in the route; they are cast unchecked today.

### 4.3 `POST /api/tribes/[tribe_id]/posts/[post_id]/pin`

New `pin/route.ts`, same shape as `like/route.ts`. Auth → membership → `canUserModeratePosts` and
`enablePinnedPosts` (403) → post belongs to tribe (404) → toggle.
- Pin: `isPinned = true`, `pinnedAt = now()`, `pinnedBy = user.id`.
- Unpin: `isPinned = false`, `pinnedAt = null`, `pinnedBy = null`.
- `kind` is not rewritten on pin/unpin; it stays what the content is. Only a post created pinned gets
  `announcement`. (Mobile derives the announcement card from `isPinned` first, so both paths render the same.)
- Response `{ isPinned: boolean }`.

Multiple pinned posts are allowed; the TRIBE-01 banner picks `ORDER BY pinned_at DESC LIMIT 1` (out of scope here).

---

## 5. Web compatibility

- `media.postId`, `image`, `mediaId` and every existing response field stay. All changes are additive.
- Web `CreatePost` keeps sending `mediaId`; it goes through the same `ids` path.
- Web feed will start receiving pinned posts first under `sort=new`. Check the web feed renders that acceptably.

---

## 6. Verification

tribe-v2 has no test runner, so this was checked by hand on 2026-09-21:

- **Typecheck:** `tsc --noEmit` reports 20 errors before and after; none are in files this change touches
  (settings routes, `activity.ts`, event mock data). New routes need `npx next typegen` before `tsc` sees them.
- **Migration:** applied to Neon `Development` (`ep-divine-term-ahpw8jvi`) with `run-sql.mjs`, then applied a
  second time with identical counts. 2 image media rows with a post → 2 `post_media` rows; 35 posts → 33 `text`,
  2 `photo`; 0 polls break the owner check; all 6 columns, 2 indexes and 7 constraints present.
- **Request matrix:** 31 of 31 checks passed against `next dev` + `Development`, signed in as a seeded owner and a
  seeded member. Covered: text, empty (400), legacy `mediaId`, 3 × `mediaIds` with empty content and order kept,
  already-attached / someone else's / other-tribe media (400 `INVALID_MEDIA`), 11 photos (400), `eventId`, event
  from another tribe (400), `eventId` + `pollId` (400), unknown poll (400), `pollId` with options, `isPinned` as
  member (403) and owner (201 `announcement`), pinned-first feed, all five `contentType` filters, filtered paging
  with no repeats, bad query params (400), detail `media[3]`, pin as member (403), pin on/off with `pinnedAt` /
  `pinnedBy` set then cleared and `kind` untouched, pin on unknown post (404), and stored rows (`post_media`,
  `media.post_id`, `album_media`; rejected requests left no post). Test rows were removed afterwards.

Not done: `EXPLAIN ANALYZE` at 5k posts (Development has 35), `pnpm build`, a pass through the web feed UI,
and a run from the mobile app (blocked on TRI-5 auth).

On merge: in tribe-mobile `openapi.yaml`, drop `x-status: proposed` from the shipped fields, set `togglePin`
to `existing`, enable it in `src/api/contract.ts`, regenerate the client.

---

## 7. Decisions (owner approved the recommendations, 2026-09-21)

- **D1 Empty content: allowed with an attachment.** `content` may be `''` when `mediaIds`/`mediaId`,
  `linkedAlbumId`, `eventId` or `pollId` is present; a bare empty post is still 400. openapi `CreatePostInput.content`
  drops `minLength: 1` and documents the rule. The DB column stays `NOT NULL` (empty string).
- **D2 Post poll voting: event-agnostic route, follow-up ticket.** `POST|DELETE /api/tribes/{id}/polls/{pollId}/votes`,
  with the event-scoped route kept as an alias. Not in TRI-9; TRI-9 ships the schema that unblocks it.
- **D3 Migration path: hand-written SQL, applied with `psql`.** Settled by evidence: `drizzle-kit generate` on this
  branch emitted `CREATE TABLE tribe_settings`, `event_settings`, `tribe_role_permission`, `waitlist` and more, so the
  journal is far behind the real databases, which were built with `db:push`. `db:migrate` is unusable until
  someone re-baselines the journal (separate chore). The generated files were discarded; the migration is
  `lib/database/migrations/tri9-post-payload.sql`: TRI-9 statements only, one transaction, re-runnable, run
  command in its header. After it runs, `db:push` should show no diff for these tables.
- **D4 Post-native polls: later, inline.** TRI-9 ships `pollId` as "share an event's poll" only: the poll must
  belong to an event in this tribe, `poll.post_id` stays null, and step 4.1.4 does not write to `poll`. The
  `poll.post_id` column and the XOR check still ship here. Inline `poll: { question, options[], allowMultiple,
  endsAt }` on create lands with the POST-04 poll composer and gets added to the contract then.
